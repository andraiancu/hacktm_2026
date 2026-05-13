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
      icon={<Mail className="h-4 w-4 text-violet-400" />}
      aiExplanation={phishing.aiExplanation}
    >
      <div className="rounded border border-red-500 bg-red-950 p-2 text-xs text-red-400">
        ⚠ This email was generated from your real leaked data
      </div>

      <div className="mt-3 rounded-lg bg-black/50 p-4">
        <div className="space-y-1 border-b border-white/10 pb-2">
          <p className="text-xs text-slate-500">From:</p>
          <p className="font-mono text-xs text-red-400">{simulatedEmail.from}</p>
        </div>
        <div className="space-y-1 border-b border-white/10 py-2">
          <p className="text-xs text-slate-500">Subject:</p>
          <p className="text-sm font-bold text-slate-200">{simulatedEmail.subject}</p>
        </div>
        <p className="pt-2 text-sm italic leading-relaxed text-slate-400">{simulatedEmail.body}</p>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Data points used:</p>
        {simulatedEmail.dataPointsUsed.map((dataPoint) => (
          <div key={`${dataPoint.text}-${dataPoint.source}`} className="rounded border border-white/10 p-2">
            <p className="font-semibold text-amber-400">{dataPoint.text}</p>
            <p className="mt-1 text-xs text-slate-500">{dataPoint.source}</p>
          </div>
        ))}
      </div>
    </ThreatCard>
  )
}
