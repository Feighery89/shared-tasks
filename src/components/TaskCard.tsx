import { useState } from 'react'
import type { Task, User } from '../lib/api'

interface TaskCardProps {
  task: Task
  currentUser: User
  onClaim: (taskId: string) => Promise<void>
  onUnclaim: (taskId: string) => Promise<void>
  onComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

export function TaskCard({
  task,
  currentUser,
  onClaim,
  onUnclaim,
  onComplete,
  onDelete,
}: TaskCardProps) {
  const [swiping, setSwiping] = useState(false)
  const [startX, setStartX] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [loading, setLoading] = useState(false)

  const isClaimedByMe = task.claimed_by === currentUser.id
  const isClaimed = !!task.claimed_by
  const claimedByName = task.claimed_by_user?.name || 'Someone'

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    // Only allow right swipe (to complete)
    if (diff > 0) {
      setOffsetX(Math.min(diff, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (offsetX > 60) {
      // Complete the task
      setLoading(true)
      await onComplete(task.id)
      setLoading(false)
    }
    setOffsetX(0)
    setSwiping(false)
  }

  const handleClaim = async () => {
    setLoading(true)
    if (isClaimedByMe) {
      await onUnclaim(task.id)
    } else {
      await onClaim(task.id)
    }
    setLoading(false)
  }

  const handleComplete = async () => {
    setLoading(true)
    await onComplete(task.id)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      setLoading(true)
      await onDelete(task.id)
      setLoading(false)
    }
  }

  const swipeProgress = offsetX / 100

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe background */}
      <div
        className="absolute inset-0 flex items-center justify-start pl-6 rounded-2xl"
        style={{
          backgroundColor: `rgb(16 185 129 / ${swipeProgress * 0.8})`,
        }}
      >
        <svg
          className="w-8 h-8 text-white"
          style={{ opacity: swipeProgress }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Card */}
      <div
        className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 ${
          isClaimedByMe
            ? 'border-orange-300 bg-orange-50'
            : isClaimed
            ? 'border-blue-200 bg-blue-50'
            : 'border-amber-200 bg-amber-50'
        } ${loading ? 'opacity-50' : ''}`}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-4 flex items-center gap-3">
          {/* Complete button (desktop) */}
          <button
            onClick={handleComplete}
            disabled={loading}
            className="hidden sm:flex w-8 h-8 rounded-full border-2 border-gray-300 items-center justify-center hover:border-green-500 hover:bg-green-50 transition-colors flex-shrink-0"
            title="Mark complete"
          >
            <svg
              className="w-4 h-4 text-gray-400 hover:text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium text-gray-900 truncate">
              {task.title}
            </p>
            <p className="text-sm text-gray-500">
              {isClaimed ? (
                isClaimedByMe ? (
                  <span className="text-orange-600 font-medium">You're on it</span>
                ) : (
                  <span className="text-blue-600">{claimedByName} claimed this</span>
                )
              ) : (
                <span className="text-amber-600">Up for grabs</span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Claim/Unclaim button */}
            <button
              onClick={handleClaim}
              disabled={loading || (isClaimed && !isClaimedByMe)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isClaimedByMe
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : isClaimed
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {isClaimedByMe ? 'Release' : isClaimed ? 'Claimed' : 'Claim'}
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Swipe hint on mobile */}
        <div className="sm:hidden px-4 pb-3">
          <p className="text-xs text-gray-400 text-center">
            Swipe right to complete →
          </p>
        </div>
      </div>
    </div>
  )
}
