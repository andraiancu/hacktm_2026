import { AnimatePresence, motion } from 'framer-motion'
import { Database, Ghost, Mail, Plus, Skull, Video } from 'lucide-react'
import type { ComponentType, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useScanContext, type ProgressiveCardKey } from '../../src/state/ScanContext'

type ExtraInputKind = 'username' | 'socialHandle'

type ScanOption = {
  cardKey: ProgressiveCardKey
  label: string
  eta: string
  icon: ComponentType<{ className?: string }>
  extraInput?: ExtraInputKind
}

const SCAN_OPTIONS: ScanOption[] = [
  {
    cardKey: 'dataExposure',
    label: 'Who Knows Where You Live?',
    eta: '~10s',
    icon: Database,
  },
  {
    cardKey: 'shadowAccounts',
    label: 'Your Forgotten Accounts',
    eta: '~45s',
    icon: Ghost,
    extraInput: 'username',
  },
  {
    cardKey: 'deepfake',
    label: 'Could Someone Fake Being You?',
    eta: '~20s',
    icon: Video,
    extraInput: 'socialHandle',
  },
  {
    cardKey: 'darkWeb',
    label: 'Your Name on the Dark Web',
    eta: '~30s',
    icon: Skull,
  },
  {
    cardKey: 'phishing',
    label: 'See The Attack Before It Happens',
    eta: '~10s',
    icon: Mail,
  },
]

type InputState = {
  cardKey: ProgressiveCardKey
  kind: ExtraInputKind
}

function getCardDataAvailability(
  scanData: ReturnType<typeof useScanContext>['scanData'],
  cardKey: ProgressiveCardKey,
) {
  return scanData[cardKey] != null
}

export function AddScanCard() {
  const { scanData, loadingCards, triggerCardScan } = useScanContext()
  const [inputState, setInputState] = useState<InputState | null>(null)
  const [inputValue, setInputValue] = useState('')

  const populatedNonPhishingCount = useMemo(() => {
    const keys: ProgressiveCardKey[] = ['dataExposure', 'shadowAccounts', 'deepfake', 'darkWeb']
    return keys.filter((key) => getCardDataAvailability(scanData, key)).length
  }, [scanData])

  const availableOptions = useMemo(() => {
    return SCAN_OPTIONS.filter((option) => {
      if (option.cardKey === 'phishing' && populatedNonPhishingCount < 2) {
        return false
      }
      return !getCardDataAvailability(scanData, option.cardKey) && !loadingCards.has(option.cardKey)
    })
  }, [loadingCards, populatedNonPhishingCount, scanData])

  const handleOptionClick = (option: ScanOption) => {
    if (option.extraInput) {
      setInputState({ cardKey: option.cardKey, kind: option.extraInput })
      setInputValue('')
      return
    }
    triggerCardScan(option.cardKey)
  }

  const handleBack = () => {
    setInputState(null)
    setInputValue('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inputState || inputValue.trim().length === 0) {
      return
    }
    triggerCardScan(inputState.cardKey, inputValue.trim())
    setInputState(null)
    setInputValue('')
  }

  const inputPlaceholder =
    inputState?.kind === 'username'
      ? 'username (e.g. alexj)'
      : 'social handle (e.g. @alexj)'

  return (
    <article className="rounded-xl border border-white/10 bg-bg-card/80 p-5 backdrop-blur-sm">
      <AnimatePresence mode="wait" initial={false}>
        {inputState ? (
          <motion.div
            key="input"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={inputPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-bg-secondary p-3 font-mono text-text-primary outline-none focus:border-border-strong"
              />
              <button
                type="submit"
                className="w-full rounded-lg border border-border-strong/70 bg-accent-lime px-3 py-2.5 font-mono text-sm text-bg-deep transition-colors hover:bg-accent-lime-soft"
              >
                Start Scan →
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="text-xs text-text-muted transition-colors hover:text-text-secondary"
              >
                ← back
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <Plus className="h-7 w-7 text-accent-lime-soft" />
              <p className="mt-2 text-sm text-text-secondary">Add a deeper scan</p>
              <p className="mt-1 text-xs text-text-muted">Choose what to investigate next</p>
            </div>

            {availableOptions.length === 0 ? (
              <p className="text-center text-sm text-accent-lime-soft">All scans complete ✓</p>
            ) : (
              <div className="space-y-2">
                {availableOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.cardKey}
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-bg-secondary/85 px-3 py-2.5 transition-colors hover:border-border-strong/70 hover:bg-bg-hover"
                    >
                      <Icon className="h-4 w-4 text-accent-lime-soft" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm text-text-secondary">{option.label}</p>
                        {option.extraInput ? <p className="text-xs text-text-muted">needs username</p> : null}
                      </div>
                      <span className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-text-muted">
                        {option.eta}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
