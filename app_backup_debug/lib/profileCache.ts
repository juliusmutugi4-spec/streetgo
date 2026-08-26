export type CachedProfile = {
  username: string
  avatar_url: string | null
  bio?: string
  reputation?: number
  predictions_correct?: number
  predictions_wrong?: number
}

const profileCache = new Map<string, CachedProfile>()

export function setCachedProfile(
  username: string,
  profile: CachedProfile
) {
  profileCache.set(username, profile)
}

export function getCachedProfile(username: string) {
  return profileCache.get(username)
}