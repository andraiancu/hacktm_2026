import { Link } from '@tanstack/react-router'

export function NotFound({ children }: { children?: any }) {
  return (
    <div className="min-h-screen bg-bg-main px-6 py-16 text-text-secondary">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-card/85 p-6 backdrop-blur-md md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-lime">
          Not Found
        </p>
        <div className="mt-4 text-text-muted">
          {children || <p>The page you are looking for does not exist.</p>}
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="rounded-xl border border-border-strong/70 bg-accent-lime px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bg-deep transition-colors hover:bg-accent-lime-soft"
        >
          Go back
        </button>
        <Link
          to="/"
          className="rounded-xl border border-white/10 bg-bg-secondary px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-text-secondary transition-colors hover:border-border-strong/70 hover:text-text-primary"
        >
          Start Over
        </Link>
        </p>
      </div>
    </div>
  )
}
