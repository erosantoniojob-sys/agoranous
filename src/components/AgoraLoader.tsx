import { ClassicArchLogoIcon } from './ClassicArchLogo'

type AgoraLoaderProps = {
  message?: string
  detail?: string
  compact?: boolean
}

export function AgoraLoader({ message = 'Abrindo a Ágora', detail = 'Organizando seu percurso…', compact = false }: AgoraLoaderProps) {
  return (
    <div className={`agora-loader ${compact ? 'agora-loader--compact' : ''}`} role="status" aria-live="polite">
      <div className="agora-loader__stage" aria-hidden="true">
        <span className="agora-loader__orbit agora-loader__orbit--outer" />
        <span className="agora-loader__orbit agora-loader__orbit--inner" />
        <span className="agora-loader__logo"><ClassicArchLogoIcon className="h-8 w-8" /></span>
        <span className="agora-loader__point agora-loader__point--one" />
        <span className="agora-loader__point agora-loader__point--two" />
        <span className="agora-loader__point agora-loader__point--three" />
      </div>
      <div className="text-center">
        <p className="font-serif text-lg font-bold text-text-primary">{message}</p>
        <p className="mt-1 text-[11px] tracking-wide text-text-secondary">{detail}</p>
      </div>
    </div>
  )
}
