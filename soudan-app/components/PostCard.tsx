import Link from 'next/link'

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  '恋愛': { bg: 'bg-slate-100', text: 'text-slate-700' },
  '仕事': { bg: 'bg-slate-100', text: 'text-slate-700' },
  'メンタル': { bg: 'bg-slate-100', text: 'text-slate-700' },
  'その他': { bg: 'bg-slate-100', text: 'text-slate-700' },
}

interface PostCardProps {
  id: string
  title: string
  content?: string | null
  tag: string
  maxParticipants: number
  participantCount: number
  commentCount: number
  createdAt: string
  authorName: string
  authorId: string
  onJoinClick: (postId: string) => void
  isParticipant: boolean
  currentUserId?: string
  showParticipateButton?: boolean
}

export function PostCard({
  id,
  title,
  content,
  tag,
  maxParticipants,
  participantCount,
  commentCount,
  createdAt,
  authorName,
  authorId,
  onJoinClick,
  isParticipant,
  currentUserId,
  showParticipateButton = true,
}: PostCardProps) {
  const isFull = participantCount >= maxParticipants
  const isOwnPost = currentUserId === authorId
  const tagColor = TAG_COLORS[tag]

  // Truncate content to 150 chars
  const truncatedContent = content
    ? content.length > 150
      ? content.substring(0, 150) + '...'
      : content
    : null

  return (
    <Link href={`/posts/${id}`}>
      <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer border border-gray-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
            {title}
          </h3>
          {isOwnPost && (
            <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full whitespace-nowrap">
              👤 私の投稿
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${tagColor?.bg} ${tagColor?.text} shadow-sm`}>
            {tag}
          </span>
          <span className="text-sm font-medium text-gray-600">👤 {authorName}</span>
        </div>

        {truncatedContent && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2 font-medium">
            {truncatedContent}
          </p>
        )}

        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 bg-slate-50 rounded-lg p-3">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              👥 <span className="font-bold text-gray-900">{participantCount}/{maxParticipants}</span>
            </span>
            <span className="flex items-center gap-1">
              💬 <span className="font-bold text-gray-900">{commentCount}</span>
            </span>
          </div>
          <span className="text-gray-500">{new Date(createdAt).toLocaleDateString('ja-JP')}</span>
        </div>

      </div>
    </Link>
  )
}
