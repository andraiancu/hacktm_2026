import { Video } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

const RISK_TONE = {
  high: 'border-red-600/70 text-red-500',
  medium: 'border-amber-500/60 text-amber-400',
  low: 'border-emerald-500/60 text-emerald-400',
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
      icon={<Video className="h-4 w-4 text-amber-400" />}
      aiExplanation={deepfake.aiExplanation}
    >
      <div className="space-y-3">
        <p className="font-mono text-3xl font-bold text-slate-100">{deepfake.totalAudioMinutes}</p>
        <p className="text-slate-500">
          of usable voice data found across {deepfake.videoCount} public videos
        </p>
        <div className="flex flex-wrap gap-2">
          {deepfake.platforms.map((platform) => (
            <span key={platform} className="rounded border border-white/10 px-2 py-0.5 text-xs text-slate-300">
              {platform}
            </span>
          ))}
        </div>
        <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs uppercase ${RISK_TONE[deepfake.riskLevel]}`}>
          {deepfake.riskLevel}
        </span>
      </div>
    </ThreatCard>
  )
}
