import { AtSign } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const TONE = {
  high: 'bg-red-950 text-red-400',
  medium: 'bg-amber-950 text-amber-400',
  low: 'bg-emerald-950 text-emerald-400',
  warning: 'bg-amber-950 text-amber-400',
} as const

type EmailReputationCardProps = {
  data: ThreatProfile['emailReputation']
}

export function EmailReputationCard({ data }: EmailReputationCardProps) {
  const emailReputation = data

  return (
    <ThreatCard
      title={emailReputation.cardTitle}
      description={emailReputation.cardDescription}
      score={emailReputation.score}
      icon={<AtSign className="h-4 w-4 text-violet-400" />}
      aiExplanation={emailReputation.aiExplanation}
    >
      <div className="space-y-2">
        <div className="space-y-2 border-b border-white/5 pb-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-slate-200">Domain Health</p>
            <span className={`rounded px-2 py-0.5 font-mono text-xs uppercase ${TONE[emailReputation.domainHealth]}`}>
              {emailReputation.domainHealth}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-slate-200">Spoofing Risk</p>
            <span className={`rounded px-2 py-0.5 font-mono text-xs uppercase ${TONE[emailReputation.spoofingRisk]}`}>
              {emailReputation.spoofingRisk}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-slate-200">Disposable Provider</p>
            <p className="text-slate-500">
              {emailReputation.disposableProviderDetected ? 'Detected' : 'Not detected'}
            </p>
          </div>
        </div>

        {emailReputation.riskSignals.map((signal) => (
          <div key={signal} className="space-y-2 border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
            <p className="text-slate-300">{signal}</p>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
