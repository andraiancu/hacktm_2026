import { Ghost } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const RISK_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
} as const

const RISK_TONE = {
  high: 'border border-red-500/35 bg-red-950/35 text-red-300',
  medium: 'border border-warning-strong/35 bg-warning-strong/20 text-warning',
  low: 'border border-accent-lime/35 bg-accent-lime/15 text-accent-lime-soft',
} as const

type ShadowAccountsCardProps = {
  data: ThreatProfile['shadowAccounts']
}

export function ShadowAccountsCard({ data }: ShadowAccountsCardProps) {
  const shadowAccounts = data
  const sortedEvents = [...shadowAccounts.events].sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk])

  return (
    <ThreatCard
      title={shadowAccounts.cardTitle}
      description={shadowAccounts.cardDescription}
      score={shadowAccounts.score}
      icon={<Ghost className="h-4 w-4 text-text-muted" />}
      aiExplanation={shadowAccounts.aiExplanation}
    >
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <div key={`${event.platform}-${event.url}`} className="rounded-xl border border-white/10 bg-bg-secondary/45 p-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-text-primary">{event.platform}</p>
              <span className={`rounded-lg px-2 py-0.5 font-mono text-xs uppercase ${RISK_TONE[event.risk]}`}>
                {event.risk}
              </span>
            </div>
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="break-all text-xs text-accent-lime-soft hover:text-accent-lime"
            >
              {event.url}
            </a>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
