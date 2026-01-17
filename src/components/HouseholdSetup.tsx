import { useState } from 'react'

interface HouseholdSetupProps {
  onCreateHousehold: (name: string) => Promise<{ error: Error | null }>
  onJoinHousehold: (inviteCode: string) => Promise<{ error: Error | null }>
  onUpdateProfile: (data: { name: string; avatar_color: string }) => Promise<{ error: Error | null }>
  userEmail: string
  hasName: boolean
}

const AVATAR_COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
]

export function HouseholdSetup({
  onCreateHousehold,
  onJoinHousehold,
  onUpdateProfile,
  userEmail,
  hasName,
}: HouseholdSetupProps) {
  const [step, setStep] = useState<'profile' | 'choice' | 'create' | 'join'>(hasName ? 'choice' : 'profile')
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0])
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || loading) return

    setLoading(true)
    setError(null)

    const { error } = await onUpdateProfile({
      name: name.trim(),
      avatar_color: selectedColor,
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('choice')
    }

    setLoading(false)
  }

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!householdName.trim() || loading) return

    setLoading(true)
    setError(null)

    const { error } = await onCreateHousehold(householdName.trim())

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim() || loading) return

    setLoading(true)
    setError(null)

    const { error } = await onJoinHousehold(inviteCode.trim())

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  // Profile step
  if (step === 'profile') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-gray-600">Let's set up your profile</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-xl p-6">
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Your name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                disabled={loading}
                className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
                required
                autoFocus
              />
            </label>

            <div className="mb-6">
              <span className="text-sm font-medium text-gray-700 block mb-2">Pick your color</span>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full transition-transform ${
                      selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Signed in as {userEmail}
            </p>
          </form>
        </div>
      </div>
    )
  }

  // Choice step
  if (step === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set up your household</h1>
            <p className="text-gray-600">Create a new one or join your partner</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep('create')}
              className="w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create new household</h3>
                  <p className="text-sm text-gray-500">Start fresh and invite your partner</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('join')}
              className="w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Join existing household</h3>
                  <p className="text-sm text-gray-500">Enter an invite code from your partner</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Create household step
  if (step === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep('choice')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your household</h1>
            <p className="text-gray-600">Give it a name — you can change it later</p>
          </div>

          <form onSubmit={handleCreateHousehold} className="bg-white rounded-2xl shadow-xl p-6">
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Household name</span>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="The Smith Family"
                disabled={loading}
                className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
                required
                autoFocus
              />
            </label>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !householdName.trim()}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Creating...' : 'Create Household'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Join household step
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="w-full max-w-md">
        <button
          onClick={() => setStep('choice')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join household</h1>
          <p className="text-gray-600">Enter the code your partner shared</p>
        </div>

        <form onSubmit={handleJoinHousehold} className="bg-white rounded-2xl shadow-xl p-6">
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Invite code</span>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              disabled={loading}
              className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors text-lg text-center font-mono tracking-widest uppercase"
              required
              autoFocus
              maxLength={6}
            />
          </label>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Joining...' : 'Join Household'}
          </button>
        </form>
      </div>
    </div>
  )
}
