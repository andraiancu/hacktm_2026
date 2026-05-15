import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '~/state/AuthContext'
import { supabase } from '~/utils/supabase'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

function AccountPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDeleteAccount = async () => {
    if (!supabase) {
      setError('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.')
      return
    }

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        'Delete your account permanently? This action cannot be undone.',
      )
      if (!confirmed) {
        return
      }
    }

    setIsDeleting(true)
    setError('')

    const { error: rpcError } = await supabase.rpc('delete_user')
    if (rpcError) {
      setError(
        'Account deletion failed. Ensure a secure Supabase SQL function named delete_user exists and uses auth.uid().',
      )
      setIsDeleting(false)
      return
    }

    await supabase.auth.signOut()
    void navigate({ to: '/' })
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-bg-main px-6 py-16 text-text-secondary">
        <p className="mx-auto max-w-xl text-sm text-text-muted">Checking session...</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="min-h-screen bg-bg-main px-6 py-16 text-text-secondary">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-card/85 p-6 backdrop-blur-md md:p-8">
          <h1 className="text-2xl font-black uppercase tracking-[0.08em] text-text-primary">Account</h1>
          <p className="mt-4 text-sm text-text-muted">You are not logged in.</p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl border border-border-strong/70 bg-accent-lime px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-bg-deep transition-colors hover:bg-accent-lime-soft"
          >
            Go To Login
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-bg-main px-6 py-16 text-text-secondary">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-card/85 p-6 backdrop-blur-md md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-lime">Account</p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-text-primary md:text-4xl">
          {user.email}
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          This page currently supports account deletion only.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={() => void handleDeleteAccount()}
          disabled={isDeleting}
          className="mt-8 h-12 w-full rounded-xl border border-red-600 bg-transparent px-6 text-xs font-black uppercase tracking-[0.24em] text-red-300 transition-colors hover:bg-red-700/20 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </section>
  )
}
