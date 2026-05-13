import { createFileRoute } from '@tanstack/react-router'
import { BreachCard } from '~/components/BreachCard'
import { DarkWebCard } from '~/components/DarkWebCard'
import { DataExposureCard } from '~/components/DataExposureCard'
import { DeepfakeCard } from '~/components/DeepfakeCard'
import { PhishingCard } from '~/components/PhishingCard'
import { ShadowAccountsCard } from '~/components/ShadowAccountsCard'
import { mockThreatProfile } from '~/data/mockData'

const MOCK_DATA = {
  threatScore: 8.2,
  leakedBreaches: [
    { source: 'LinkedIn', recordsExposed: '117M' },
    { source: 'Adobe', recordsExposed: '153M' },
    { source: 'Dropbox', recordsExposed: '68M' },
  ],
  deepfakeVulnerability: {
    usableAudio: '14 min 22 sec of usable audio found',
    faceSamples: '9 high-confidence frontal images indexed',
    synthesisRisk: 'Voice clone confidence 87.4%',
  },
  tacticalCards: [
    {
      title: 'OSINT Aggregator',
      status: 'High',
      detail:
        '27 public datasets correlated; 4 identity vectors map to the same credential cluster.',
    },
    {
      title: 'AI Red Team',
      status: 'Critical',
      detail:
        'Autonomous attack simulation achieved 3/5 initial foothold objectives within 11 minutes.',
    },
    {
      title: 'Deepfake Score',
      status: 'Critical',
      detail:
        'Audio + visual corpus is sufficient for high-fidelity impersonation campaigns.',
    },
    {
      title: 'Spear-Phishing Sim',
      status: 'High',
      detail:
        'LLM-generated lure quality rated 92/100 against current professional metadata.',
    },
    {
      title: 'Credential Blast Radius',
      status: 'Critical',
      detail:
        'Single reused password links 6 services, expanding account takeover probability.',
    },
    {
      title: 'Shadow Account Detector',
      status: 'Medium',
      detail:
        '3 dormant identities detected; no MFA signals observed in telemetry windows.',
    },
  ] as const,
} as const

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const threatProfile = mockThreatProfile

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
            <div className="relative flex h-56 w-56 animate-pulse items-center justify-center rounded-full border border-red-700/50 bg-red-950/20 shadow-[0_0_40px_rgba(220,38,38,0.25)]">
              <div className="absolute inset-4 rounded-full border border-red-500/30" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Threat Index
                </p>
                <p className="mt-2 text-6xl font-black text-red-600">
                  {MOCK_DATA.threatScore}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-red-500">
                  Critical
                </p>
              </div>
            </div>
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
                  {MOCK_DATA.leakedBreaches.map((breach) => (
                    <li key={breach.source} className="flex justify-between">
                      <span className="text-slate-300">{breach.source}</span>
                      <span className="text-red-500">{breach.recordsExposed}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Deepfake Vulnerability
                </p>
                <p className="mt-2 text-red-400">
                  {MOCK_DATA.deepfakeVulnerability.usableAudio}
                </p>
                <p className="mt-1 text-slate-400">
                  {MOCK_DATA.deepfakeVulnerability.faceSamples}
                </p>
                <p className="mt-1 text-slate-400">
                  {MOCK_DATA.deepfakeVulnerability.synthesisRisk}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BreachCard data={threatProfile.breaches} />
          <DataExposureCard data={threatProfile.dataExposure} />
          <ShadowAccountsCard data={threatProfile.shadowAccounts} />
          <DeepfakeCard data={threatProfile.deepfake} />
          <PhishingCard data={threatProfile.phishing} />
          <DarkWebCard data={threatProfile.darkWeb} />
        </section>
      </div>
    </div>
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
