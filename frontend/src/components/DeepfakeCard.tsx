import { Video } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const RISK_TONE = {
  high: 'border-red-500/60 text-red-400',
  medium: 'border-warning-strong/60 text-warning',
  low: 'border-accent-lime/60 text-accent-lime-soft',
} as const

type DeepfakeCardProps = {
  data: ThreatProfile['deepfake']
}

export function DeepfakeCard({ data }: DeepfakeCardProps) {
  const deepfake = data

  return (
    <ThreatCard
      title={deepfake.cardTitle}
      description={deepfake.cardDescription}
      score={deepfake.score}
      icon={<Video className="h-4 w-4 text-warning" />}
      aiExplanation={deepfake.aiExplanation}
    >
      <div className="space-y-3">
        <p className="font-mono text-3xl font-bold text-text-primary">{deepfake.totalAudioMinutes}</p>
        <p className="text-text-muted">
          of usable voice data found across {deepfake.videoCount} public videos
        </p>
        <div className="flex flex-wrap gap-2">
          {deepfake.platforms.map((platform) => (
            <span key={platform} className="rounded-lg border border-white/10 bg-bg-secondary/40 px-2 py-0.5 text-xs text-text-secondary">
              {platform}
            </span>
          ))}
        </div>
        <span className={`inline-block rounded-lg border px-2 py-0.5 font-mono text-xs uppercase ${RISK_TONE[deepfake.riskLevel]}`}>
          {deepfake.riskLevel}
        </span>
      </div>
    </ThreatCard>
  )
}
