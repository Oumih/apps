'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PostCard } from './PostCard'
import { joinPost } from '@/app/actions/participants'

const TAGS = ['恋愛', '仕事', 'メンタル', 'その他']

interface PostData {
  id: string
  title: string
  content?: string | null
  tag: string
  max_participants: number
  created_at: string
  user_id: string
  profiles: { display_name: string }
  participants: [{ count: number }]
  comments: [{ count: number }]
}

interface PostListProps {
  posts: PostData[]
  currentTag?: string
  currentUserId?: string
  participationMap?: Record<string, boolean>
}

export function PostList({ posts, currentTag, currentUserId = '', participationMap = {} }: PostListProps) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)

  const handleTagFilter = (tag: string | null) => {
    if (tag) {
      router.push(`?tag=${encodeURIComponent(tag)}`)
    } else {
      router.push('?')
    }
  }

  const handleJoinClick = async (postId: string) => {
    setJoining(true)
    const result = await joinPost(postId)
    setJoining(false)
    // 常に投稿詳細ページに遷移
    router.push(`/posts/${postId}`)
  }

  // Sort: posts with available slots first, then by newest
  const sortedPosts = [...posts].sort((a, b) => {
    const aIsFull = a.participants[0]?.count >= a.max_participants
    const bIsFull = b.participants[0]?.count >= b.max_participants

    if (aIsFull && !bIsFull) return 1
    if (!aIsFull && bIsFull) return -1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Tag Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleTagFilter(null)}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            !currentTag
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          すべて
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagFilter(tag)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              currentTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">投稿がありません</p>
          </div>
        ) : (
          sortedPosts.map((post) => (
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
              onJoinClick={handleJoinClick}
              isParticipant={participationMap[post.id] ?? false}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}
