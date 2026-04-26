import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ParticipateButton } from '@/components/ParticipateButton'
import { CommentList } from '@/components/CommentList'
import { CommentForm } from '@/components/CommentForm'

interface PageParams {
  id: string
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Fetch post with author and participant count
  const { data: post } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      tag,
      max_participants,
      user_id,
      created_at,
      profiles!posts_user_id_fkey ( display_name ),
      participants ( count ),
      comments ( count )
    `)
    .eq('id', id)
    .single()

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">投稿が見つかりません</h1>
          <Link href="/posts" className="text-slate-700 hover:text-slate-900 font-bold">
            投稿一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      user_id,
      created_at,
      profiles!comments_user_id_fkey ( display_name )
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const isAuthor = session?.user.id === post.user_id

  // Check if current user is a participant
  let isParticipant = false
  if (session) {
    // 投稿者は自動的に参加者
    if (isAuthor) {
      isParticipant = true
    } else {
      const { data: participation } = await supabase
        .from('participants')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle()

      isParticipant = participation !== null
    }
  }
  const participantCount = post.participants[0]?.count ?? 0
  const commentCount = post.comments[0]?.count ?? 0
  const isFull = participantCount >= post.max_participants

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/posts" className="text-slate-700 hover:text-slate-900 text-sm mb-8 inline-block font-bold hover:underline">
        ← 相談一覧に戻る
      </Link>

      {/* Post Title and Info */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-4xl font-black text-blue-700 flex-1 leading-tight">{post.title}</h1>
          {isParticipant && !isAuthor && (
            <ParticipateButton postId={id} isParticipant={isParticipant} isFull={isFull} isSmall={true} />
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-full">
            {post.tag}
          </span>
          <span className="text-slate-700 font-semibold">👤 {post.profiles.display_name || 'Anonymous'}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{new Date(post.created_at).toLocaleString('ja-JP')}</span>
        </div>
      </div>

      {/* Participate Section - for non-participants */}
      {!isAuthor && !isParticipant && (
        <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <ParticipateButton postId={id} isParticipant={isParticipant} isFull={isFull} />
        </div>
      )}

      {/* Chat-like conversation thread */}
      <div className="space-y-5">
        {/* Author's message (post content) */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-900 text-lg">📝 {post.profiles.display_name || 'Anonymous'}</span>
            <span className="text-xs text-slate-500">{new Date(post.created_at).toLocaleString('ja-JP')}</span>
          </div>
          {post.content ? (
            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">{post.content}</p>
          ) : (
            <p className="text-slate-500 italic">本文なし</p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm font-bold text-slate-700">
            👥 参加: <span className="text-slate-900">{participantCount}/{post.max_participants}</span>
            {isFull && <span className="ml-2 text-red-600">🔴 満席</span>}
          </div>
        </div>

        {/* Comments thread */}
        <CommentList comments={comments || []} currentUserId={session?.user.id} />

        {/* Comment Form - Only for participants */}
        {(isParticipant || isAuthor) && (
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <CommentForm postId={id} />
          </div>
        )}
      </div>
    </div>
  )
}
