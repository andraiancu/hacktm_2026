import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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
    title: 'Deepfake Score',
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

const PHASE_ONE_LINES = [
  "They didn't hack you.",
  'You invited them in. One post at a time. One forgotten password at a time.',
  'What may seem innocent to you, is pure gold for attackers.',
] as const
const PHASE_TWO_LINE =
  "Let's scan you before they do and fix your digital identity."
const INTRO_SESSION_KEY = 'def_sim_intro_seen'

type IntroPhase = 'terminal' | 'wipe' | 'cta' | 'glitch'
type ScanPayload = {
  email: string
  username?: string
  name?: string
  phone?: string
}

function DefenseSimulatedLanding() {
  const Maps = useNavigate()
  const intelBriefingRef = useRef<HTMLElement | null>(null)
  const scanInputRef = useRef<HTMLInputElement | null>(null)

  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null)
  const [isIntroActive, setIsIntroActive] = useState(true)
  const [introPhase, setIntroPhase] = useState<IntroPhase>('terminal')
  const [typedTerminalLines, setTypedTerminalLines] = useState<string[]>(['', '', ''])
  const [typedMission, setTypedMission] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [typingLineIndex, setTypingLineIndex] = useState<number | null>(0)
  const [showCursor, setShowCursor] = useState(true)
  const [flickerOpacity, setFlickerOpacity] = useState(0)
  const [glitchShift, setGlitchShift] = useState({ x: 0, y: 0, sliceTop: 44 })

  useEffect(() => {
    const timer = setInterval(() => setShowCursor((current) => !current), 420)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const seen = sessionStorage.getItem(INTRO_SESSION_KEY)
    if (seen) {
      setHasSeenIntro(true)
      setIsIntroActive(false)
      return
    }
    setHasSeenIntro(false)
    setIsIntroActive(true)
  }, [])

  useEffect(() => {
    if (hasSeenIntro !== false || !isIntroActive) {
      return
    }

    let active = true
    const timers: ReturnType<typeof setTimeout>[] = []

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ms)
        timers.push(timer)
      })

    const runSequence = async () => {
      for (let lineIndex = 0; lineIndex < PHASE_ONE_LINES.length; lineIndex++) {
        setIsTyping(true)
        setTypingLineIndex(lineIndex)
        const line = PHASE_ONE_LINES[lineIndex]

        for (let charIndex = 1; charIndex <= line.length; charIndex++) {
          if (!active) return
          setTypedTerminalLines((previous) => {
            const next = [...previous]
            next[lineIndex] = line.slice(0, charIndex)
            return next
          })
          await wait(44)
        }
        setIsTyping(false)
        setTypingLineIndex(null)
        await wait(420)
      }

      await wait(1000)
      if (!active) return

      setIntroPhase('wipe')
      setTypedTerminalLines(['', '', ''])
      await wait(520)
      if (!active) return

      setIntroPhase('cta')
      setIsTyping(true)
      for (let charIndex = 1; charIndex <= PHASE_TWO_LINE.length; charIndex++) {
        if (!active) return
        setTypedMission(PHASE_TWO_LINE.slice(0, charIndex))
        await wait(45)
      }
      setIsTyping(false)

      await wait(500)
      if (!active) return

      setIntroPhase('glitch')
      await wait(800)
      if (!active) return

      setHasSeenIntro(true)
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
      setIsIntroActive(false)
    }

    void runSequence()

    return () => {
      active = false
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [hasSeenIntro, isIntroActive])

  useEffect(() => {
    if (introPhase !== 'wipe' && introPhase !== 'glitch') {
      setFlickerOpacity(0)
      return
    }
    const timer = setInterval(() => setFlickerOpacity(0.22 + Math.random() * 0.45), 70)
    return () => clearInterval(timer)
  }, [introPhase])

  useEffect(() => {
    if (introPhase !== 'glitch') {
      setGlitchShift({ x: 0, y: 0, sliceTop: 44 })
      return
    }
    const timer = setInterval(() => {
      setGlitchShift({
        x: Math.floor(Math.random() * 16) - 8,
        y: Math.floor(Math.random() * 8) - 4,
        sliceTop: 14 + Math.floor(Math.random() * 72),
      })
    }, 48)
    return () => clearInterval(timer)
  }, [introPhase])

  useEffect(() => {
    if (!isIntroActive) {
      scanInputRef.current?.focus()
    }
  }, [isIntroActive])

  const startScan = (_payload: ScanPayload) => {
    void Maps({ to: '/dashboard' })
  }

  const scrollToBriefing = () => {
    intelBriefingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSkipIntro = () => {
    setIsTyping(false)
    setTypingLineIndex(null)
    sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
    setHasSeenIntro(true)
    setIsIntroActive(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-slate-300 selection:bg-red-600/30">
      {isIntroActive ? (
        <IntroOverlay
          introPhase={introPhase}
          typedTerminalLines={typedTerminalLines}
          typedMission={typedMission}
          isTyping={isTyping}
          typingLineIndex={typingLineIndex}
          showCursor={showCursor}
          flickerOpacity={flickerOpacity}
          glitchShift={glitchShift}
          onSkipIntro={handleSkipIntro}
        />
      ) : (
        <MainHero
          scanInputRef={scanInputRef}
          onStartScan={startScan}
          onFindOutMore={scrollToBriefing}
          intelBriefingRef={intelBriefingRef}
        />
      )}
    </div>
  )
}

type IntroOverlayProps = {
  introPhase: IntroPhase
  typedTerminalLines: string[]
  typedMission: string
  isTyping: boolean
  typingLineIndex: number | null
  showCursor: boolean
  flickerOpacity: number
  glitchShift: { x: number; y: number; sliceTop: number }
  onSkipIntro: () => void
}

function IntroOverlay({
  introPhase,
  typedTerminalLines,
  typedMission,
  isTyping,
  typingLineIndex,
  showCursor,
  flickerOpacity,
  glitchShift,
  onSkipIntro,
}: IntroOverlayProps) {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] px-6">
      <div className="flex w-full max-w-4xl flex-col items-center gap-5">
        <div
          className="relative w-full overflow-hidden border border-red-900/50 bg-black/85 p-6 shadow-[0_0_30px_rgba(220,38,38,0.12)] md:p-8"
          style={
            introPhase === 'glitch'
              ? { transform: `translate(${glitchShift.x * 0.35}px, ${glitchShift.y * 0.35}px)` }
              : undefined
          }
        >
          <div className="mb-5 flex items-center justify-between border-b border-red-900/45 pb-3 text-[10px] uppercase tracking-[0.26em] text-white/65">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-red-600/45" />
              <span className="text-red-500">Sentinel Terminal</span>
            </div>
            <span>Threat Feed / Live</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
          <div className="pointer-events-none absolute bottom-0 left-3 top-0 w-px bg-red-900/25" />
          <div className="pointer-events-none absolute bottom-0 right-3 top-0 w-px bg-red-900/25" />

          {introPhase === 'terminal' || introPhase === 'wipe' ? (
            <div className="space-y-3 pl-3 text-sm leading-relaxed text-white/85 md:text-lg">
              {typedTerminalLines.map((line, index) => (
                <p key={`${index}-${line}`}>
                  <span className="mr-2 text-red-500">&gt;</span>
                  {line || '\u00A0'}
                  {isTyping && showCursor && typingLineIndex === index && (
                    <span className="ml-1 inline-block h-[1.05em] w-px bg-red-500 align-[-0.18em]" />
                  )}
                </p>
              ))}
            </div>
          ) : (
            <p className="pl-3 text-sm leading-relaxed text-white/90 md:text-lg">
              <span className="mr-2 text-red-500">&gt;</span>
              {typedMission}
              {isTyping && showCursor && (
                <span className="ml-1 inline-block h-[1.05em] w-px bg-red-500 align-[-0.18em]" />
              )}
            </p>
          )}

          <div className="mt-5 border-t border-red-900/35 pt-3 text-[10px] uppercase tracking-[0.2em] text-white/45">
            shell: reconnaissance // status: active
          </div>
        </div>

        <button
          type="button"
          onClick={onSkipIntro}
          className="border-0 bg-transparent p-0 font-mono text-xs uppercase underline underline-offset-4 text-slate-600 transition-colors hover:text-white focus-visible:text-red-500"
        >
          Skip Intro
        </button>
      </div>

      {(introPhase === 'wipe' || introPhase === 'glitch') && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: flickerOpacity,
              backgroundImage:
                'repeating-linear-gradient(to bottom, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 2px, transparent 3px, transparent 6px), linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.82))',
            }}
          />
          {introPhase === 'glitch' && (
            <>
              <div
                className="pointer-events-none absolute inset-0 mix-blend-screen"
                style={{
                  opacity: 0.2 + flickerOpacity * 0.3,
                  transform: `translate(${glitchShift.x}px, ${glitchShift.y}px)`,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.18) 100%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-white/25"
                style={{
                  opacity: 0.24 + flickerOpacity * 0.26,
                  clipPath: `inset(${glitchShift.sliceTop}% 0 ${Math.max(0, 100 - glitchShift.sliceTop - 9)}% 0)`,
                  transform: `translate(${glitchShift.x * -1.4}px, ${glitchShift.y * 0.25}px)`,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: 0.26 + flickerOpacity * 0.18,
                  background:
                    'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18), transparent 48%), radial-gradient(circle at 70% 65%, rgba(255,255,255,0.15), transparent 52%)',
                  filter: 'grayscale(100%) contrast(180%)',
                }}
              />
            </>
          )}
        </>
      )}
    </section>
  )
}

type MainHeroProps = {
  scanInputRef: RefObject<HTMLInputElement | null>
  onStartScan: (payload: ScanPayload) => void
  onFindOutMore: () => void
  intelBriefingRef: RefObject<HTMLElement | null>
}

function MainHero({
  scanInputRef,
  onStartScan,
  onFindOutMore,
  intelBriefingRef,
}: MainHeroProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  const hasValidEmailFormat = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (!hasValidEmailFormat(trimmedEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailError('')
    const payload: ScanPayload = { email: trimmedEmail }
    const trimmedUsername = username.trim()
    const trimmedName = fullName.trim()
    const trimmedPhone = phone.trim()

    if (trimmedUsername) payload.username = trimmedUsername
    if (trimmedName) payload.name = trimmedName
    if (trimmedPhone) payload.phone = trimmedPhone

    onStartScan(payload)
  }

  return (
    <>
      <section className="relative z-10 flex min-h-screen items-center bg-[#050505] px-6 py-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-red-600">
            AI POWERED OSINT SCANNER
          </p>
          <h1 className="mt-5 whitespace-nowrap text-5xl font-black uppercase italic tracking-[0.08em] text-white drop-shadow-[0_0_14px_rgba(220,38,38,0.5)] md:text-8xl">
            DEFENSE <span className="text-red-600">SIMULATED</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
            Your digital footprint is a map for attackers. This system scans,
            simulates, and secures your online existence before they do.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mx-auto mt-12 flex max-w-3xl flex-col gap-4 md:flex-row">
            <div className="flex-1 space-y-4 text-left">
              <div className="relative">
                <CornerAccents />
                <input
                  ref={scanInputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (emailError) {
                      setEmailError('')
                    }
                  }}
                  placeholder="EMAIL/USERNAME"
                  className="h-14 w-full border border-white/15 bg-black px-4 text-sm font-semibold uppercase tracking-[0.2em] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-red-600"
                />
              </div>
              {emailError && (
                <p className="-mt-1 text-xs text-red-600">Please enter a valid email address</p>
              )}

              <button
                type="button"
                onClick={() => setShowOptionalFields((current) => !current)}
                className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
              >
                ＋ Add more for a deeper scan
              </button>

              <AnimatePresence initial={false}>
                {showOptionalFields && (
                  <motion.div
                    key="optional-fields"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-300">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          placeholder="your username (e.g. johnsmith92)"
                          className="h-14 w-full border border-white/15 bg-black px-4 text-sm font-semibold uppercase tracking-[0.2em] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-red-600"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Finds your accounts across 500+ platforms
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-300">
                          Full name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="your full name (e.g. John Smith)"
                          className="h-14 w-full border border-white/15 bg-black px-4 text-sm font-semibold uppercase tracking-[0.2em] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-red-600"
                        />
                        <p className="mt-2 text-xs text-slate-500">Checks data broker databases</p>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-300">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="phone number in international format (+40712...)"
                          className="h-14 w-full border border-white/15 bg-black px-4 text-sm font-semibold uppercase tracking-[0.2em] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-red-600"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Checks if your number was exposed in breaches
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            onClick={onFindOutMore}
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
    </>
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
