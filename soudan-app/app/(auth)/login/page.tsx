'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await login(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/posts')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-amber-700">
          💬 soudan-app
        </h1>
        <p className="mt-3 text-slate-600 font-semibold">✨ ちょい相談マッチングアプリ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm font-bold">
            ❌ {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">
            📧 メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-2">
            🔑 パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
        >
          {loading ? '⏳ ログイン中...' : '🚀 ログイン'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        アカウントがない場合は{' '}
        <Link href="/register" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">
          ここから登録
        </Link>
      </p>
    </div>
  )
}
