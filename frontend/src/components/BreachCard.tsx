import { ShieldAlert } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

type BreachCardProps = {
  data: ThreatProfile['breaches']
}

export function BreachCard({ data }: BreachCardProps) {
  const breaches = data

  return (
    <ThreatCard
      title={breaches.cardTitle}
      description={breaches.cardDescription}
      score={breaches.score}
      icon={<ShieldAlert className="h-4 w-4 text-red-500" />}
      aiExplanation={breaches.aiExplanation}
    >
      <div className="space-y-2">
        {breaches.events.map((event) => (
          <div key={`${event.breach}-${event.date}`} className="space-y-2 border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-slate-200">{event.breach}</p>
              <p className="text-slate-500">{event.date}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.dataTypes.map((dataType) => (
                <span
                  key={`${event.breach}-${dataType}`}
                  className="rounded bg-red-950 px-2 py-0.5 font-mono text-xs text-red-400"
                >
                  {dataType}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
