import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/scanning')({
  component: ScanningPage,
})

const SCAN_STEPS = [
  {
    label: 'Checking breach databases',
    engine: 'sfp_haveibeenpwned',
  },
  {
    label: 'Analyzing email reputation',
    engine: 'sfp_emailrep',
  },
] as const

const STEP_DURATION_MS = 1500
const FINAL_PAUSE_MS = 250

type StepStatus = 'pending' | 'running' | 'complete'

function ScanningPage() {
  const navigate = useNavigate()
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    SCAN_STEPS.map(() => 'pending'),
  )

  useEffect(() => {
    let active = true
    const timers: ReturnType<typeof setTimeout>[] = []

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ms)
        timers.push(timer)
      })

    const runAnimation = async () => {
      for (let index = 0; index < SCAN_STEPS.length; index++) {
        if (!active) return

        setStepStatuses((previous) => {
          const next = [...previous]
          next[index] = 'running'
          return next
        })

        await wait(STEP_DURATION_MS)
        if (!active) return

        setStepStatuses((previous) => {
          const next = [...previous]
          next[index] = 'complete'
          return next
        })
      }

      await wait(FINAL_PAUSE_MS)
      if (!active) return

      void navigate({ to: '/dashboard' })
    }

    void runAnimation()

    return () => {
      active = false
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-bg-main px-6 py-20 font-mono text-text-secondary">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-2xl border border-white/10 bg-bg-card/80 p-6 backdrop-blur-md md:p-8">
          <CornerAccents />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-lime">
            Running analysis
          </p>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-text-primary md:text-4xl">
            Initiating Core Checks
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            The first two baseline scans are running in parallel while we prepare your dashboard.
          </p>

          <div className="mt-8 space-y-3">
            {SCAN_STEPS.map((step, index) => {
              const status = stepStatuses[index]
              const isRunning = status === 'running'
              const isComplete = status === 'complete'
              const statusTone = isComplete ? 'text-accent-lime-soft' : isRunning ? 'text-warning' : 'text-text-muted'

              return (
                <div key={step.engine} className="rounded-xl border border-white/10 bg-bg-secondary/80 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
                        {step.label}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">{step.engine}</p>
                    </div>
                    <span className={`text-xs uppercase tracking-[0.2em] ${statusTone}`}>
                      {isComplete ? 'complete' : isRunning ? 'running' : 'queued'}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 rounded bg-white/10">
                    <motion.div
                      className={`h-full rounded ${isComplete ? 'bg-accent-lime-soft' : 'bg-warning'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: isComplete ? '100%' : isRunning ? '100%' : '0%' }}
                      transition={{ duration: isRunning ? STEP_DURATION_MS / 1000 : 0.2, ease: 'linear' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function CornerAccents() {
  return (
    <>
      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-border-strong/80" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-border-strong/80" />
    </>
  )
}
