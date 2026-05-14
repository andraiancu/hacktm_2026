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
    <div className="min-h-screen bg-[#050505] px-6 py-20 font-mono text-slate-300">
      <div className="mx-auto max-w-3xl">
        <div className="relative border border-white/10 bg-black/45 p-6 md:p-8">
          <CornerAccents />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
            Running analysis
          </p>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white md:text-4xl">
            Initiating Core Checks
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            The first two baseline scans are running in parallel while we prepare your dashboard.
          </p>

          <div className="mt-8 space-y-3">
            {SCAN_STEPS.map((step, index) => {
              const status = stepStatuses[index]
              const isRunning = status === 'running'
              const isComplete = status === 'complete'

              return (
                <div key={step.engine} className="border border-white/10 bg-black/50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">
                        {step.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{step.engine}</p>
                    </div>
                    <span
                      className={`text-xs uppercase tracking-[0.2em] ${
                        isComplete
                          ? 'text-emerald-400'
                          : isRunning
                            ? 'text-amber-400'
                            : 'text-slate-500'
                      }`}
                    >
                      {isComplete ? 'complete' : isRunning ? 'running' : 'queued'}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 bg-white/10">
                    <motion.div
                      className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-red-600'}`}
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
      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-red-600" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-red-600" />
    </>
  )
}
