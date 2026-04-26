'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinPost, leavePost } from '@/app/actions/participants'

interface ParticipateButtonProps {
  postId: string
  isParticipant: boolean
  isFull: boolean
  isSmall?: boolean
}

export function ParticipateButton({
  postId,
  isParticipant,
  isFull,
  isSmall,
}: ParticipateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isParticipant) {
    return (
      <div className="space-y-3">
        <button
          onClick={async () => {
            setLoading(true)
            setError(null)
            const result = await leavePost(postId)
            if (result.error) {
              setError(result.error)
            }
            setLoading(false)
          }}
          disabled={loading}
          className={`bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
            isSmall
              ? 'px-3 py-1 text-xs'
              : 'px-4 py-2 w-full'
          }`}
        >
          {loading ? '🔄 処理中...' : '❌ 参加をやめる'}
        </button>
        {error && <p className="text-sm text-red-600 font-bold">❌ {error}</p>}
      </div>
    )
  }

  if (isFull) {
    return (
      <button
        disabled
        className={`bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed opacity-50 ${
          isSmall
            ? 'px-3 py-1 text-xs'
            : 'px-4 py-2 w-full'
        }`}
      >
        🔴 満席です
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={async () => {
          setLoading(true)
          setError(null)
          const result = await joinPost(postId)
          if (result.error) {
            setError(result.error)
          } else {
            // ページをリロードして参加状態を反映
            router.refresh()
          }
          setLoading(false)
        }}
        disabled={loading}
        className={`bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
          isSmall
            ? 'px-3 py-1 text-xs'
            : 'px-4 py-3 w-full'
        }`}
      >
        {loading ? '⏳ 参加中...' : '✅ 参加する'}
      </button>
      {error && <p className="text-sm text-red-600 font-bold">❌ {error}</p>}
    </div>
  )
}
