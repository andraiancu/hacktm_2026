import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { AddScanCard } from '../../app/components/AddScanCard'
import { BreachCard } from '~/components/BreachCard'
import { DarkWebCard } from '~/components/DarkWebCard'
import { DataExposureCard } from '~/components/DataExposureCard'
import { DeepfakeCard } from '~/components/DeepfakeCard'
import { EmailReputationCard } from '~/components/EmailReputationCard'
import { PhishingCard } from '~/components/PhishingCard'
import { ShadowAccountsCard } from '~/components/ShadowAccountsCard'
import { ThreatGauge } from '~/components/ThreatGauge'
import { useScanContext, type ProgressiveCardKey } from '~/state/ScanContext'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { scanData, loadingCards } = useScanContext()
  const completedScanCount = [
    scanData.breaches,
    scanData.emailReputation,
    scanData.dataExposure,
    scanData.shadowAccounts,
    scanData.deepfake,
    scanData.darkWeb,
    scanData.phishing,
  ].filter((scan) => scan != null).length

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-mono text-slate-300">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 2px, transparent 4px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-10 md:px-10">
        <header className="mb-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-600">
              Sentinel Operations
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white">
              Threat Dashboard
            </h1>
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Live Risk Telemetry
          </p>
        </header>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="relative flex min-h-72 items-center justify-center border border-red-900/40 bg-black/60 px-6 py-8">
            <CornerAccents />
            <ThreatGauge score={scanData.overallScore} scanCount={completedScanCount} />
          </div>

          <div className="relative border border-white/10 bg-black/60 p-5">
            <CornerAccents />
            <h2 className="text-xs uppercase tracking-[0.25em] text-red-600">
              Exposure Summary
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Leaked Breaches
                </p>
                <ul className="mt-2 space-y-1">
                  {(scanData.breaches?.events ?? []).map((breach) => (
                    <li key={`${breach.breach}-${breach.date}`} className="flex justify-between">
                      <span className="text-slate-300">{breach.breach}</span>
                      <span className="text-red-500">{breach.date}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Email Reputation
                </p>
                <p className="mt-2 text-red-400">
                  {scanData.emailReputation?.domainHealth ?? 'scanning...'}
                </p>
                <p className="mt-1 text-slate-400">
                  {scanData.emailReputation?.spoofingRisk
                    ? `Spoofing risk: ${scanData.emailReputation.spoofingRisk}`
                    : 'collecting domain signals'}
                </p>
                <p className="mt-1 text-slate-400">
                  {scanData.emailReputation?.disposableProviderDetected
                    ? 'Disposable provider detected'
                    : 'Provider profile appears persistent'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scanData.breaches ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <BreachCard data={scanData.breaches} />
            </motion.div>
          ) : (
            <LoadingCard />
          )}

          {scanData.emailReputation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <EmailReputationCard data={scanData.emailReputation} />
            </motion.div>
          ) : (
            <LoadingCard />
          )}

          <AnimatePresence initial={false}>
            <ProgressiveCardSlot
              cardKey="dataExposure"
              isLoading={loadingCards.has('dataExposure')}
              hasData={scanData.dataExposure != null}
            >
              {scanData.dataExposure ? <DataExposureCard data={scanData.dataExposure} /> : null}
            </ProgressiveCardSlot>

            <ProgressiveCardSlot
              cardKey="shadowAccounts"
              isLoading={loadingCards.has('shadowAccounts')}
              hasData={scanData.shadowAccounts != null}
            >
              {scanData.shadowAccounts ? <ShadowAccountsCard data={scanData.shadowAccounts} /> : null}
            </ProgressiveCardSlot>

            <ProgressiveCardSlot
              cardKey="deepfake"
              isLoading={loadingCards.has('deepfake')}
              hasData={scanData.deepfake != null}
            >
              {scanData.deepfake ? <DeepfakeCard data={scanData.deepfake} /> : null}
            </ProgressiveCardSlot>

            <ProgressiveCardSlot
              cardKey="darkWeb"
              isLoading={loadingCards.has('darkWeb')}
              hasData={scanData.darkWeb != null}
            >
              {scanData.darkWeb ? <DarkWebCard data={scanData.darkWeb} /> : null}
            </ProgressiveCardSlot>

            <ProgressiveCardSlot
              cardKey="phishing"
              isLoading={loadingCards.has('phishing')}
              hasData={scanData.phishing != null}
            >
              {scanData.phishing ? <PhishingCard data={scanData.phishing} /> : null}
            </ProgressiveCardSlot>
          </AnimatePresence>

          <AddScanCard />
        </section>
      </div>
    </div>
  )
}

function ProgressiveCardSlot({
  cardKey,
  isLoading,
  hasData,
  children,
}: {
  cardKey: ProgressiveCardKey
  isLoading: boolean
  hasData: boolean
  children: ReactNode
}) {
  if (!isLoading && !hasData) {
    return null
  }

  if (isLoading && !hasData) {
    return (
      <motion.div key={`${cardKey}-loading`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <LoadingCard />
      </motion.div>
    )
  }

  return (
    <motion.div
      key={`${cardKey}-loaded`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-bg-card p-5"
    >
      <div className="animate-pulse bg-bg-hover rounded h-4 w-32" />
      <div className="mt-4 space-y-2">
        <div className="animate-pulse bg-bg-hover rounded h-3 w-full" />
        <div className="animate-pulse bg-bg-hover rounded h-3 w-4/5" />
        <div className="animate-pulse bg-bg-hover rounded h-3 w-2/3" />
      </div>
      <p className="mt-5 font-mono text-xs text-muted">
        scanning...
        <span className="ml-0.5 inline-block animate-pulse">|</span>
      </p>
    </motion.div>
  )
}

function CornerAccents() {
  return (
    <>
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-red-600" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-red-600" />
    </>
  )
}
