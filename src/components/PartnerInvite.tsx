import { useState } from 'react'
import type { Household } from '../lib/api'

interface PartnerInviteProps {
  household: Household
  onClose: () => void
}

export function PartnerInvite({ household, onClose }: PartnerInviteProps) {
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${window.location.origin}?join=${household.invite_code}`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(household.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = household.invite_code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'Join my household on Shared Tasks',
          text: `Join our shared task list! Use code: ${household.invite_code}`,
          url: inviteUrl,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyCode()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Invite your partner</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-white/80 text-sm">
            Share this code to let them join {household.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Invite code */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-2">Invite Code</p>
            <div className="text-4xl font-mono font-bold tracking-widest text-gray-900">
              {household.invite_code}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCopyCode}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>

            {'share' in navigator && (
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Invite Link
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl">
            <h4 className="font-medium text-amber-800 mb-2">How to join</h4>
            <ol className="text-sm text-amber-700 space-y-1">
              <li>1. Your partner opens the app</li>
              <li>2. Signs in with their email</li>
              <li>3. Enters the code above</li>
              <li>4. You're connected! 🎉</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
