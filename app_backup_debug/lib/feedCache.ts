export let cachedPosts: any[] = []
export let cachedPredictions: any[] = []
export let cachedVoteCounts: any = {}

export function clearFeedCache() {
  cachedPosts = []
  cachedPredictions = []
  cachedVoteCounts = {}
}