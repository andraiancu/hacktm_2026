import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/deeper-scan/details')({
  component: DeeperScanDetailsPage,
})

function DeeperScanDetailsPage() {
  return (
    <main className="min-h-screen px-6 py-10 text-white" style={{ backgroundColor: '#101319' }}>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[rgba(29,32,38,0.8)] p-8 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#c6f311]">
            POST AUTH
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Deeper scan details</h1>
          <p className="mt-2 text-sm text-slate-300">
            Placeholder route for the next Sentinel Pulse step.
          </p>

          <Link
            to="/login"
            className="mt-8 inline-flex text-xs font-mono uppercase tracking-[0.24em] text-[#c6f311] transition hover:text-[#d9ff43]"
          >
            ← Back to login
          </Link>
        </section>
      </div>
    </main>
  )
}
