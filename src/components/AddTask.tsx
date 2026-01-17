import { useState, useRef, useEffect } from 'react'

interface AddTaskProps {
  onAdd: (title: string) => Promise<void>
  disabled?: boolean
}

export function AddTask({ onAdd, disabled }: AddTaskProps) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || loading || disabled) return

    setLoading(true)
    await onAdd(title.trim())
    setTitle('')
    setLoading(false)
    inputRef.current?.focus()
  }

  // Auto-focus on mount for desktop
  useEffect(() => {
    if (window.innerWidth >= 640) {
      inputRef.current?.focus()
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 bg-gradient-to-t from-amber-50 via-amber-50 to-transparent pt-4 pb-6">
      <div
        className={`flex items-center gap-2 bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
          focused ? 'border-orange-400 shadow-orange-100' : 'border-gray-200'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Add a task..."
          disabled={disabled || loading}
          className="flex-1 px-5 py-4 bg-transparent text-lg placeholder-gray-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!title.trim() || loading || disabled}
          className="m-2 w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors"
        >
          {loading ? (
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
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
