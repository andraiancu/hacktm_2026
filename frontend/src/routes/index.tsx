import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

export const Route = createFileRoute('/')({
  component: DefenseSimulatedLanding,
})

const ANALYSIS_MODULES = [
  {
    title: 'OSINT Aggregator',
    detail:
      'Correlates public records, social traces, leak artifacts, and metadata into adversary-ready identity graphs.',
  },
  {
    title: 'AI Red Team',
    detail:
      'Executes automated pretexting and intrusion simulation to expose exploitable behaviors before real attackers do.',
  },
  {
    title: 'Deepfake Scorer',
    detail:
      'Measures voice and face clone feasibility from publicly available media to quantify impersonation exposure.',
  },
  {
    title: 'Spear-Phishing Sim',
    detail:
      'Builds context-rich lure scenarios using discovered interests, contacts, and routine patterns.',
  },
  {
    title: 'Credential Blast Radius',
    detail:
      'Maps password reuse pathways and token exposure to estimate multi-service compromise impact.',
  },
  {
    title: 'Shadow Account Detector',
    detail:
      'Finds dormant, forgotten, or unmanaged identities that enlarge attack surface without active monitoring.',
  },
] as const

function DefenseSimulatedLanding() {
  const navigate = useNavigate()
  const intelBriefingRef = useRef<HTMLElement | null>(null)

  const handleScan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void navigate({ to: '/dashboard' })
  }

  const scrollToBriefing = () => {
    intelBriefingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-slate-300 selection:bg-red-600/30">
      <section className="flex min-h-screen items-center bg-[#050505] px-6 py-20">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-red-600">
            AI POWERED OSINT SCANNER
          </p>
          <h1 className="mt-5 whitespace-nowrap text-4xl font-black uppercase tracking-[0.08em] text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.3)] md:text-6xl">
            DEFENSE <span className="text-red-600">SIMULATED</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
            Your digital footprint is a map for attackers. This system scans,
            simulates, and secures your online existence before they do.
          </p>

          <form onSubmit={handleScan} className="mx-auto mt-12 flex max-w-3xl flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <CornerAccents />
              <input
                type="text"
                placeholder="EMAIL/USERNAME"
                className="h-14 w-full border border-white/15 bg-black px-4 text-sm font-semibold uppercase tracking-[0.2em] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-red-600"
              />
            </div>
            <button
              type="submit"
              className="h-14 border border-red-600 bg-red-600 px-8 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-red-700 hover:shadow-[0_0_18px_rgba(220,38,38,0.45)]"
            >
              INITIATE SCAN
            </button>
          </form>

          <button
            type="button"
            onClick={scrollToBriefing}
            className="relative mx-auto mt-14 block border border-white/15 bg-[#080808] px-8 py-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-300 transition-colors hover:border-red-600 hover:text-white"
          >
            <CornerAccents />
            FIND OUT MORE
          </button>
        </div>
      </section>

      <section ref={intelBriefingRef} className="bg-[#080808] px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <article className="relative border border-white/10 bg-black/45 p-6 md:p-8">
            <CornerAccents />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
              Intel Briefing
            </p>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white md:text-4xl">
              The Anatomy of Vulnerability
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-400 md:text-base">
              Attackers do not need a single catastrophic leak; they weaponize
              fragments. A public profile, a reused username, and one exposed
              credential together become an operational dossier for intrusion,
              impersonation, and financial exploitation.
            </p>
          </article>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
              Analysis Categories
            </h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ANALYSIS_MODULES.map((module) => (
                <article
                  key={module.title}
                  className="relative border border-white/10 bg-black/45 p-5"
                >
                  <CornerAccents />
                  <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                    {module.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {module.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="relative border border-white/10 bg-black/45 p-6">
              <CornerAccents />
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
                Attack Method: Social Engineering
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                OSINT gives attackers language, timing, and emotional hooks.
                They tailor scams around employers, events, and relationships to
                deliver messages that bypass suspicion.
              </p>
            </article>
            <article className="relative border border-white/10 bg-black/45 p-6">
              <CornerAccents />
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
                Attack Method: Media Forensics
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Public voice clips and videos are harvested for model training.
                Once enough clear samples are collected, threat actors can build
                deepfake clones for high-trust fraud and account recovery abuse.
              </p>
            </article>
          </div>
        </div>
      </section>
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
