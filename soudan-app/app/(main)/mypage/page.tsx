import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function MyPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">ログインが必要です</p>
      </div>
    )
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* User Info */}
      <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-4xl font-black text-amber-700">
          👤 マイページ
        </h1>
        <div className="mt-6 space-y-3">
          <p className="text-2xl font-bold text-slate-900">
            ✨ {profile?.display_name || session.user.email}
          </p>
          <p className="text-sm font-medium text-slate-600">
            📧 {session.user.email}
          </p>
        </div>
      </div>
    </div>
  )
}
