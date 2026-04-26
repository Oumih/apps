'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(prevState: unknown, formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { errors: { _root: ['ログインが必要です'] } }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const tag = formData.get('tag') as string
  const maxParticipants = parseInt(formData.get('max_participants') as string, 10)

  // Validation
  if (!title?.trim() || title.length > 100) {
    return { errors: { title: ['タイトルを入力してください（100文字以内）'] } }
  }

  if (!['恋愛', '仕事', 'メンタル', 'その他'].includes(tag)) {
    return { errors: { tag: ['タグを選択してください'] } }
  }

  if (![1, 3, 5].includes(maxParticipants)) {
    return { errors: { max_participants: ['最大回答人数を選択してください'] } }
  }

  const { error } = await supabase.from('posts').insert({
    title,
    content: content || null,
    tag,
    max_participants: maxParticipants,
    user_id: session.user.id,
  })

  if (error) {
    return { errors: { _root: [error.message] } }
  }

  revalidatePath('/posts')
  redirect('/posts')
}
