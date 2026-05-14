import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { mockThreatProfile, type ThreatProfile } from '~/data/mockData'

export type BreachData = ThreatProfile['breaches']
export type EmailRepData = ThreatProfile['emailReputation']
export type DataExposureData = ThreatProfile['dataExposure']
export type ShadowData = ThreatProfile['shadowAccounts']
export type DeepfakeData = ThreatProfile['deepfake']
export type DarkWebData = ThreatProfile['darkWeb']
export type PhishingData = ThreatProfile['phishing']

export type ProgressiveCardKey =
  | 'dataExposure'
  | 'shadowAccounts'
  | 'deepfake'
  | 'darkWeb'
  | 'phishing'

export type ScanData = {
  email: string
  overallScore: number | null
  breaches: BreachData | null
  emailReputation: EmailRepData | null
  dataExposure: DataExposureData | null
  shadowAccounts: ShadowData | null
  deepfake: DeepfakeData | null
  darkWeb: DarkWebData | null
  phishing: PhishingData | null
}

type ScanContextValue = {
  email: string
  scanData: ScanData
  loadingCards: Set<string>
  startScan: (email: string) => void
  triggerCardScan: (cardKey: ProgressiveCardKey, extraInput?: string) => void
}

const INITIAL_SCAN_DATA: ScanData = {
  email: '',
  overallScore: null,
  breaches: null,
  emailReputation: null,
  dataExposure: null,
  shadowAccounts: null,
  deepfake: null,
  darkWeb: null,
  phishing: null,
}

const FALLBACK_CARD_DELAYS_MS: Record<ProgressiveCardKey, number> = {
  dataExposure: 3000,
  shadowAccounts: 8000,
  deepfake: 4000,
  darkWeb: 6000,
  phishing: 2000,
}

const SCAN_RESULTS: Record<ProgressiveCardKey, ScanData[ProgressiveCardKey]> = {
  dataExposure: mockThreatProfile.dataExposure,
  shadowAccounts: mockThreatProfile.shadowAccounts,
  deepfake: mockThreatProfile.deepfake,
  darkWeb: mockThreatProfile.darkWeb,
  phishing: mockThreatProfile.phishing,
}

const SCORE_WEIGHTS = {
  breaches: 0.3,
  darkWeb: 0.25,
  dataExposure: 0.2,
  shadowAccounts: 0.1,
  deepfake: 0.1,
  phishing: 0.05,
} as const

const ScanContext = createContext<ScanContextValue | null>(null)

function calculateOverallScore(scanData: ScanData): number | null {
  let totalWeight = 0
  let weightedScore = 0

  for (const [cardKey, weight] of Object.entries(SCORE_WEIGHTS)) {
    const cardData = scanData[cardKey as keyof typeof SCORE_WEIGHTS]
    if (!cardData) {
      continue
    }
    totalWeight += weight
    weightedScore += cardData.score * weight
  }

  if (totalWeight === 0) {
    return null
  }

  return Number((weightedScore / totalWeight).toFixed(1))
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scanData, setScanData] = useState<ScanData>(INITIAL_SCAN_DATA)
  const [loadingCards, setLoadingCards] = useState<Set<string>>(new Set())
  const timeoutIdsRef = useRef<number[]>([])

  const addLoadingCard = useCallback((cardKey: string) => {
    setLoadingCards((previous) => {
      const next = new Set(previous)
      next.add(cardKey)
      return next
    })
  }, [])

  const removeLoadingCard = useCallback((cardKey: string) => {
    setLoadingCards((previous) => {
      const next = new Set(previous)
      next.delete(cardKey)
      return next
    })
  }, [])

  const clearScheduledUpdates = useCallback(() => {
    timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    timeoutIdsRef.current = []
  }, [])

  const scheduleUpdate = useCallback(
    (ms: number, callback: () => void) => {
      const timeoutId = window.setTimeout(callback, ms)
      timeoutIdsRef.current.push(timeoutId)
    },
    [],
  )

  const startScan = useCallback(
    (email: string) => {
      clearScheduledUpdates()
      setScanData({
        ...INITIAL_SCAN_DATA,
        email,
      })
      setLoadingCards(new Set(['breaches', 'emailReputation']))

      scheduleUpdate(2000, () => {
        setScanData((previous) => ({
          ...previous,
          breaches: mockThreatProfile.breaches,
        }))
        removeLoadingCard('breaches')
      })

      scheduleUpdate(3000, () => {
        setScanData((previous) => ({
          ...previous,
          emailReputation: mockThreatProfile.emailReputation,
        }))
        removeLoadingCard('emailReputation')
      })
    },
    [clearScheduledUpdates, removeLoadingCard, scheduleUpdate],
  )

  const triggerCardScan = useCallback(
    (cardKey: ProgressiveCardKey, _extraInput?: string) => {
      addLoadingCard(cardKey)
      const delay =
        mockThreatProfile.scanSteps[cardKey] ?? FALLBACK_CARD_DELAYS_MS[cardKey]

      scheduleUpdate(delay, () => {
        setScanData((previous) => ({
          ...previous,
          [cardKey]: SCAN_RESULTS[cardKey],
        }))
        removeLoadingCard(cardKey)
      })
    },
    [addLoadingCard, removeLoadingCard, scheduleUpdate],
  )

  useEffect(() => {
    setScanData((previous) => {
      const nextScore = calculateOverallScore(previous)
      if (previous.overallScore === nextScore) {
        return previous
      }
      return {
        ...previous,
        overallScore: nextScore,
      }
    })
  }, [
    scanData.breaches,
    scanData.darkWeb,
    scanData.dataExposure,
    scanData.shadowAccounts,
    scanData.deepfake,
    scanData.phishing,
  ])

  useEffect(() => {
    return () => {
      clearScheduledUpdates()
    }
  }, [clearScheduledUpdates])

  const value = useMemo<ScanContextValue>(
    () => ({
      email: scanData.email,
      scanData,
      loadingCards,
      startScan,
      triggerCardScan,
    }),
    [loadingCards, scanData, startScan, triggerCardScan],
  )

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>
}

export function useScanContext() {
  const context = useContext(ScanContext)
  if (!context) {
    throw new Error('useScanContext must be used inside ScanProvider')
  }
  return context
}
