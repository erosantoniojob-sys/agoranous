import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const books = JSON.parse(readFileSync(new URL('../src/data/classicBooks.json', import.meta.url), 'utf8'))

test('the published collection has exactly 1,000 distinct catalog records and balanced areas', () => {
  assert.equal(books.length, 1000)
  assert.equal(new Set(books.map(book => book.id)).size, 1000)
  const counts = Object.fromEntries(['Literatura', 'Filosofia', 'Literatura cristã'].map(category => [category, books.filter(book => book.category === category).length]))
  assert.deepEqual(counts, { Literatura: 650, Filosofia: 200, 'Literatura cristã': 150 })
  assert.ok(new Set(books.map(book => book.author)).size >= 200)
})

test('every record identifies an author, edition language, subjects, source and matching cover', () => {
  const keys = new Set()
  for (const book of books) {
    assert.ok(book.title.trim() && book.author.trim(), book.id)
    assert.ok(['en', 'pt'].includes(book.language), book.id)
    assert.ok(book.subjects.length && book.themes.includes(book.category), book.id)
    const id = book.id.replace('gutenberg:', '')
    assert.equal(book.sourceUrl, `https://www.gutenberg.org/ebooks/${id}`)
    assert.equal(book.cover, `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`)
    const key = `${book.title}|${book.author}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    assert.ok(!keys.has(key), `Repeated title and author: ${key}`)
    keys.add(key)
    assert.ok(!/\b(?:vol\.|volume\s+\d|quotations|quotes and images)\b/i.test(book.title), book.title)
  }
})

test('essential Portuguese classics and different intellectual traditions are represented', () => {
  for (const id of ['gutenberg:55752', 'gutenberg:54829', 'gutenberg:67740', 'gutenberg:150', 'gutenberg:2680', 'gutenberg:3330', 'gutenberg:1653', 'gutenberg:3296', 'gutenberg:130']) {
    assert.ok(books.some(book => book.id === id), `Missing reference: ${id}`)
  }
  assert.equal(books.filter(book => /marco aurélio/i.test(book.author)).length, 1)
  assert.equal(books.filter(book => /divine comedy/i.test(book.title)).length, 1)
})
