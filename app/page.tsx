'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import PostCard from './components/PostCard'
import DispatchMenu from "./components/DispatchMenu"
import CreatePost from './components/CreatePost'
import ImageViewer from './components/ImageViewer'

import LoginModal from './components/LoginModal'
import TopNav from './components/TopNav'
import StreetGOUpdateBar from './components/StreetGOUpdateBar'
import BottomNav from './components/BottomNav'
import CreatePrediction from './components/CreatePrediction'
import DiscussionRoom from "@/app/components/DiscussionRoom"
import { registerPushNotifications } from './lib/pushNotifications'
import { useFeed } from './hooks/useFeed'
import { usePredictions } from "./hooks/usePredictions"
import { useAuth } from "./hooks/useAuth"
import { useDriver } from "./hooks/useDriver"
import PredictionDrawer from './components/PredictionDrawer'
import SplashScreen from './components/SplashScreen'
import DriverOperationsHub from './components/DriverOperationsHub'
import { useRouter } from 'next/navigation'
import DatingCircle from './components/DatingCircle'
type PostType = {
  id: string
  content: string
  video_url?: string | null
  user_id: string
  created_at: string
  username?: string
  avatar_url?: string | null
}

type ImageLikeRow = {
  image_index: number
  user_id: string
}


type PredictionType = {
  id: string
  title: string
  description: string
  username?: string
  avatar_url?: string | null
  created_at: string
  user_id: string
}


export default function Home() {
const router = useRouter()
  const {
  posts,
  setPosts,
  loading,
  fetchPosts,
} = useFeed()
const {
  user,
  profile,
  unreadCount,
  checkUser,
  handleLogout,
} = useAuth()

console.log("PROFILE:", profile)
  const [showLogin, setShowLogin] = useState(false)

  
const {
  isApprovedDriver,
  setIsApprovedDriver,

  driverOnline,
  setDriverOnline,

  pendingRideCount,
  setPendingRideCount,

  loadPendingRideCount,
  loadDriver,
  toggleDriverOnline,
} = useDriver(user)

const {
  predictions,
  setPredictions,
  voteCounts,
  setVoteCounts,
  fetchPredictions,
  fetchVoteCounts,
  votePrediction,
} = usePredictions(user)
const [showNav, setShowNav] = useState(true)
const [videoPortalOpen, setVideoPortalOpen] = useState(false)
const [showLoader, setShowLoader] = useState(false)
const [showSplash, setShowSplash] = useState(true)
const [hydrated, setHydrated] = useState(false)
const [loadingProgress, setLoadingProgress] = useState(0)
const [loadingStatus, setLoadingStatus] = useState("Starting StreetGO...")
const [activePostId, setActivePostId] = useState<string | null>(null)
const [discussionOpen, setDiscussionOpen] = useState(false)
const [dispatchPost, setDispatchPost] = useState<PostType | null>(null)
const [selectedPost, setSelectedPost] = useState<PostType | null>(null)

const [discussionComments, setDiscussionComments] = useState<any[]>([])

const [imageViewerOpen, setImageViewerOpen] = useState(false)

const [viewerImages, setViewerImages] = useState<string[]>([])

const [viewerCurrentImage, setViewerCurrentImage] = useState(0)

const [viewerUsername, setViewerUsername] = useState('')

const [viewerAvatarUrl, setViewerAvatarUrl] = useState('')


const [isImageLiked, setIsImageLiked] = useState(false)
const [imageLikes, setImageLikes] = useState<number[]>([])
const [imageComments, setImageComments] = useState<any[]>([])
const [imageCommentText, setImageCommentText] = useState('')
const [showImageComments, setShowImageComments] = useState(false)



const imageCommentsRequest = useRef(0)

const loadImageComments = async (
  postId: string,
  imageIndex: number
) => {
  const requestId = ++imageCommentsRequest.current

  // Remove comments belonging to the previous image immediately
  setImageComments([])

  const { data, error } = await supabase
    .from("image_comments")
    .select("*")
    .eq("post_id", postId)
    .eq("image_index", imageIndex)
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    console.error("IMAGE COMMENTS LOAD ERROR:", error)
    return
  }

  // Ignore an old request if the user already moved
  // to another image.
  if (requestId !== imageCommentsRequest.current) return

  setImageComments(data || [])
}


useEffect(() => {
  if (!imageViewerOpen || !selectedPost) return

  loadImageComments(
    selectedPost.id,
    viewerCurrentImage
  )
}, [
  imageViewerOpen,
  selectedPost,
  viewerCurrentImage,
])


const lastScrollY = useRef(0)

const [predictionDrawerOpen, setPredictionDrawerOpen] = useState(false)

const [createMode, setCreateMode] = useState<
  'none' | 'post' | 'prediction'
>('none')

const onCreateSelect = (
  mode: 'post' | 'prediction'
) => {
  setCreateMode(mode)
}



  // Fetch unread messages count


useEffect(() => {
  setHydrated(true)

  const hasLoaded =
    sessionStorage.getItem("streetgo_splash") === "done"

  setShowSplash(!hasLoaded)
}, [])


useEffect(() => {
  if (discussionOpen || dispatchPost !== null) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = ""
  }

  return () => {
    document.body.style.overflow = ""
  }
}, [discussionOpen, dispatchPost])


useEffect(() => {
  let isMounted = true;

  const initializeApp = async () => {
    try {
      setLoadingProgress(10);
      await loadDriver();
      if (!isMounted) return;

      setLoadingProgress(40);
      await Promise.all([
        fetchPredictions(),
        fetchVoteCounts(),
        loadPendingRideCount()
      ]);
      if (!isMounted) return;

      setLoadingProgress(80);
      try {
  await registerPushNotifications();
} catch(err) {
  console.log("Push skipped", err)
}
      if (!isMounted) return;

      setLoadingProgress(100);
 setTimeout(() => {
  if (!isMounted) return

  setLoadingStatus("Ready")
  setLoadingProgress(100)

  sessionStorage.setItem("streetgo_splash", "done")
  setShowSplash(false)
}, 400)
    } catch (error) {
      console.error("App initialization failed:", error);
      // Optional: Add a simple error message if needed
    }
  };

if (
  sessionStorage.getItem("streetgo_splash") !== "done"
) {
  initializeApp();
}

  return () => {
    isMounted = false;
  };
}, [user]);



useEffect(() => {
  let timer: NodeJS.Timeout

  if (loading) {
    timer = setTimeout(() => {
      setShowLoader(true)
    }, 150) // show loader only if loading lasts >150ms
  } else {
    setShowLoader(false)
  }

  return () => clearTimeout(timer)
}, [loading])




useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY

    // Hide nav when scrolling down
    if (
  currentScrollY > lastScrollY.current &&
  currentScrollY > 80
) {
      setShowNav(false)
    }

    // Show nav when scrolling up
    if (currentScrollY < lastScrollY.current) {
      setShowNav(true)
    }

    lastScrollY.current = currentScrollY
  }

  window.addEventListener("scroll", handleScroll)

  return () => {
    window.removeEventListener("scroll", handleScroll)
  }
}, [])








const resolvePrediction = async (
  predictionId: string,
  status: 'correct' | 'wrong',
  creatorId: string
) => {

  // Update prediction status
const { data, error: predictionError } = await supabase
  .from('predictions')
  .update({ status })
  .eq('id', predictionId)
  .select()


  // Get creator profile
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('reputation, predictions_correct, predictions_wrong')
  .eq('id', creatorId)
  .single()


  if (!profileData) return

  if (status === 'correct') {
  
    await supabase
      .from('profiles')
      .update({
        reputation: (profileData.reputation || 0) + 10,
        predictions_correct:
          (profileData.predictions_correct || 0) + 1,
      })
      .eq('id', creatorId)
  }

  if (status === 'wrong') {
const { data: updateData, error: updateError } = await supabase
  .from('profiles')
  .update({
    reputation: (profileData.reputation || 0) + 10,
    predictions_correct:
      (profileData.predictions_correct || 0) + 1,
  })
  .eq('id', creatorId)
  .select()


  }

  fetchPredictions()
}

if (!hydrated) {
  return null
}

if (showSplash) {
  return (
    <SplashScreen
      progress={loadingProgress}
      status={loadingStatus}
    />
  )
}

const handleSendComment = async (message: string) => {
  if (!user) {
    console.error("No logged in user")
    return
  }

  if (!selectedPost) {
    console.error("No selected post")
    return
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: selectedPost.id,
      user_id: user.id,
      username: profile?.username ?? "Unknown",
      avatar_url: profile?.avatar_url,
      content: message,
      
    })
    .select()
    .single()

  if (error) {
    console.error("COMMENT ERROR:", error)
    return
  }

  setDiscussionComments(prev => [...prev, data])
}

const toggleImageLike = async () => {
  if (!user) {
    setShowLogin(true)
    return
  }

  const postId = selectedPost?.id

  if (!postId) {
    console.error("No post selected for image like")
    return
  }

  const imageIndex = viewerCurrentImage

  const { data: existingLike, error: checkError } = await supabase
    .from("image_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("image_index", imageIndex)
    .eq("user_id", user.id)
    .maybeSingle()

  if (checkError) {
    console.error("IMAGE LIKE CHECK ERROR:", checkError)
    return
  }

  if (existingLike) {
    const { error } = await supabase
      .from("image_likes")
      .delete()
      .eq("id", existingLike.id)

    if (error) {
      console.error("IMAGE UNLIKE ERROR:", error)
      return
    }

    setIsImageLiked(false)

setImageLikes(prev => {
  const updated = [...prev]
  updated[viewerCurrentImage] = Math.max(
    0,
    (updated[viewerCurrentImage] || 0) - 1
  )
  return updated
})

  } else {
    const { error } = await supabase
      .from("image_likes")
      .insert({
        post_id: postId,
        image_index: imageIndex,
        user_id: user.id,
      })

if (error) {
  console.error("=== IMAGE LIKE ERROR ===")
  console.error("message:", error.message)
  console.error("code:", error.code)
  console.error("details:", error.details)
  console.error("hint:", error.hint)
  console.error("full error:", JSON.stringify(error, null, 2))
  return
}

    setIsImageLiked(true)

setImageLikes(prev => {
  const updated = [...prev]
  updated[viewerCurrentImage] =
    (updated[viewerCurrentImage] || 0) + 1
  return updated
})


  }
}


const addImageComment = async () => {
  if (!user) {
    setShowLogin(true)
    return
  }

  const postId = selectedPost?.id

  if (!postId) {
    console.error("No post selected for image comment")
    return
  }

  const content = imageCommentText.trim()

  if (!content) return

  const imageIndex = viewerCurrentImage

  const { data, error } = await supabase
    .from("image_comments")
    .insert({
      post_id: postId,
      image_index: imageIndex,
      user_id: user.id,
      username: profile?.username ?? "Unknown",
      avatar_url: profile?.avatar_url ?? null,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error("IMAGE COMMENT ERROR:", error)
    return
  }

  setImageComments(prev => [...prev, data])
  setImageCommentText("")
}






  return (
    <main className="min-h-screen bg-[#060608] text-[#f4f4f5] antialiased selection:bg-emerald-500/30 font-sans tracking-tight relative overflow-x-hidden">
{/* TopNav fixed wrapper */}
<div
  className={`
    fixed
    top-0
    left-0
    right-0
    z-50
    transform
    transition-transform
    duration-500
    ${
      videoPortalOpen || !showNav
        ? "-translate-y-full"
        : "translate-y-0"
    }
  `}
  style={{
    // A slightly deeper fluid curve for a silky, smooth slide at 500ms
    transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.3, 1)'
  }}
>
  <TopNav
    user={user}
    onLogin={() => setShowLogin(true)}
    onLogout={handleLogout}
  />
  </div>

  {/* STREETGO TOP UPDATES */}
  <StreetGOUpdateBar maxItems={3} />

  {/* Feeleo ni kunyambad scrollable */}
  <div
  className="
    max-w-7xl
    mx-auto
    pt-[64px]
    px-0
    pb-20
    lg:px-4
    lg:grid
    lg:grid-cols-12
    lg:gap-6
  "
>


{/* MAIN FEED */}
<div className="w-full min-w-0 lg:col-span-6">
<DatingCircle />

        {user && (
          <div className="group relative rounded-xl bg-zinc-900/20 border border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-zinc-800/80">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="p-4">


            </div>
          </div>
        )}

        {showLoader && posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent animate-pulse" />
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
            
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md">
            <p className="text-sm font-mono text-zinc-500 tracking-wide"> INDEX_EMPTY: No packets detected on this stream. </p>
          </div>

          
) : (
  <div className="space-y-2">
    {posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        user={user}
        profile={profile}
        isActive={activePostId === post.id}
        setActivePostId={setActivePostId}
        onOpenDiscussion={(currentPost, comments) => {
          setSelectedPost(currentPost);
          setDiscussionComments(comments);
          setDiscussionOpen(true);
        }}

onOpenDispatch={() => setDispatchPost(post)}

        onOpenImageViewer={(imageUrls, imageIndex, username, avatarUrl) => {
          setSelectedPost(post);
          setViewerImages(imageUrls);
          setViewerCurrentImage(imageIndex);
          setViewerUsername(username);
          setViewerAvatarUrl(avatarUrl);
          setImageComments([]);
          setImageCommentText("");
          setShowImageComments(false);
          setImageViewerOpen(true);

          (async () => {
            try {
              const { data, error } = await supabase
                .from("image_likes")
                .select("image_index, user_id")
                .eq("post_id", post.id);

              if (error) throw error;

const counts = imageUrls.map(
  (_: string, idx: number) =>
    data?.filter(
      (row: ImageLikeRow) => row.image_index === idx
    ).length ?? 0
);
              setImageLikes(counts);

         const currentUserLiked =
  data?.some(
    (row: ImageLikeRow) =>
      row.image_index === imageIndex &&
      row.user_id === user?.id
  ) ?? false;
              setIsImageLiked(currentUserLiked);
            } catch (err) {
              console.error("IMAGE LIKES LOAD ERROR:", err);
            }
          })();
        }}
      />
    ))}
  </div>
)}

      </div>
</div>




<button
  onClick={() => setPredictionDrawerOpen(true)}
  className={`
    fixed left-0 top-1/2 z-50
    flex h-28 w-6 items-center justify-center rounded-r-md
    border-y border-r border-slate-800 bg-slate-950/90 backdrop-blur-sm
    text-slate-400 shadow-lg shadow-black/20
    
    transition-all duration-300 ease-out
    hover:bg-slate-900 hover:text-blue-400 hover:border-slate-700
    
    ${
      videoPortalOpen || !showNav
        ? "-translate-x-full opacity-0 pointer-events-none"
        : "translate-x-0 -translate-y-1/2 opacity-100"
    }
    
    group
  `}
  aria-label="Open predictions"
>
  {/* Rotating Text */}
  <span
    className="
      block -rotate-90 whitespace-nowrap
      text-[9px] font-bold uppercase tracking-[0.3em]
      transition-colors duration-200
      pointer-events-none
    "
  >
    rada ya mtaa
  </span>

  {/* Glow indicator bar on the left edge */}
  <div
    className="
      absolute left-0 top-1/4 h-1/2 w-[2px]
      bg-transparent group-hover:bg-blue-500
      shadow-[0_0_8px_#3b82f6]
      transition-colors duration-200
    "
  />
</button>








{isApprovedDriver && (
  <DriverOperationsHub
    driverOnline={driverOnline}
    pendingRideCount={pendingRideCount}
    toggleDriverOnline={toggleDriverOnline}
    onOpenDriver={() => router.push('/driver')}
  />
)}

<div
  className={`
    fixed
    bottom-0
    left-0
    right-0
    z-[9999]
    transition-all
    duration-[1500ms]
    ease-in-out
    ${
      videoPortalOpen
        ? "translate-y-full opacity-0 pointer-events-none"
        : showNav
        ? "translate-y-0 opacity-100"
        : "translate-y-full opacity-0 pointer-events-none"
    }
  `}
>
  <BottomNav
    profile={profile}
    unreadCount={unreadCount}
    onCreateSelect={onCreateSelect}
  />
</div>

{createMode === 'post' && (
  <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm">

    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-[#060608] border-t border-cyan-500/20 p-4 max-h-[90vh] overflow-y-auto">

<button
  onClick={() => setCreateMode('none')}
  className="
    absolute
    top-4
    right-4
    z-[999]
    h-10
    w-10
    rounded-full
    bg-red-500
    text-white
    flex
    items-center
    justify-center
    shadow-lg
  "
>
  ✕
</button>

<CreatePost
  userId={user.id}
  profile={profile}
  onPosted={(newPost) => {
    if (newPost) {
      setPosts((prev) => [
        {
          ...newPost,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
        },
        ...prev,
      ])
    }

    setCreateMode('none')
  }}
/>

    </div>

  </div>
)}

{createMode === 'prediction' && (
  <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm">

    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-[#060608] border-t border-orange-500/20 p-4 max-h-[90vh] overflow-y-auto">

      <button
        onClick={() => setCreateMode('none')}
        className="absolute right-4 top-4 text-red-400 font-bold"
      >
        ✕
      </button>

      <CreatePrediction
        userId={user.id}
        username={profile?.username}
        avatarUrl={profile?.avatar_url}
        onCreated={() => {
          fetchPredictions()
          setCreateMode('none')
        }}
      />

    </div>

  </div>
)}


      {/* Login Modal */}
{showLogin && (
  <LoginModal
    onClose={() => setShowLogin(false)}
    onLogin={async () => {
      await checkUser()
      await fetchPosts()
    }}
  />
)}

<PredictionDrawer
  open={predictionDrawerOpen}
  onClose={() => setPredictionDrawerOpen(false)}
  predictions={predictions}
  voteCounts={voteCounts}
  votePrediction={votePrediction}
/>
<DiscussionRoom
    openRoom={discussionOpen}
    setOpenRoom={setDiscussionOpen}
    post={selectedPost}
    currentUser={{
        username: profile?.username,
        avatar_url: profile?.avatar_url,
    }}
    comments={discussionComments}
    onSendMessage={handleSendComment}
/>

<ImageViewer
  show={imageViewerOpen}
  imageUrls={viewerImages}
  currentImage={viewerCurrentImage}
  setCurrentImage={setViewerCurrentImage}
isImageLiked={isImageLiked}

  username={viewerUsername}
  avatarUrl={viewerAvatarUrl}
  onClose={() => setImageViewerOpen(false)}

 showImageComments={showImageComments}
setShowImageComments={setShowImageComments}

  imageLikes={imageLikes}
  imageCommentCounts={[imageComments.length]}
imageComments={imageComments}
imageCommentText={imageCommentText}
setImageCommentText={setImageCommentText}

  addImageComment={addImageComment}

  toggleImageLike={toggleImageLike}
/>

{dispatchPost && (
  <DispatchMenu
    postUrl={`${window.location.origin}/post/${dispatchPost.id}`}
    onClose={() => setDispatchPost(null)}
  />
)}

    </main>
  )
}
