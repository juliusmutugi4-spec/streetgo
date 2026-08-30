'use client'

import Post from './Post'

type PostCardProps =
  React.ComponentProps<typeof Post>

export default function PostCard(
  props: PostCardProps
) {
  return (
    <div
      className="
        relative
        w-full
        m-0
        p-0
      "
    >
      <Post {...props} />
    </div>
  )
}