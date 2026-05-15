import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '~/state/AuthContext'
import { supabase } from '~/utils/supabase'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      void navigate({ to: '/account' })
    }
  }, [navigate, user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      setMessage('')
      return
    }

    if (!supabase) {
      setError('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.')
      setMessage('')
      return
    }

    setIsSubmitting(true)
    setError('')
    setMessage('')

    const redirectUrl =
      import.meta.env.VITE_SUPABASE_REDIRECT_URL?.trim() ||
      (typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined)

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: redirectUrl ? { emailRedirectTo: redirectUrl } : undefined,
    })

    if (signInError) {
      setError(signInError.message)
      setMessage('')
      setIsSubmitting(false)
      return
    }

    setMessage('Magic link sent. Check your inbox and open the link on this device.')
    setIsSubmitting(false)
  }

  return (
    <section className="min-h-screen bg-bg-main px-6 py-16 text-text-secondary">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-card/85 p-6 backdrop-blur-md md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-lime">Sentinel Access</p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-text-primary md:text-4xl">
          Login With Magic Link
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Enter your email and we will send you a secure one-time sign-in link.
        </p>

        {!isConfigured && (
          <p className="mt-4 rounded-lg border border-warning-strong/40 bg-warning-strong/20 px-3 py-2 text-xs text-warning">
            Supabase is not configured in this environment.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label
              htmlFor="auth-email"
              className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-300"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) {
                  setError('')
                }
              }}
              className="h-12 w-full rounded-xl border border-white/10 bg-bg-secondary px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-border-strong"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-accent-lime-soft">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !isConfigured}
            className="h-12 w-full rounded-xl border border-border-strong/70 bg-accent-lime px-6 text-xs font-black uppercase tracking-[0.24em] text-bg-deep transition-colors hover:bg-accent-lime-soft disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/20 disabled:text-text-muted"
          >
            {isSubmitting ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-text-primary"
        >
          Back To Landing
        </Link>
      </div>
    </section>
  )
}
