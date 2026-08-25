import { useId, useState, type CSSProperties } from 'react'

/** A domain in the user's intellectual map. `progress` is expressed from 0 to 100. */
export interface KnowledgeRealm {
  /** A stable id is recommended when the realm can be reordered. */
  id?: string
  name: string
  level: number
  progress: number
  accent: string
}

export interface KnowledgeOrbitProps {
  realms: readonly KnowledgeRealm[]
  /** Lets a parent link the selected realm to a detail view, if desired. */
  onRealmSelect?: (realm: KnowledgeRealm) => void
  className?: string
  heading?: string
  description?: string
}

type OrbitRealm = KnowledgeRealm & {
  key: string
  progressValue: number
  levelValue: number
  x: number
  y: number
  size: number
}

type OrbitStyle = CSSProperties & Record<`--${string}`, string | number>

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper)

const safeNumber = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback

/**
 * Places the first eight realms on the outer orbit. Extra realms are still
 * usable and move to the inner orbits instead of being silently discarded.
 */
const getRealmPosition = (index: number, total: number) => {
  if (total <= 8) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(total, 1)
    return {
      x: 50 + Math.cos(angle) * 40,
      y: 50 + Math.sin(angle) * 37,
    }
  }

  const ring = index < 8 ? 0 : index < 16 ? 1 : 2
  const start = ring === 0 ? 0 : ring === 1 ? 8 : 16
  const count = ring === 0 ? Math.min(total, 8) : ring === 1 ? Math.min(total - 8, 8) : total - 16
  const angle = -Math.PI / 2 + (Math.PI * 2 * (index - start)) / Math.max(count, 1)
  const radius = ring === 0 ? { x: 42, y: 38 } : ring === 1 ? { x: 30, y: 27 } : { x: 21, y: 19 }

  return {
    x: 50 + Math.cos(angle) * radius.x,
    y: 50 + Math.sin(angle) * radius.y,
  }
}

const toOrbitRealm = (realm: KnowledgeRealm, index: number, total: number): OrbitRealm => {
  const position = getRealmPosition(index, total)
  const progressValue = Math.round(clamp(safeNumber(realm.progress, 0), 0, 100))

  return {
    ...realm,
    key: realm.id ?? `${realm.name}-${index}`,
    levelValue: Math.max(0, Math.round(safeNumber(realm.level, 0))),
    progressValue,
    size: 46 + progressValue * 0.31,
    ...position,
  }
}

/**
 * A dependency-free interactive knowledge map. The orbit artwork is SVG; its
 * movement, depth and progress rings are CSS-only, with a reduced-motion mode.
 */
export const KnowledgeOrbit = ({
  realms,
  onRealmSelect,
  className,
  heading = 'Mapa do conhecimento',
  description = 'Cada domínio cresce à medida que você o explora.',
}: KnowledgeOrbitProps) => {
  const orbitId = useId().replace(/:/g, '')
  const visualRealms = realms.map((realm, index) => toOrbitRealm(realm, index, realms.length))
  const [selectedKey, setSelectedKey] = useState<string | null>(() => visualRealms[0]?.key ?? null)
  const selectedRealm = visualRealms.find((realm) => realm.key === selectedKey) ?? visualRealms[0]
  const headingId = `${orbitId}-heading`
  const descriptionId = `${orbitId}-description`

  const selectRealm = (realm: OrbitRealm) => {
    setSelectedKey(realm.key)
    onRealmSelect?.(realm)
  }

  return (
    <section
      className={['knowledge-orbit', className].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <style>{knowledgeOrbitStyles}</style>

      <header className="knowledge-orbit__header">
        <div>
          <p className="knowledge-orbit__eyebrow">Universo intelectual</p>
          <h2 id={headingId}>{heading}</h2>
          <p className="knowledge-orbit__description" id={descriptionId}>
            {description}
          </p>
        </div>
        <p className="knowledge-orbit__count" aria-label={`${visualRealms.length} domínios mapeados`}>
          <span aria-hidden="true">✦</span>
          {visualRealms.length} {visualRealms.length === 1 ? 'domínio' : 'domínios'}
        </p>
      </header>

      <div className="knowledge-orbit__viewport">
        <svg
          className="knowledge-orbit__sky"
          viewBox="0 0 760 520"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id={`${orbitId}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f7df96" stopOpacity="0.24" />
              <stop offset="46%" stopColor="#ba913d" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ba913d" stopOpacity="0" />
            </radialGradient>
            <filter id={`${orbitId}-blur`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <linearGradient id={`${orbitId}-orbit`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#ecd38b" stopOpacity="0.07" />
              <stop offset="46%" stopColor="#ecd38b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8bacc5" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          <ellipse cx="380" cy="260" rx="248" ry="184" fill={`url(#${orbitId}-glow)`} filter={`url(#${orbitId}-blur)`} />
          <g className="knowledge-orbit__rings" stroke={`url(#${orbitId}-orbit)`} fill="none">
            <ellipse cx="380" cy="260" rx="328" ry="161" transform="rotate(-11 380 260)" />
            <ellipse cx="380" cy="260" rx="252" ry="116" transform="rotate(18 380 260)" />
            <ellipse cx="380" cy="260" rx="159" ry="76" transform="rotate(-19 380 260)" />
          </g>
          <g className="knowledge-orbit__connections" fill="none">
            <path d="M116 169C224 251 288 167 380 260S565 362 664 311" />
            <path d="M157 387C253 290 345 386 437 275S549 162 644 196" />
          </g>
          <g className="knowledge-orbit__stars" fill="#f3dfa4">
            <circle cx="92" cy="95" r="1.4" />
            <circle cx="169" cy="314" r="1" />
            <circle cx="239" cy="77" r="1.2" />
            <circle cx="525" cy="102" r="1.2" />
            <circle cx="671" cy="124" r="1.5" />
            <circle cx="704" cy="379" r="1" />
            <circle cx="560" cy="444" r="1.2" />
            <circle cx="212" cy="430" r="1.3" />
            <circle cx="72" cy="406" r="1" />
            <circle cx="343" cy="433" r="0.9" />
          </g>
        </svg>

        <div className="knowledge-orbit__center" aria-hidden="true">
          <span className="knowledge-orbit__center-mark">✦</span>
          <strong>Àgora</strong>
          <span>seu centro</span>
        </div>

        {visualRealms.length > 0 ? (
          <div className="knowledge-orbit__realms" aria-label="Domínios de conhecimento">
            {visualRealms.map((realm, index) => {
              const isSelected = realm.key === selectedRealm?.key
              const realmStyle: OrbitStyle = {
                '--ko-accent': realm.accent || '#d8b867',
                '--ko-progress': `${realm.progressValue}%`,
                '--ko-size': `${realm.size}px`,
                '--ko-x': `${realm.x}%`,
                '--ko-y': `${realm.y}%`,
                '--ko-delay': `${index * 0.7}s`,
              }

              return (
                <button
                  className="knowledge-orbit__realm"
                  data-selected={isSelected || undefined}
                  key={realm.key}
                  onClick={() => selectRealm(realm)}
                  style={realmStyle}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${realm.name}: nível ${realm.levelValue}, ${realm.progressValue}% explorado`}
                >
                  <span className="knowledge-orbit__planet" aria-hidden="true">
                    <span className="knowledge-orbit__planet-light" />
                    <span className="knowledge-orbit__planet-level">{realm.levelValue}</span>
                  </span>
                  <span className="knowledge-orbit__realm-name">{realm.name}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="knowledge-orbit__empty">Seus próximos estudos vão iluminar este mapa.</p>
        )}
      </div>

      <footer className="knowledge-orbit__insight" aria-live="polite">
        {selectedRealm ? (
          <>
            <span className="knowledge-orbit__insight-orb" style={{ '--ko-accent': selectedRealm.accent || '#d8b867' } as OrbitStyle} aria-hidden="true" />
            <div>
              <p>Domínio em foco</p>
              <strong>{selectedRealm.name}</strong>
            </div>
            <dl>
              <div>
                <dt>Nível</dt>
                <dd>{selectedRealm.levelValue}</dd>
              </div>
              <div>
                <dt>Explorado</dt>
                <dd>{selectedRealm.progressValue}%</dd>
              </div>
            </dl>
          </>
        ) : (
          <span>Adicione uma obra para começar a formar seus domínios.</span>
        )}
      </footer>
    </section>
  )
}

const knowledgeOrbitStyles = `
  .knowledge-orbit {
    --ko-ink: #f7f1e3;
    --ko-muted: #9eabb5;
    --ko-line: rgba(232, 211, 152, .18);
    --ko-surface: rgba(12, 23, 35, .78);
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid rgba(229, 207, 145, .18);
    border-radius: 1.5rem;
    padding: clamp(1rem, 2.4vw, 1.55rem);
    color: var(--ko-ink);
    background:
      radial-gradient(circle at 50% 44%, rgba(198, 155, 63, .12), transparent 27%),
      linear-gradient(135deg, rgba(24, 42, 57, .88), rgba(8, 17, 28, .94) 65%);
    box-shadow: 0 24px 60px rgba(0, 0, 0, .2), inset 0 1px rgba(255, 255, 255, .05);
  }

  .knowledge-orbit::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    content: '';
    opacity: .55;
    background-image:
      radial-gradient(circle at 13% 18%, rgba(244, 224, 161, .65) 0 1px, transparent 1.5px),
      radial-gradient(circle at 86% 10%, rgba(177, 211, 228, .52) 0 1px, transparent 1.5px),
      radial-gradient(circle at 76% 73%, rgba(244, 224, 161, .38) 0 1px, transparent 1.4px);
    background-size: 154px 138px, 210px 176px, 260px 210px;
    pointer-events: none;
  }

  .knowledge-orbit__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }

  .knowledge-orbit__eyebrow,
  .knowledge-orbit__description,
  .knowledge-orbit__count,
  .knowledge-orbit__insight p,
  .knowledge-orbit__insight dt {
    margin: 0;
    color: var(--ko-muted);
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
  }

  .knowledge-orbit__eyebrow {
    margin-bottom: .35rem;
    color: #e6cd82;
    font-size: .64rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .knowledge-orbit h2 {
    margin: 0;
    font-family: var(--font-serif, Georgia, serif);
    font-size: clamp(1.25rem, 2.2vw, 1.72rem);
    font-weight: 500;
    letter-spacing: -.025em;
  }

  .knowledge-orbit__description {
    max-width: 34rem;
    margin-top: .38rem;
    font-size: .82rem;
    line-height: 1.45;
  }

  .knowledge-orbit__count {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: .4rem;
    padding: .45rem .62rem;
    border: 1px solid rgba(232, 211, 152, .13);
    border-radius: 999px;
    background: rgba(4, 12, 21, .25);
    font-size: .69rem;
    white-space: nowrap;
  }

  .knowledge-orbit__count span {
    color: #eccb72;
    font-size: .72rem;
  }

  .knowledge-orbit__viewport {
    position: relative;
    min-height: 19rem;
    margin-top: .2rem;
    aspect-ratio: 1.46 / 1;
    overflow: hidden;
    border-radius: 1rem;
    mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  }

  .knowledge-orbit__sky {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .knowledge-orbit__rings ellipse {
    stroke-width: 1.05;
    stroke-dasharray: 3 8;
    transform-box: fill-box;
    transform-origin: center;
    animation: knowledge-orbit-drift 28s ease-in-out infinite alternate;
  }

  .knowledge-orbit__rings ellipse:nth-child(2) {
    animation-delay: -8s;
    animation-duration: 34s;
  }

  .knowledge-orbit__rings ellipse:nth-child(3) {
    animation-delay: -15s;
    animation-duration: 24s;
  }

  .knowledge-orbit__connections path {
    stroke: rgba(164, 191, 205, .19);
    stroke-width: .9;
    stroke-dasharray: 2 8;
    animation: knowledge-orbit-signal 9s linear infinite;
  }

  .knowledge-orbit__connections path:last-child {
    stroke: rgba(229, 199, 119, .17);
    animation-delay: -4.5s;
  }

  .knowledge-orbit__stars {
    animation: knowledge-orbit-stars 7s ease-in-out infinite alternate;
  }

  .knowledge-orbit__center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: grid;
    width: clamp(5.7rem, 14vw, 8.1rem);
    aspect-ratio: 1;
    place-content: center;
    gap: .08rem;
    overflow: hidden;
    border: 1px solid rgba(247, 221, 145, .56);
    border-radius: 50%;
    color: #fff8e7;
    text-align: center;
    transform: translate(-50%, -50%);
    background:
      radial-gradient(circle at 35% 25%, rgba(255, 248, 218, .8), transparent 8%),
      radial-gradient(circle at 40% 37%, #d6b35f, #8d6a2a 43%, #2c2418 72%);
    box-shadow: 0 0 0 7px rgba(222, 184, 85, .055), 0 0 30px rgba(219, 172, 66, .38), inset -12px -14px 24px rgba(0, 0, 0, .44);
  }

  .knowledge-orbit__center::after {
    position: absolute;
    inset: 9%;
    border: 1px solid rgba(255, 246, 205, .22);
    border-radius: inherit;
    content: '';
  }

  .knowledge-orbit__center-mark {
    color: #fff4c9;
    font-size: .72rem;
    line-height: 1;
    text-shadow: 0 0 10px rgba(255, 236, 169, .92);
  }

  .knowledge-orbit__center strong {
    position: relative;
    z-index: 1;
    font-family: var(--font-serif, Georgia, serif);
    font-size: clamp(.95rem, 2vw, 1.25rem);
    font-weight: 500;
  }

  .knowledge-orbit__center > span:last-child {
    position: relative;
    z-index: 1;
    color: rgba(255, 247, 222, .74);
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
    font-size: .57rem;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .knowledge-orbit__realms {
    position: absolute;
    inset: 0;
  }

  .knowledge-orbit__realm {
    position: absolute;
    top: var(--ko-y);
    left: var(--ko-x);
    z-index: 2;
    display: grid;
    width: max(5.3rem, var(--ko-size));
    place-items: center;
    gap: .3rem;
    padding: .15rem;
    border: 0;
    color: #e9edf0;
    font: inherit;
    text-align: center;
    cursor: pointer;
    transform: translate(-50%, -50%);
    background: transparent;
    transition: transform 240ms ease, filter 240ms ease;
  }

  .knowledge-orbit__realm:hover,
  .knowledge-orbit__realm[data-selected] {
    z-index: 3;
    filter: brightness(1.13);
    transform: translate(-50%, calc(-50% - 3px));
  }

  .knowledge-orbit__realm:focus-visible {
    z-index: 4;
    outline: 2px solid #fff0b5;
    outline-offset: 4px;
    border-radius: .9rem;
  }

  .knowledge-orbit__planet {
    position: relative;
    display: grid;
    width: clamp(2.85rem, var(--ko-size), 5rem);
    aspect-ratio: 1;
    place-items: center;
    overflow: visible;
    border: 1px solid color-mix(in srgb, var(--ko-accent) 58%, white);
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 23%, rgba(255, 255, 255, .72), transparent 7%),
      radial-gradient(circle at 36% 32%, var(--ko-accent), color-mix(in srgb, var(--ko-accent) 31%, #142130) 58%, #081019 100%);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ko-accent) 8%, transparent), 0 0 20px color-mix(in srgb, var(--ko-accent) 35%, transparent), inset -9px -11px 15px rgba(0, 0, 0, .5);
    transition: box-shadow 240ms ease, transform 240ms ease;
  }

  .knowledge-orbit__planet::before {
    position: absolute;
    z-index: -1;
    inset: -5px;
    padding: 2px;
    border-radius: inherit;
    content: '';
    background: conic-gradient(from -90deg, var(--ko-accent) 0 var(--ko-progress), rgba(201, 213, 218, .16) var(--ko-progress) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .knowledge-orbit__planet::after {
    position: absolute;
    z-index: -1;
    width: 140%;
    height: 34%;
    border: 1px solid color-mix(in srgb, var(--ko-accent) 52%, transparent);
    border-right-color: transparent;
    border-left-color: transparent;
    border-radius: 50%;
    content: '';
    transform: rotate(-20deg);
    opacity: .72;
  }

  .knowledge-orbit__realm:hover .knowledge-orbit__planet,
  .knowledge-orbit__realm[data-selected] .knowledge-orbit__planet {
    transform: scale(1.07);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--ko-accent) 13%, transparent), 0 0 29px color-mix(in srgb, var(--ko-accent) 52%, transparent), inset -9px -11px 15px rgba(0, 0, 0, .48);
  }

  .knowledge-orbit__planet-light {
    position: absolute;
    top: 17%;
    left: 20%;
    width: 21%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgba(255, 255, 255, .42);
    filter: blur(1px);
  }

  .knowledge-orbit__planet-level {
    position: relative;
    display: grid;
    min-width: 1.4rem;
    height: 1.4rem;
    place-items: center;
    border: 1px solid rgba(255, 251, 235, .48);
    border-radius: 999px;
    color: #fffdf5;
    background: rgba(4, 10, 17, .5);
    box-shadow: 0 2px 7px rgba(0, 0, 0, .28);
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
    font-size: .64rem;
    font-weight: 700;
    line-height: 1;
  }

  .knowledge-orbit__realm-name {
    max-width: 8ch;
    overflow: hidden;
    color: rgba(245, 242, 232, .88);
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
    font-size: clamp(.62rem, 1.3vw, .75rem);
    font-weight: 650;
    letter-spacing: .01em;
    line-height: 1.1;
    text-overflow: ellipsis;
    text-shadow: 0 2px 8px #07101a;
    white-space: nowrap;
  }

  .knowledge-orbit__empty {
    position: absolute;
    top: 71%;
    left: 50%;
    width: min(17rem, 78%);
    margin: 0;
    color: var(--ko-muted);
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
    font-size: .78rem;
    line-height: 1.5;
    text-align: center;
    transform: translateX(-50%);
  }

  .knowledge-orbit__insight {
    display: flex;
    align-items: center;
    gap: .68rem;
    min-height: 3.7rem;
    padding: .68rem .76rem;
    border: 1px solid rgba(232, 211, 152, .12);
    border-radius: .9rem;
    color: var(--ko-muted);
    background: rgba(3, 10, 17, .27);
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
    font-size: .76rem;
  }

  .knowledge-orbit__insight-orb {
    display: block;
    flex: 0 0 auto;
    width: 2rem;
    aspect-ratio: 1;
    border: 1px solid color-mix(in srgb, var(--ko-accent) 65%, white);
    border-radius: 50%;
    background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, .72), transparent 10%), var(--ko-accent);
    box-shadow: inset -6px -6px 9px rgba(0, 0, 0, .36), 0 0 13px color-mix(in srgb, var(--ko-accent) 35%, transparent);
  }

  .knowledge-orbit__insight p {
    margin-bottom: .1rem;
    font-size: .61rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .knowledge-orbit__insight strong {
    color: #f6f0df;
    font-family: var(--font-serif, Georgia, serif);
    font-size: .98rem;
    font-weight: 500;
  }

  .knowledge-orbit__insight dl {
    display: flex;
    gap: .95rem;
    margin: 0 0 0 auto;
  }

  .knowledge-orbit__insight dl > div {
    display: grid;
    gap: .08rem;
  }

  .knowledge-orbit__insight dt {
    font-size: .56rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .knowledge-orbit__insight dd {
    margin: 0;
    color: #e9d490;
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
    font-size: .78rem;
    font-weight: 700;
  }

  @keyframes knowledge-orbit-drift {
    from { transform: rotate(-2deg) scale(1); }
    to { transform: rotate(2deg) scale(1.018); }
  }

  @keyframes knowledge-orbit-signal {
    to { stroke-dashoffset: -80; }
  }

  @keyframes knowledge-orbit-stars {
    from { opacity: .35; }
    to { opacity: .9; }
  }

  @media (max-width: 38rem) {
    .knowledge-orbit { border-radius: 1.25rem; }

    .knowledge-orbit__header { gap: .65rem; }

    .knowledge-orbit__description { max-width: 18rem; font-size: .74rem; }

    .knowledge-orbit__count { padding: .38rem .5rem; font-size: .61rem; }

    .knowledge-orbit__viewport {
      min-height: 17.5rem;
      aspect-ratio: 1 / 1;
      margin-top: .5rem;
      mask-image: linear-gradient(to right, transparent, #000 3%, #000 97%, transparent);
    }

    .knowledge-orbit__center { width: 5.8rem; }

    .knowledge-orbit__realm { width: max(4.3rem, var(--ko-size)); gap: .23rem; }

    .knowledge-orbit__planet { width: clamp(2.4rem, var(--ko-size), 3.85rem); }

    .knowledge-orbit__planet-level { min-width: 1.2rem; height: 1.2rem; font-size: .55rem; }

    .knowledge-orbit__realm-name { max-width: 7ch; font-size: .61rem; }
  }

  @media (max-width: 24rem) {
    .knowledge-orbit__description { display: none; }

    .knowledge-orbit__viewport { min-height: 16rem; }

    .knowledge-orbit__insight dl { gap: .55rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .knowledge-orbit *,
    .knowledge-orbit *::before,
    .knowledge-orbit *::after {
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }
`
