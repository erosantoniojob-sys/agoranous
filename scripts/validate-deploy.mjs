import { createRequire } from 'node:module'
import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const apiRoot = join(projectRoot, 'api')
const issues = []
const supportedFunctionExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'])
const httpMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await listFiles(absolutePath))
      continue
    }

    if (entry.isSymbolicLink()) {
      issues.push(`Function symlinks are not allowed: ${relative(projectRoot, absolutePath)}`)
      continue
    }

    if (entry.isFile()) files.push(absolutePath)
  }

  return files
}

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0], 10)
if (nodeMajor !== 24) {
  issues.push(`Node.js 24 is required; found ${process.versions.node}`)
}

const require = createRequire(import.meta.url)
let typescript
try {
  typescript = require('typescript')
  if (typeof typescript.sys?.readFile !== 'function') {
    issues.push(`TypeScript ${typescript.version ?? 'unknown'} does not expose ts.sys.readFile required by the Vercel Functions builder`)
  }
} catch (error) {
  issues.push(`Unable to load TypeScript: ${error instanceof Error ? error.message : String(error)}`)
}

function hasModifier(node, kind) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === kind))
}

function hasHttpHandler(source, fileName) {
  if (!typescript?.createSourceFile) return false

  const sourceFile = typescript.createSourceFile(
    fileName,
    source,
    typescript.ScriptTarget.Latest,
    true,
  )

  return sourceFile.statements.some((statement) => {
    if (typescript.isExportAssignment(statement)) return true

    if (typescript.isFunctionDeclaration(statement) && hasModifier(statement, typescript.SyntaxKind.ExportKeyword)) {
      if (hasModifier(statement, typescript.SyntaxKind.DefaultKeyword)) return true
      return Boolean(statement.name && httpMethods.has(statement.name.text))
    }

    if (typescript.isVariableStatement(statement) && hasModifier(statement, typescript.SyntaxKind.ExportKeyword)) {
      return statement.declarationList.declarations.some(
        (declaration) => typescript.isIdentifier(declaration.name) && httpMethods.has(declaration.name.text),
      )
    }

    if (typescript.isExportDeclaration(statement) && statement.exportClause && typescript.isNamedExports(statement.exportClause)) {
      return statement.exportClause.elements.some((element) => httpMethods.has(element.name.text))
    }

    return false
  })
}

const [
  packageJsonSource,
  packageLockSource,
  nodeVersionSource,
  npmConfigSource,
  vercelConfigSource,
  rootEntries,
] = await Promise.all([
  readFile(join(projectRoot, 'package.json'), 'utf8'),
  readFile(join(projectRoot, 'package-lock.json'), 'utf8'),
  readFile(join(projectRoot, '.node-version'), 'utf8'),
  readFile(join(projectRoot, '.npmrc'), 'utf8'),
  readFile(join(projectRoot, 'vercel.json'), 'utf8'),
  readdir(projectRoot),
])

const packageJson = JSON.parse(packageJsonSource)
const packageLock = JSON.parse(packageLockSource)
const vercelConfig = JSON.parse(vercelConfigSource)

if (packageJson.devDependencies?.typescript !== '5.9.3') {
  issues.push('package.json must pin TypeScript exactly to 5.9.3')
}
if (packageLock.packages?.['node_modules/typescript']?.version !== '5.9.3') {
  issues.push('package-lock.json is not synchronized with TypeScript 5.9.3')
}
if (packageJson.devDependencies?.['@types/node'] !== '24.13.3') {
  issues.push('package.json must pin @types/node exactly to 24.13.3')
}
if (packageLock.packages?.['node_modules/@types/node']?.version !== '24.13.3') {
  issues.push('package-lock.json is not synchronized with @types/node 24.13.3')
}
if (packageJson.engines?.node !== '24.x') {
  issues.push('package.json must pin the Vercel runtime to Node.js 24.x')
}
if (nodeVersionSource.trim() !== '24') {
  issues.push('.node-version must select Node.js 24')
}
if (!npmConfigSource.split(/\r?\n/).includes('engine-strict=true')) {
  issues.push('.npmrc must enable engine-strict=true')
}
if (vercelConfig.framework !== 'vite') {
  issues.push('vercel.json must use the Vite framework preset')
}
if (vercelConfig.installCommand !== 'npm ci --include=dev') {
  issues.push('vercel.json must install the locked build dependencies with npm ci --include=dev')
}
if (vercelConfig.buildCommand !== 'npm run check' || vercelConfig.outputDirectory !== 'dist') {
  issues.push('vercel.json must run npm run check and publish dist')
}
if (!vercelConfig.rewrites?.some(
  (rewrite) => rewrite.source === '/((?!api(?:/|$)).*)' && rewrite.destination === '/index.html',
)) {
  issues.push('vercel.json must preserve /api and rewrite only SPA routes to /index.html')
}
if (rootEntries.includes('netlify') || rootEntries.includes('netlify.toml')) {
  issues.push('Obsolete Netlify configuration must not be present in the Vercel project')
}

const routeSources = await listFiles(apiRoot)
const routes = new Map()

for (const absolutePath of routeSources) {
  const extension = extname(absolutePath).toLowerCase()
  const relativePath = relative(apiRoot, absolutePath).split(sep).join('/')

  if (!supportedFunctionExtensions.has(extension)) {
    issues.push(`Unsupported or stray file inside api/: ${relativePath}`)
    continue
  }

  let routeKey = relativePath.slice(0, -extension.length).toLowerCase()
  if (routeKey === 'index') routeKey = ''
  if (routeKey.endsWith('/index')) routeKey = routeKey.slice(0, -'/index'.length)

  const existing = routes.get(routeKey)
  if (existing) {
    issues.push(`Conflicting Vercel Function routes: api/${existing} and api/${relativePath}`)
  } else {
    routes.set(routeKey, relativePath)
  }

  const source = await readFile(absolutePath, 'utf8')
  if (!hasHttpHandler(source, relativePath)) {
    issues.push(`No supported HTTP handler export found in api/${relativePath}`)
  }
}

if (issues.length > 0) {
  console.error('Deployment validation failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log(`Deployment validation passed: Node ${process.versions.node}, TypeScript 5.9.3, ${routeSources.length} unique Functions`)
