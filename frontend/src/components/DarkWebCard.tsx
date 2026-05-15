import { Skull } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const TYPE_TONE = {
  CREDENTIAL_DUMP: 'border border-red-500/35 bg-red-950/35 text-red-300',
  PASTE_SITE: 'border border-warning-strong/35 bg-warning-strong/20 text-warning',
} as const

type DarkWebCardProps = {
  data: ThreatProfile['darkWeb']
}

export function DarkWebCard({ data }: DarkWebCardProps) {
  const darkWeb = data
  const events = [...darkWeb.events]

  return (
    <ThreatCard
      title={darkWeb.cardTitle}
      description={darkWeb.cardDescription}
      score={darkWeb.score}
      icon={<Skull className="h-4 w-4 text-red-400" />}
      aiExplanation={darkWeb.aiExplanation}
    >
      {events.length === 0 ? (
        <div className="rounded-xl border border-accent-lime/40 bg-accent-lime/10 p-4 text-center">
          <p className="text-2xl text-accent-lime-soft">✓</p>
          <p className="mt-1 text-accent-lime-soft">No dark web mentions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={`${event.type}-${event.date}`} className="rounded-xl border border-white/10 bg-bg-secondary/45 p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className={`rounded px-2 py-0.5 font-mono text-xs ${TYPE_TONE[event.type]}`}>
                  {event.type}
                </span>
                <span className="text-xs text-text-muted">{event.date}</span>
              </div>
              <p className="text-sm italic text-text-muted">{event.snippet}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 rounded-xl border border-white/10 bg-bg-secondary/70 p-3 text-sm text-text-muted">
        What this means: criminals have an automated list with your email that they run against banking and email login pages daily
      </div>
    </ThreatCard>
  )
}
