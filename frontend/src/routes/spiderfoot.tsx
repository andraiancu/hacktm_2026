import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

export const Route = createFileRoute('/spiderfoot')({
  component: SpiderFootConsole,
})

type ScanResult = {
  generated: number
  data: string
  source_data: string
  module: string
  type: string
  confidence: number
  visibility: number
  risk: number
  hash: string
  source_event_hash: string
  event_descr: string
  event_type: string
  false_positive: boolean
}

type ScanResponse = {
  scan_id: string
  name: string
  target: string
  created: number
  started: number
  ended: number
  status: string
  result_count: number
  results: ScanResult[]
}

type ScanLog = {
  generated: number
  component: string
  type: string
  message: string
  rowid: number
}

const TERMINAL_STATUSES = new Set(['FINISHED', 'ERROR-FAILED', 'ABORTED', 'ABORTING'])

function SpiderFootConsole() {
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_SPIDERFOOT_API_URL ?? 'http://localhost:8000',
    [],
  )

  const [target, setTarget] = useState('example.com')
  const [targetType, setTargetType] = useState<'INTERNET_NAME' | 'EMAILADDR' | 'USERNAME'>(
    'INTERNET_NAME',
  )
  const [scanId, setScanId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [results, setResults] = useState<ScanResult[]>([])
  const [resultCount, setResultCount] = useState(0)
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!scanId) return

    let active = true
    let timer: number | undefined

    const fetchScan = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/scan/${scanId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch scan status')
        }
        const data = (await res.json()) as ScanResponse
        if (!active) return

        setStatus(data.status)
        setResults(data.results)
        setResultCount(data.result_count)

        const logRes = await fetch(`${apiBaseUrl}/scan/${scanId}/logs?limit=500`)
        if (logRes.ok) {
          const logData = (await logRes.json()) as { logs: ScanLog[] }
          if (active) {
            setLogs(logData.logs)
          }
        }

        if (TERMINAL_STATUSES.has(data.status)) {
          if (timer) {
            clearInterval(timer)
          }
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    timer = window.setInterval(fetchScan, 2000)
    void fetchScan()

    return () => {
      active = false
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [apiBaseUrl, scanId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    setStatus('')
    setResults([])
    setResultCount(0)
    setLogs([])

    try {
      const res = await fetch(`${apiBaseUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, target_type: targetType , modules: ['sfp_whois', 'sfp_accounts'] }),
      })

      if (!res.ok) {
        throw new Error('Scan request failed')
      }

      const data = (await res.json()) as { scan_id: string }
      setScanId(data.scan_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-main px-6 py-12 font-mono text-text-secondary">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent-lime">
            SpiderFoot Console
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-text-primary">
            Live OSINT Test Harness
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            Modules enabled: sfp__stor_db, sfp_whois.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-white/10 bg-bg-card/80 p-6 backdrop-blur-md"
          >
            <CornerAccents />
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-text-muted">
                  Target
                </label>
                <input
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-bg-secondary px-3 text-sm text-text-primary outline-none focus:border-border-strong"
                  placeholder="example.com or username"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-text-muted">
                  Target Type
                </label>
                <select
                  value={targetType}
                  onChange={(event) =>
                    setTargetType(event.target.value as 'INTERNET_NAME' | 'EMAILADDR' | 'USERNAME')
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-bg-secondary px-3 text-sm text-text-primary outline-none focus:border-border-strong"
                >
                  <option value="INTERNET_NAME">INTERNET_NAME</option>
                  <option value="EMAILADDR">EMAILADDR</option>
                  <option value="USERNAME">USERNAME</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl border border-border-strong/70 bg-accent-lime text-xs font-black uppercase tracking-[0.3em] text-bg-deep transition-colors hover:bg-accent-lime-soft disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/20 disabled:text-text-muted"
              >
                {isSubmitting ? 'LAUNCHING' : 'START SCAN'}
              </button>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
          </form>

          <div className="relative rounded-2xl border border-white/10 bg-bg-card/80 p-6 backdrop-blur-md">
            <CornerAccents />
            <p className="text-xs uppercase tracking-[0.25em] text-accent-lime">Status</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Scan ID: <span className="text-text-secondary">{scanId ?? '—'}</span></p>
              <p>State: <span className="text-text-secondary">{status || 'Idle'}</span></p>
              <p>Total results: <span className="text-text-secondary">{resultCount}</span></p>
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Polling every 2s while the scan is active.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-accent-lime">
              Results
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              Showing {results.length} of {resultCount}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-card/80 backdrop-blur-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-text-muted">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                      No results yet.
                    </td>
                  </tr>
                ) : (
                  results.map((row) => (
                    <tr key={row.hash} className="border-b border-white/5">
                      <td className="px-4 py-3 text-text-primary">{row.type}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        <span className="block max-w-[480px] truncate">{row.data}</span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{row.module}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.risk}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-accent-lime">
              Logs
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              {logs.length} entries
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-card/80 backdrop-blur-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-text-muted">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-text-muted">
                      No logs yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((row) => (
                    <tr key={row.rowid} className="border-b border-white/5">
                      <td className="px-4 py-3 text-text-secondary">{row.type}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.component}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        <span className="block max-w-[720px] whitespace-pre-wrap break-words">
                          {row.message}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function CornerAccents() {
  return (
    <>
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-border-strong/80" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-border-strong/80" />
    </>
  )
}
