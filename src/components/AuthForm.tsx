import { useState } from 'react'

interface AuthFormProps {
  onSignIn: (email: string) => Promise<{ error: Error | null; magicLink: string | null; token: string | null }>
}

export function AuthForm({ onSignIn }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError(null)

    const { error, magicLink } = await onSignIn(email)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
      // In dev mode, show the link directly
      if (magicLink) {
        setDevLink(magicLink)
      }
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📬</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h1>
            <p className="text-gray-600">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Click the link in the email to sign in
            </p>
          </div>

          {/* Dev mode: Show link directly */}
          {devLink && (
            <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 font-medium mb-2">
                🔧 Dev Mode: Click to sign in directly
              </p>
              <a
                href={devLink}
                className="text-sm text-orange-600 hover:text-orange-700 underline break-all"
              >
                {devLink}
              </a>
            </div>
          )}

          <button
            onClick={() => {
              setSent(false)
              setEmail('')
              setDevLink(null)
            }}
            className="w-full text-center text-orange-600 hover:text-orange-700 font-medium"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Tasks</h1>
          <p className="text-gray-600">Simple task sharing for couples</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6">
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
              required
            />
          </label>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Magic Link
              </>
            )}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            No password needed — we'll email you a sign in link
          </p>
        </form>
      </div>
    </div>
  )
}
