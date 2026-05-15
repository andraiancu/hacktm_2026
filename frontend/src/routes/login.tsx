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
    <section className="min-h-screen bg-[#050505] px-6 py-16 text-slate-300">
      <div className="mx-auto max-w-xl border border-white/10 bg-black/50 p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">Sentinel Access</p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-white md:text-4xl">
          Login With Magic Link
        </h1>
        <p className="mt-4 text-sm text-slate-400">
          Enter your email and we will send you a secure one-time sign-in link.
        </p>

        {!isConfigured && (
          <p className="mt-4 border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
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
              className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-600"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-300">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !isConfigured}
            className="h-12 w-full border border-red-600 bg-red-600 px-6 text-xs font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:border-red-900 disabled:bg-red-900/60"
          >
            {isSubmitting ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-white"
        >
          Back To Landing
        </Link>
      </div>
    </section>
  )
}
