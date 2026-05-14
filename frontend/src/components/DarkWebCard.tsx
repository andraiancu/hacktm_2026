import { Skull } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const TYPE_TONE = {
  CREDENTIAL_DUMP: 'bg-red-950 text-red-400',
  PASTE_SITE: 'bg-amber-950 text-amber-400',
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
      icon={<Skull className="h-4 w-4 text-red-500" />}
      aiExplanation={darkWeb.aiExplanation}
    >
      {events.length === 0 ? (
        <div className="rounded border border-emerald-700/40 bg-emerald-950/30 p-4 text-center">
          <p className="text-2xl text-emerald-400">✓</p>
          <p className="mt-1 text-emerald-400">No dark web mentions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={`${event.type}-${event.date}`} className="rounded border border-white/10 p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className={`rounded px-2 py-0.5 font-mono text-xs ${TYPE_TONE[event.type]}`}>
                  {event.type}
                </span>
                <span className="text-xs text-slate-500">{event.date}</span>
              </div>
              <p className="text-sm italic text-slate-500">{event.snippet}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 rounded bg-black/50 p-3 text-sm text-slate-400">
        What this means: criminals have an automated list with your email that they run against banking and email login pages daily
      </div>
    </ThreatCard>
  )
}
