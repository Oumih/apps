'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await register(email, password, displayName)
      if (error) {
        setError(error.message)
      } else {
        // ログイン状態に移行するため少し待つ
        setTimeout(() => router.push('/posts'), 1000)
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
        <h1 className="text-4xl font-black text-blue-700">
          ✨ アカウント登録
        </h1>
        <p className="mt-3 text-slate-600 font-semibold">soudan-app に登録しましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm font-bold">
            ❌ {error}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-sm font-bold text-slate-800 mb-2">
            👤 ニックネーム
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            placeholder="ニックネーム"
          />
        </div>

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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
        >
          {loading ? '⏳ 登録中...' : '🚀 登録'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        すでにアカウントをお持ちの場合は{' '}
        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
          ここからログイン
        </Link>
      </p>
    </div>
  )
}
