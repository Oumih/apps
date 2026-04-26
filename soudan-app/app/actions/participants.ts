'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function joinPost(postId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'ログインが必要です' }
  }

  // Layer 2: Check participation cap before DB insert
  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  const { data: post } = await supabase
    .from('posts')
    .select('max_participants, user_id')
    .eq('id', postId)
    .single()

  if (!post) {
    return { error: '投稿が見つかりません' }
  }

  if (post.user_id === session.user.id) {
    return { error: '自分の投稿には参加できません' }
  }

  if ((count ?? 0) >= post.max_participants) {
    return { error: '定員に達しています' }
  }

  const { error } = await supabase.from('participants').insert({
    post_id: postId,
    user_id: session.user.id,
  })

  // Unique constraint violation = already joined
  if (error?.code === '23505') {
    return { error: 'すでに参加しています' }
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function leavePost(postId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'ログインが必要です' }
  }

  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', session.user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}
