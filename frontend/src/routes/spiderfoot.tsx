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
    <div className="min-h-screen bg-[#050505] px-6 py-12 font-mono text-slate-200">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="border-b border-red-900/40 pb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-red-600">
            SpiderFoot Console
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-white">
            Live OSINT Test Harness
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Modules enabled: sfp__stor_db, sfp_whois.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="relative border border-red-900/40 bg-black/60 p-6"
          >
            <CornerAccents />
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Target
                </label>
                <input
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="mt-2 h-12 w-full border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-red-600"
                  placeholder="example.com or username"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Target Type
                </label>
                <select
                  value={targetType}
                  onChange={(event) =>
                    setTargetType(event.target.value as 'INTERNET_NAME' | 'EMAILADDR' | 'USERNAME')
                  }
                  className="mt-2 h-12 w-full border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-red-600"
                >
                  <option value="INTERNET_NAME">INTERNET_NAME</option>
                  <option value="EMAILADDR">EMAILADDR</option>
                  <option value="USERNAME">USERNAME</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full border border-red-600 bg-red-600 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'LAUNCHING' : 'START SCAN'}
              </button>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
          </form>

          <div className="relative border border-white/10 bg-black/60 p-6">
            <CornerAccents />
            <p className="text-xs uppercase tracking-[0.25em] text-red-500">Status</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Scan ID: <span className="text-slate-300">{scanId ?? '—'}</span></p>
              <p>State: <span className="text-slate-300">{status || 'Idle'}</span></p>
              <p>Total results: <span className="text-slate-300">{resultCount}</span></p>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Polling every 2s while the scan is active.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Results
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Showing {results.length} of {resultCount}
            </span>
          </div>
          <div className="overflow-hidden border border-white/10 bg-black/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400">
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
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No results yet.
                    </td>
                  </tr>
                ) : (
                  results.map((row) => (
                    <tr key={row.hash} className="border-b border-white/5">
                      <td className="px-4 py-3 text-slate-200">{row.type}</td>
                      <td className="px-4 py-3 text-slate-400">
                        <span className="block max-w-[480px] truncate">{row.data}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{row.module}</td>
                      <td className="px-4 py-3 text-slate-400">{row.risk}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Logs
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {logs.length} entries
            </span>
          </div>
          <div className="overflow-hidden border border-white/10 bg-black/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      No logs yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((row) => (
                    <tr key={row.rowid} className="border-b border-white/5">
                      <td className="px-4 py-3 text-slate-300">{row.type}</td>
                      <td className="px-4 py-3 text-slate-400">{row.component}</td>
                      <td className="px-4 py-3 text-slate-400">
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
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-red-600" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-red-600" />
    </>
  )
}
