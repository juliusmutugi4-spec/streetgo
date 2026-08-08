'use client'

import Post from './Post'

type PostCardProps = React.ComponentProps<typeof Post>

export default function PostCard(props: PostCardProps) {
  return (
    <div className="relative">
      <Post {...props} />
    </div>
  )
}