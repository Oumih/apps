'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createComment(postId: string, content: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'ログインが必要です' }
  }

  if (!content?.trim()) {
    return { error: 'コメントを入力してください' }
  }

  // 投稿者を取得
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  // 投稿者は自動的に参加者とみなす
  const isAuthor = post?.user_id === session.user.id

  if (!isAuthor) {
    // 非投稿者の場合は参加確認
    const { data: participation } = await supabase
      .from('participants')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!participation) {
      return { error: 'この投稿に参加していません' }
    }
  }

  // コメント投稿
  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: session.user.id,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}
