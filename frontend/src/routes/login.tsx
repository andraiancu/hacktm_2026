import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void navigate({ to: '/deeper-scan/details' })
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white" style={{ backgroundColor: '#101319' }}>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <section
          className="w-full max-w-md rounded-xl border border-white/10 bg-[rgba(29,32,38,0.8)] p-8 backdrop-blur-xl"
          aria-labelledby="login-title"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#c6f311]">
            SECURE ACCESS
          </p>
          <h1 id="login-title" className="mt-3 text-3xl font-semibold text-white">
            Register or sign in
          </h1>
          <p className="mt-2 text-sm text-slate-300">Enter your email to continue your privacy scan</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-mono text-[11px] uppercase tracking-[0.28em] text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#c6f311]/60 focus:ring-2 focus:ring-[#c6f311]/15"
                required
              />
            </div>

            <p className="text-xs text-slate-400">
              No password needed. We'll use your email to start or continue your scan.
            </p>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#c6f311] text-sm font-semibold text-[#101319] transition hover:bg-[#d9ff43]"
            >
              Continue with email
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              You'll be redirected to the deeper scan page.
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}
