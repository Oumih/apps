'use client'

import { useState } from 'react'
import { createComment } from '@/app/actions/comments'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await createComment(postId, content)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setContent('')
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="comment" className="block text-sm font-bold text-gray-800">
        💬 回答を投稿
      </label>

      <textarea
        id="comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        rows={4}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none disabled:bg-gray-100 font-medium text-gray-700 placeholder-gray-400"
        placeholder="💡 回答や意見を書いてください"
      />

      {error && <p className="text-sm font-bold text-red-600">❌ {error}</p>}
      {success && <p className="text-sm font-bold text-green-600">✅ コメントを投稿しました</p>}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
      >
        {loading ? '📤 投稿中...' : '📤 投稿する'}
      </button>
    </form>
  )
}
