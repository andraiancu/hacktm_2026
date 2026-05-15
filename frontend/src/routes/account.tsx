import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '~/state/AuthContext'
import { supabase } from '~/utils/supabase'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

type UsernameRow = {
  id: string
  username: string
  created_at: string
}

type EmailRow = {
  id: string
  email: string
  created_at: string
  confirmed_at: string | null
}

type PhoneRow = {
  id: string
  prefix: string
  phone_number: string
  e164: string
  created_at: string
  confirmed_at: string | null
}

const USERNAMES_TABLE = 'user_profile_usernames'
const EMAILS_TABLE = 'user_profile_emails'
const PHONES_TABLE = 'user_profile_phones'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function normalizeUsername(value: string) {
  return value.trim()
}

function normalizePhone(prefix: string, phoneNumber: string) {
  const cleanedPrefix = prefix.replace(/\s+/g, '')
  const cleanedPhone = phoneNumber.replace(/[^\d]/g, '')
  return {
    prefix: cleanedPrefix,
    phoneNumber: cleanedPhone,
    e164: `${cleanedPrefix}${cleanedPhone}`,
  }
}

function validateUsername(username: string) {
  if (!username) {
    return 'Enter a username.'
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters.'
  }
  if (!/^[A-Za-z0-9._-]+$/.test(username)) {
    return 'Use only letters, numbers, dot, underscore, or hyphen.'
  }
  return ''
}

function validateEmail(email: string) {
  if (!email) {
    return 'Enter an email address.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address.'
  }
  return ''
}

function validatePhone(prefix: string, phoneNumber: string) {
  if (!prefix) {
    return 'Enter a country prefix.'
  }
  if (!/^\+[1-9]\d{0,3}$/.test(prefix)) {
    return 'Prefix must start with + followed by 1 to 4 digits.'
  }
  if (!phoneNumber) {
    return 'Enter a phone number.'
  }
  if (!/^\d{4,14}$/.test(phoneNumber)) {
    return 'Phone number should contain 4 to 14 digits.'
  }
  return ''
}

function AccountPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const [isLoadingRecords, setIsLoadingRecords] = useState(true)
  const [usernames, setUsernames] = useState<UsernameRow[]>([])
  const [emails, setEmails] = useState<EmailRow[]>([])
  const [phones, setPhones] = useState<PhoneRow[]>([])

  const [newUsername, setNewUsername] = useState('')
  const [newUsernameError, setNewUsernameError] = useState('')
  const [editingUsernameId, setEditingUsernameId] = useState<string | null>(null)
  const [editingUsernameValue, setEditingUsernameValue] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [newEmailError, setNewEmailError] = useState('')
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [editingEmailValue, setEditingEmailValue] = useState('')

  const [newPhonePrefix, setNewPhonePrefix] = useState('+1')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newPhoneError, setNewPhoneError] = useState('')
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null)
  const [editingPhonePrefix, setEditingPhonePrefix] = useState('+1')
  const [editingPhoneNumber, setEditingPhoneNumber] = useState('')

  const accountEmail = useMemo(() => normalizeEmail(user?.email ?? ''), [user?.email])

  const loadRecords = async () => {
    if (!user || !supabase) {
      setIsLoadingRecords(false)
      return
    }

    setIsLoadingRecords(true)
    setErrorMessage('')

    const [usernameResult, emailResult, phoneResult] = await Promise.all([
      supabase
        .from(USERNAMES_TABLE)
        .select('id, username, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from(EMAILS_TABLE)
        .select('id, email, created_at, confirmed_at')
        .order('created_at', { ascending: false }),
      supabase
        .from(PHONES_TABLE)
        .select('id, prefix, phone_number, e164, created_at, confirmed_at')
        .order('created_at', { ascending: false }),
    ])

    if (usernameResult.error || emailResult.error || phoneResult.error) {
      setErrorMessage(
        usernameResult.error?.message ||
          emailResult.error?.message ||
          phoneResult.error?.message ||
          'Could not load account history.',
      )
      setIsLoadingRecords(false)
      return
    }

    const emailRows = (emailResult.data ?? []) as EmailRow[]
    const emailAlreadyIncluded = accountEmail
      ? emailRows.some((row) => normalizeEmail(row.email) === accountEmail)
      : true

    if (!emailAlreadyIncluded && accountEmail) {
      const insertResult = await supabase
        .from(EMAILS_TABLE)
        .insert({ user_id: user.id, email: accountEmail })
        .select('id, email, created_at, confirmed_at')
        .single()

      if (!insertResult.error && insertResult.data) {
        emailRows.unshift(insertResult.data as EmailRow)
      }
    }

    setUsernames((usernameResult.data ?? []) as UsernameRow[])
    setEmails(emailRows)
    setPhones((phoneResult.data ?? []) as PhoneRow[])
    setIsLoadingRecords(false)
  }

  useEffect(() => {
    void loadRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleDeleteAccount = async () => {
    if (!supabase) {
      setErrorMessage('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.')
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
    setErrorMessage('')

    const { error: rpcError } = await supabase.rpc('delete_user')
    if (rpcError) {
      setErrorMessage(
        'Account deletion failed. Ensure a secure Supabase SQL function named delete_user exists and uses auth.uid().',
      )
      setIsDeleting(false)
      return
    }

    await supabase.auth.signOut()
    void navigate({ to: '/' })
  }

  const handleAddUsername = async () => {
    if (!user || !supabase) {
      return
    }

    const username = normalizeUsername(newUsername)
    const validationError = validateUsername(username)
    if (validationError) {
      setNewUsernameError(validationError)
      return
    }

    const result = await supabase
      .from(USERNAMES_TABLE)
      .insert({ user_id: user.id, username })
      .select('id, username, created_at')
      .single()

    if (result.error) {
      setNewUsernameError(result.error.message)
      return
    }

    setUsernames((current) => [result.data as UsernameRow, ...current])
    setNewUsername('')
    setNewUsernameError('')
  }

  const handleSaveUsername = async (id: string) => {
    if (!supabase) {
      return
    }

    const username = normalizeUsername(editingUsernameValue)
    const validationError = validateUsername(username)
    if (validationError) {
      setNewUsernameError(validationError)
      return
    }

    const result = await supabase
      .from(USERNAMES_TABLE)
      .update({ username })
      .eq('id', id)
      .select('id, username, created_at')
      .single()

    if (result.error) {
      setNewUsernameError(result.error.message)
      return
    }

    setUsernames((current) => current.map((item) => (item.id === id ? (result.data as UsernameRow) : item)))
    setEditingUsernameId(null)
    setEditingUsernameValue('')
    setNewUsernameError('')
  }

  const handleDeleteUsername = async (id: string) => {
    if (!supabase) {
      return
    }
    const result = await supabase.from(USERNAMES_TABLE).delete().eq('id', id)
    if (result.error) {
      setErrorMessage(result.error.message)
      return
    }
    setUsernames((current) => current.filter((item) => item.id !== id))
  }

  const handleAddEmail = async () => {
    if (!user || !supabase) {
      return
    }

    const email = normalizeEmail(newEmail)
    const validationError = validateEmail(email)
    if (validationError) {
      setNewEmailError(validationError)
      return
    }

    const result = await supabase
      .from(EMAILS_TABLE)
      .insert({ user_id: user.id, email })
      .select('id, email, created_at, confirmed_at')
      .single()

    if (result.error) {
      setNewEmailError(result.error.message)
      return
    }

    setEmails((current) => [result.data as EmailRow, ...current])
    setNewEmail('')
    setNewEmailError('')
  }

  const handleSaveEmail = async (id: string) => {
    if (!supabase) {
      return
    }

    const email = normalizeEmail(editingEmailValue)
    const validationError = validateEmail(email)
    if (validationError) {
      setNewEmailError(validationError)
      return
    }

    const result = await supabase
      .from(EMAILS_TABLE)
      .update({ email })
      .eq('id', id)
      .select('id, email, created_at, confirmed_at')
      .single()

    if (result.error) {
      setNewEmailError(result.error.message)
      return
    }

    setEmails((current) => current.map((item) => (item.id === id ? (result.data as EmailRow) : item)))
    setEditingEmailId(null)
    setEditingEmailValue('')
    setNewEmailError('')
  }

  const handleDeleteEmail = async (id: string) => {
    if (!supabase) {
      return
    }
    const result = await supabase.from(EMAILS_TABLE).delete().eq('id', id)
    if (result.error) {
      setErrorMessage(result.error.message)
      return
    }
    setEmails((current) => current.filter((item) => item.id !== id))
  }

  const handleAddPhone = async () => {
    if (!user || !supabase) {
      return
    }

    const normalized = normalizePhone(newPhonePrefix, newPhoneNumber)
    const validationError = validatePhone(normalized.prefix, normalized.phoneNumber)
    if (validationError) {
      setNewPhoneError(validationError)
      return
    }

    const result = await supabase
      .from(PHONES_TABLE)
      .insert({
        user_id: user.id,
        prefix: normalized.prefix,
        phone_number: normalized.phoneNumber,
        e164: normalized.e164,
      })
      .select('id, prefix, phone_number, e164, created_at, confirmed_at')
      .single()

    if (result.error) {
      setNewPhoneError(result.error.message)
      return
    }

    setPhones((current) => [result.data as PhoneRow, ...current])
    setNewPhonePrefix('+1')
    setNewPhoneNumber('')
    setNewPhoneError('')
  }

  const handleSavePhone = async (id: string) => {
    if (!supabase) {
      return
    }

    const normalized = normalizePhone(editingPhonePrefix, editingPhoneNumber)
    const validationError = validatePhone(normalized.prefix, normalized.phoneNumber)
    if (validationError) {
      setNewPhoneError(validationError)
      return
    }

    const result = await supabase
      .from(PHONES_TABLE)
      .update({
        prefix: normalized.prefix,
        phone_number: normalized.phoneNumber,
        e164: normalized.e164,
      })
      .eq('id', id)
      .select('id, prefix, phone_number, e164, created_at, confirmed_at')
      .single()

    if (result.error) {
      setNewPhoneError(result.error.message)
      return
    }

    setPhones((current) => current.map((item) => (item.id === id ? (result.data as PhoneRow) : item)))
    setEditingPhoneId(null)
    setEditingPhonePrefix('+1')
    setEditingPhoneNumber('')
    setNewPhoneError('')
  }

  const handleDeletePhone = async (id: string) => {
    if (!supabase) {
      return
    }
    const result = await supabase.from(PHONES_TABLE).delete().eq('id', id)
    if (result.error) {
      setErrorMessage(result.error.message)
      return
    }
    setPhones((current) => current.filter((item) => item.id !== id))
  }

  const handleConfirmNoop = (label: string) => {
    setInfoMessage(`${label} confirmation is coming soon.`)
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#050505] px-6 py-16 text-slate-300">
        <p className="mx-auto max-w-xl text-sm text-slate-400">Checking session...</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="min-h-screen bg-[#050505] px-6 py-16 text-slate-300">
        <div className="mx-auto max-w-xl border border-white/10 bg-black/50 p-6 md:p-8">
          <h1 className="text-2xl font-black uppercase tracking-[0.08em] text-white">Account</h1>
          <p className="mt-4 text-sm text-slate-400">You are not logged in.</p>
          <Link
            to="/login"
            className="mt-6 inline-block border border-red-600 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-700"
          >
            Go To Login
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#050505] px-6 py-16 text-slate-300">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="border border-white/10 bg-black/50 p-6 md:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">Account</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-white md:text-4xl">
            {user.email}
          </h1>
          <p className="mt-4 text-sm text-slate-400">
            Manage every identity detail you have used over the years.
          </p>
          {infoMessage && <p className="mt-4 text-sm text-emerald-300">{infoMessage}</p>}
          {errorMessage && <p className="mt-4 text-sm text-red-400">{errorMessage}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="border border-white/10 bg-black/50 p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Usernames</h2>
            <p className="mt-2 text-xs text-slate-500">Add all aliases and handles you used historically.</p>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(event) => {
                  setNewUsername(event.target.value)
                  if (newUsernameError) {
                    setNewUsernameError('')
                  }
                }}
                placeholder="username"
                className="h-11 flex-1 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => void handleAddUsername()}
                className="h-11 border border-red-600 bg-red-600 px-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-700"
              >
                Add
              </button>
            </div>
            {newUsernameError && <p className="mt-2 text-xs text-red-400">{newUsernameError}</p>}

            <div className="mt-4 space-y-2">
              {isLoadingRecords && <p className="text-xs text-slate-500">Loading usernames...</p>}
              {!isLoadingRecords && usernames.length === 0 && (
                <p className="text-xs text-slate-500">No usernames saved yet.</p>
              )}
              {usernames.map((item) => (
                <div key={item.id} className="border border-white/10 bg-black/40 p-3">
                  {editingUsernameId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingUsernameValue}
                        onChange={(event) => setEditingUsernameValue(event.target.value)}
                        className="h-10 flex-1 border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveUsername(item.id)}
                        className="h-10 border border-red-600 bg-red-600 px-3 text-xs font-bold uppercase text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUsernameId(null)
                          setEditingUsernameValue('')
                        }}
                        className="h-10 border border-white/20 px-3 text-xs font-bold uppercase text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-white">{item.username}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUsernameId(item.id)
                            setEditingUsernameValue(item.username)
                          }}
                          className="h-8 border border-white/20 px-3 text-[11px] font-bold uppercase text-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteUsername(item.id)}
                          className="h-8 border border-red-900/50 px-3 text-[11px] font-bold uppercase text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="border border-white/10 bg-black/50 p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Emails</h2>
            <p className="mt-2 text-xs text-slate-500">Your account email is auto-included the first time you open this page.</p>

            <div className="mt-4 flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value)
                  if (newEmailError) {
                    setNewEmailError('')
                  }
                }}
                placeholder="name@example.com"
                className="h-11 flex-1 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => void handleAddEmail()}
                className="h-11 border border-red-600 bg-red-600 px-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-700"
              >
                Add
              </button>
            </div>
            {newEmailError && <p className="mt-2 text-xs text-red-400">{newEmailError}</p>}

            <div className="mt-4 space-y-2">
              {isLoadingRecords && <p className="text-xs text-slate-500">Loading emails...</p>}
              {!isLoadingRecords && emails.length === 0 && (
                <p className="text-xs text-slate-500">No emails saved yet.</p>
              )}
              {emails.map((item) => (
                <div key={item.id} className="border border-white/10 bg-black/40 p-3">
                  {editingEmailId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={editingEmailValue}
                        onChange={(event) => setEditingEmailValue(event.target.value)}
                        className="h-10 flex-1 border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveEmail(item.id)}
                        className="h-10 border border-red-600 bg-red-600 px-3 text-xs font-bold uppercase text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmailId(null)
                          setEditingEmailValue('')
                        }}
                        className="h-10 border border-white/20 px-3 text-xs font-bold uppercase text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white">{item.email}</span>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          {item.confirmed_at ? 'Confirmed' : 'Unconfirmed'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEmailId(item.id)
                            setEditingEmailValue(item.email)
                          }}
                          className="h-8 border border-white/20 px-3 text-[11px] font-bold uppercase text-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteEmail(item.id)}
                          className="h-8 border border-red-900/50 px-3 text-[11px] font-bold uppercase text-red-300"
                        >
                          Delete
                        </button>
                        {!item.confirmed_at && (
                          <button
                            type="button"
                            onClick={() => handleConfirmNoop('Email')}
                            className="h-8 border border-emerald-900/50 px-3 text-[11px] font-bold uppercase text-emerald-300"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="border border-white/10 bg-black/50 p-6 md:col-span-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Phone Numbers</h2>
            <p className="mt-2 text-xs text-slate-500">Add with prefix and local number in a friendly split format.</p>

            <div className="mt-4 grid gap-2 md:grid-cols-[120px_1fr_auto]">
              <input
                type="text"
                value={newPhonePrefix}
                onChange={(event) => {
                  setNewPhonePrefix(event.target.value)
                  if (newPhoneError) {
                    setNewPhoneError('')
                  }
                }}
                placeholder="+40"
                className="h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-600"
              />
              <input
                type="tel"
                value={newPhoneNumber}
                onChange={(event) => {
                  setNewPhoneNumber(event.target.value)
                  if (newPhoneError) {
                    setNewPhoneError('')
                  }
                }}
                placeholder="712345678"
                className="h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => void handleAddPhone()}
                className="h-11 border border-red-600 bg-red-600 px-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-700"
              >
                Add
              </button>
            </div>
            {newPhoneError && <p className="mt-2 text-xs text-red-400">{newPhoneError}</p>}

            <div className="mt-4 space-y-2">
              {isLoadingRecords && <p className="text-xs text-slate-500">Loading phone numbers...</p>}
              {!isLoadingRecords && phones.length === 0 && (
                <p className="text-xs text-slate-500">No phone numbers saved yet.</p>
              )}
              {phones.map((item) => (
                <div key={item.id} className="border border-white/10 bg-black/40 p-3">
                  {editingPhoneId === item.id ? (
                    <div className="grid gap-2 md:grid-cols-[120px_1fr_auto_auto]">
                      <input
                        type="text"
                        value={editingPhonePrefix}
                        onChange={(event) => setEditingPhonePrefix(event.target.value)}
                        className="h-10 border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-red-600"
                      />
                      <input
                        type="tel"
                        value={editingPhoneNumber}
                        onChange={(event) => setEditingPhoneNumber(event.target.value)}
                        className="h-10 border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSavePhone(item.id)}
                        className="h-10 border border-red-600 bg-red-600 px-3 text-xs font-bold uppercase text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhoneId(null)
                          setEditingPhonePrefix('+1')
                          setEditingPhoneNumber('')
                        }}
                        className="h-10 border border-white/20 px-3 text-xs font-bold uppercase text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white">{item.prefix} {item.phone_number}</span>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          {item.confirmed_at ? 'Confirmed' : 'Unconfirmed'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPhoneId(item.id)
                            setEditingPhonePrefix(item.prefix)
                            setEditingPhoneNumber(item.phone_number)
                          }}
                          className="h-8 border border-white/20 px-3 text-[11px] font-bold uppercase text-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeletePhone(item.id)}
                          className="h-8 border border-red-900/50 px-3 text-[11px] font-bold uppercase text-red-300"
                        >
                          Delete
                        </button>
                        {!item.confirmed_at && (
                          <button
                            type="button"
                            onClick={() => handleConfirmNoop('Phone number')}
                            className="h-8 border border-emerald-900/50 px-3 text-[11px] font-bold uppercase text-emerald-300"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="border border-white/10 bg-black/50 p-6 md:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">Danger Zone</p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">Delete Account</h2>
          <p className="mt-3 text-sm text-slate-400">This permanently removes your account.</p>

          <button
            type="button"
            onClick={() => void handleDeleteAccount()}
            disabled={isDeleting}
            className="mt-6 h-12 w-full border border-red-600 bg-transparent px-6 text-xs font-black uppercase tracking-[0.24em] text-red-300 transition-colors hover:bg-red-700/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>

        <Link
          to="/"
          className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-white"
        >
          Back To Landing
        </Link>
      </div>
    </section>
  )
}
