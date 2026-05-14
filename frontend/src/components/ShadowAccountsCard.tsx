import { Ghost } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const RISK_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
} as const

const RISK_TONE = {
  high: 'bg-red-950 text-red-400',
  medium: 'bg-amber-950 text-amber-400',
  low: 'bg-emerald-950 text-emerald-400',
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
      icon={<Ghost className="h-4 w-4 text-slate-400" />}
      aiExplanation={shadowAccounts.aiExplanation}
    >
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <div key={`${event.platform}-${event.url}`} className="rounded border border-white/10 p-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-slate-200">{event.platform}</p>
              <span className={`rounded px-2 py-0.5 font-mono text-xs uppercase ${RISK_TONE[event.risk]}`}>
                {event.risk}
              </span>
            </div>
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="break-all text-xs text-sky-400 hover:text-sky-300"
            >
              {event.url}
            </a>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
