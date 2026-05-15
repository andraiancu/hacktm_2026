import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type ThreatGaugeProps = {
  score: number | null
  scanCount: number
}

const RADIUS = 96
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ThreatGauge({ score, scanCount }: ThreatGaugeProps) {
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    setAnimationKey((previous) => previous + 1)
  }, [score])

  const normalizedScore = score ?? 0
  const progress = Math.max(0, Math.min(1, normalizedScore / 10))
  const targetOffset = CIRCUMFERENCE * (1 - progress)
  const threatLevelLabel =
    score == null ? 'Scanning' : score >= 7 ? 'Critical' : score >= 4 ? 'Elevated' : 'Stable'
  const scoreLabel = score?.toFixed(1) ?? '--'
  const scanLabel = scanCount === 1 ? 'Based on 1 scan' : `Based on ${scanCount} scans`
  const tone =
    score == null
      ? {
          ring: 'border-white/15',
          inner: 'border-white/10',
          progress: 'rgba(198,243,17,0.85)',
          track: 'rgba(255,255,255,0.14)',
          value: 'text-accent-lime-soft',
          level: 'text-text-secondary',
        }
      : score >= 7
        ? {
            ring: 'border-red-600/40',
            inner: 'border-red-500/30',
            progress: 'rgba(248,113,113,0.85)',
            track: 'rgba(248,113,113,0.2)',
            value: 'text-red-400',
            level: 'text-red-300',
          }
        : score >= 4
          ? {
              ring: 'border-warning-strong/45',
              inner: 'border-warning/30',
              progress: 'rgba(255,182,147,0.9)',
              track: 'rgba(170,69,0,0.22)',
              value: 'text-warning',
              level: 'text-warning',
            }
          : {
              ring: 'border-accent-lime/45',
              inner: 'border-accent-lime-soft/30',
              progress: 'rgba(198,243,17,0.9)',
              track: 'rgba(198,243,17,0.2)',
              value: 'text-accent-lime-soft',
              level: 'text-accent-lime-soft',
            }

  return (
    <div
      className={`relative flex h-56 w-56 items-center justify-center rounded-full border bg-bg-card/85 backdrop-blur-md ${tone.ring}`}
    >
      <div className={`absolute inset-4 rounded-full border ${tone.inner}`} />
      <svg className="pointer-events-none absolute inset-2 -rotate-90" viewBox="0 0 240 240" aria-hidden>
        <circle cx="120" cy="120" r={RADIUS} fill="none" stroke={tone.track} strokeWidth="7" />
        <motion.circle
          key={`${score ?? 'na'}-${animationKey}`}
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          stroke={tone.progress}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Threat Index</p>
        <p className={`mt-2 text-6xl font-black ${tone.value}`}>{scoreLabel}</p>
        <p className={`mt-2 text-xs uppercase tracking-[0.25em] ${tone.level}`}>{threatLevelLabel}</p>
        <p className="mt-2 font-mono text-xs text-text-muted">{scanLabel}</p>
      </div>
    </div>
  )
}
