import { X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { CardModal } from '~/components/CardModal'

type ThreatCardProps = {
  title: string
  description: string
  score: number
  icon: ReactNode
  aiExplanation: string
  children: ReactNode
  accentColor?: string
}

export function ThreatCard({
  title,
  description,
  score,
  icon,
  aiExplanation,
  children,
  accentColor,
}: ThreatCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const scoreTone =
    accentColor ??
    (score >= 7
      ? 'border-red-500/60 text-red-400'
      : score >= 4
        ? 'border-warning-strong/60 text-warning'
        : 'border-accent-lime/60 text-accent-lime-soft')

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsOpen(true)
          }
        }}
        className="relative cursor-pointer rounded-xl border border-white/10 bg-bg-card p-5 backdrop-blur-md transition-colors hover:border-border-strong/70"
      >
        <CornerAccents />

        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-accent-lime-soft">{icon}</span>
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-text-primary">{title}</h3>
          </div>
          <span
            className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${scoreTone}`}
          >
            {score}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-text-muted">{description}</p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-lime-soft">
          View details →
        </p>
      </article>

      <CardModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 cursor-pointer text-text-muted transition-colors hover:text-text-secondary"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <span className="mt-1 text-accent-lime-soft [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
            <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
          </div>
          <span className={`inline-block rounded-xl border px-3 py-1 text-3xl font-bold ${scoreTone}`}>
            {score}
          </span>
          <p className="text-base leading-relaxed text-text-muted">{description}</p>

          <div className="border-t border-white/10 pt-5">
            <div className="space-y-3 text-sm leading-relaxed text-text-muted [&_a]:text-sm [&_li]:text-sm [&_p]:text-sm [&_span]:text-sm">
              {children}
            </div>
            <div className="mt-5 rounded-xl border border-white/10 bg-bg-secondary/85 p-4 backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-lime-soft">
                🤖 AI Analysis
              </p>
              <p className="mt-2 text-sm italic leading-relaxed text-text-muted">{aiExplanation}</p>
            </div>
          </div>
        </div>
      </CardModal>
    </>
  )
}

function CornerAccents() {
  return (
    <>
      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-border-strong/80" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-border-strong/80" />
    </>
  )
}
