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

  return (
    <div className="relative flex h-56 w-56 animate-pulse items-center justify-center rounded-full border border-red-700/50 bg-red-950/20 shadow-[0_0_40px_rgba(220,38,38,0.25)]">
      <div className="absolute inset-4 rounded-full border border-red-500/30" />
      <svg className="pointer-events-none absolute inset-2 -rotate-90" viewBox="0 0 240 240" aria-hidden>
        <circle cx="120" cy="120" r={RADIUS} fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="7" />
        <motion.circle
          key={`${score ?? 'na'}-${animationKey}`}
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          stroke="rgba(239,68,68,0.85)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Threat Index</p>
        <p className="mt-2 text-6xl font-black text-red-600">{scoreLabel}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-red-500">{threatLevelLabel}</p>
        <p className="mt-2 font-mono text-xs text-text-muted">{scanLabel}</p>
      </div>
    </div>
  )
}
