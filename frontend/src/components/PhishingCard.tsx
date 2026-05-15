import { Mail } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

type PhishingCardProps = {
  data: ThreatProfile['phishing']
}

export function PhishingCard({ data }: PhishingCardProps) {
  const phishing = data
  const { simulatedEmail } = phishing

  return (
    <ThreatCard
      title={phishing.cardTitle}
      description={phishing.cardDescription}
      score={phishing.score}
      icon={<Mail className="h-4 w-4 text-warning" />}
      aiExplanation={phishing.aiExplanation}
    >
      <div className="rounded-xl border border-warning-strong/40 bg-warning-strong/20 p-2 text-xs text-warning">
        ⚠ This email was generated from your real leaked data
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-bg-secondary/75 p-4 backdrop-blur-sm">
        <div className="space-y-1 border-b border-white/10 pb-2">
          <p className="text-xs text-text-muted">From:</p>
          <p className="font-mono text-xs text-warning">{simulatedEmail.from}</p>
        </div>
        <div className="space-y-1 border-b border-white/10 py-2">
          <p className="text-xs text-text-muted">Subject:</p>
          <p className="text-sm font-bold text-text-primary">{simulatedEmail.subject}</p>
        </div>
        <p className="pt-2 text-sm italic leading-relaxed text-text-muted">{simulatedEmail.body}</p>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">Data points used:</p>
        {simulatedEmail.dataPointsUsed.map((dataPoint) => (
          <div
            key={`${dataPoint.text}-${dataPoint.source}`}
            className="rounded-xl border border-white/10 bg-bg-secondary/45 p-2"
          >
            <p className="font-semibold text-warning">{dataPoint.text}</p>
            <p className="mt-1 text-xs text-text-muted">{dataPoint.source}</p>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
