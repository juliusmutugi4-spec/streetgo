import { supabase } from "./supabase"

const LIMIT = 10

export async function getPosts(cursor: string | null = null) {
  let query = supabase
    .from("posts")
    .select(`
      *,
      profiles (
        username
      )
    `)
    .order("created_at", { ascending: false })
    .limit(LIMIT)

  if (cursor) {
    query = query.lt("created_at", cursor)
  }

  return await query
}

export function subscribeToPosts(
  onInsert: (post: any) => void
) {
  const channel = supabase
    .channel("posts-live-feed")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "posts",
      },
      (payload: any) => {
        onInsert(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}