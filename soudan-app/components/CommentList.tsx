interface Comment {
  id: string
  content: string
  user_id: string
  created_at: string
  profiles: {
    display_name: string
  }
}

interface CommentListProps {
  comments: Comment[]
  currentUserId?: string
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        まだコメントがありません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isOwnComment = comment.user_id === currentUserId

        return (
          <div
            key={comment.id}
            className={`flex flex-col gap-2 ${isOwnComment ? 'items-end' : 'items-start'}`}
          >
            {!isOwnComment && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  👤 {comment.profiles.display_name || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <div
                className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                  isOwnComment
                    ? 'bg-amber-600 rounded-br-none text-white'
                    : 'bg-white rounded-tl-none text-slate-900 font-medium border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>

            {isOwnComment && (
              <span className="text-xs text-gray-500 mr-2">
                {new Date(comment.created_at).toLocaleString('ja-JP')}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
