'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-browser'
import { PostCard } from './PostCard'

interface Post {
  id: string
  title: string
  content?: string | null
  tag: string
  max_participants: number
  user_id: string
  created_at: string
  profiles: { display_name: string }
  participants: [{ count: number }]
  comments: [{ count: number }]
}

interface PostListTabsProps {
  activeTab: 'my' | 'all' | 'participating'
  currentUserId?: string
}

export function PostListTabs({ activeTab, currentUserId }: PostListTabsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [participationMap, setParticipationMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)

      let query = supabase
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
        .order('created_at', { ascending: false })

      if (activeTab === 'my') {
        // 自分の投稿のみ
        query = query.eq('user_id', currentUserId)
      } else if (activeTab === 'all') {
        // 自分が投稿していない、かつ参加していない投稿のみ
        const { data: allPosts } = await query

        // 自分の参加情報を取得
        const { data: participations } = await supabase
          .from('participants')
          .select('post_id')
          .eq('user_id', currentUserId)

        const participatedPostIds = new Set(participations?.map((p) => p.post_id) || [])

        // フィルタリング: 自分が投稿していない && 参加していない
        const filteredPosts = (allPosts || []).filter(
          (p) => p.user_id !== currentUserId && !participatedPostIds.has(p.id)
        )

        setPosts(filteredPosts)
        setLoading(false)
        return
      } else if (activeTab === 'participating') {
        // 参加している投稿のみ
        const { data: participatingData } = await supabase
          .from('participants')
          .select(`
            posts (
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
            )
          `)
          .eq('user_id', currentUserId)
          .order('joined_at', { ascending: false })

        const participatingPosts = (participatingData || []).map((item: any) => item.posts)
        setPosts(participatingPosts)
        setLoading(false)
        return
      }

      const { data } = await query
      setPosts(data || [])

      // 参加情報をフェッチ
      if (currentUserId && activeTab !== 'my') {
        const { data: participations } = await supabase
          .from('participants')
          .select('post_id')
          .eq('user_id', currentUserId)

        const map = participations?.reduce(
          (acc, p) => ({ ...acc, [p.post_id]: true }),
          {}
        ) || {}
        setParticipationMap(map)
      }

      setLoading(false)
    }

    if (currentUserId) {
      fetchPosts()
    }
  }, [activeTab, currentUserId])

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          {activeTab === 'my' && '投稿がありません'}
          {activeTab === 'all' && '参加可能な相談がありません'}
          {activeTab === 'participating' && '参加している相談がありません'}
        </p>
        {activeTab === 'all' && (
          <Link href="/posts/new" className="text-blue-600 hover:text-blue-700">
            新しい相談を投稿する
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          title={post.title}
          content={post.content}
          tag={post.tag}
          maxParticipants={post.max_participants}
          participantCount={post.participants[0]?.count ?? 0}
          commentCount={post.comments[0]?.count ?? 0}
          createdAt={post.created_at}
          authorName={post.profiles.display_name || 'Anonymous'}
          authorId={post.user_id}
          onJoinClick={async (postId) => {
            // 参加して詳細ページに遷移
            await supabase.from('participants').insert({
              post_id: postId,
              user_id: currentUserId,
            })
            window.location.href = `/posts/${postId}`
          }}
          isParticipant={participationMap[post.id] ?? false}
          currentUserId={currentUserId}
          showParticipateButton={activeTab === 'all'}
        />
      ))}
    </div>
  )
}
