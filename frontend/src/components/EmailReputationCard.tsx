import { AtSign } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const TONE = {
  high: 'border border-red-500/35 bg-red-950/35 text-red-300',
  medium: 'border border-warning-strong/35 bg-warning-strong/20 text-warning',
  low: 'border border-accent-lime/35 bg-accent-lime/15 text-accent-lime-soft',
  warning: 'border border-warning-strong/35 bg-warning-strong/20 text-warning',
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
      icon={<AtSign className="h-4 w-4 text-warning" />}
      aiExplanation={emailReputation.aiExplanation}
    >
      <div className="space-y-2">
        <div className="space-y-2 border-b border-white/10 pb-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-text-primary">Domain Health</p>
            <span
              className={`rounded-lg px-2 py-0.5 font-mono text-xs uppercase ${TONE[emailReputation.domainHealth]}`}
            >
              {emailReputation.domainHealth}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-text-primary">Spoofing Risk</p>
            <span
              className={`rounded-lg px-2 py-0.5 font-mono text-xs uppercase ${TONE[emailReputation.spoofingRisk]}`}
            >
              {emailReputation.spoofingRisk}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-text-primary">Disposable Provider</p>
            <p className="text-text-muted">
              {emailReputation.disposableProviderDetected ? 'Detected' : 'Not detected'}
            </p>
          </div>
        </div>

        {emailReputation.riskSignals.map((signal) => (
          <div key={signal} className="space-y-2 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
            <p className="text-text-secondary">{signal}</p>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
