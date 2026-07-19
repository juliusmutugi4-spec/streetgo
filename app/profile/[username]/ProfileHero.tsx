'use client'

import ProfileCover from "./ProfileCover"
import ProfileHeader from "./ProfileHeader"
import ProfileActions from "./ProfileActions"
import ProfileStats from "./ProfileStats"
import ProfileInfo from "./ProfileInfo"
interface ProfileHeroProps {
  profile: any

  postsCount: number
  followersCount: number
  followingCount: number

  currentUser: any

  editing: boolean
  setEditing: React.Dispatch<React.SetStateAction<boolean>>

  newUsername: string
  setNewUsername: React.Dispatch<React.SetStateAction<string>>

  newBio: string
  setNewBio: React.Dispatch<React.SetStateAction<string>>

  avatarFile: File | null
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>

  saveProfile: () => void

  isFollowing: boolean
  onFollow: () => void

  onMessage: () => void
  onBecomeDriver: () => void

  onPostsClick: () => void
  onFollowersClick: () => void

  reputation: number
}

export default function ProfileHero({
  profile,

  postsCount,
  followersCount,
  followingCount,

  currentUser,

  editing,
  setEditing,

  newUsername,
  setNewUsername,

  newBio,
  setNewBio,

  avatarFile,
  setAvatarFile,

  saveProfile,

  isFollowing,
  onFollow,

  onMessage,
  onBecomeDriver,

  onPostsClick,
  onFollowersClick,

  reputation,
}: ProfileHeroProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-[40px]

        border
        border-zinc-800

        bg-[#070b12]

        shadow-2xl
      "
    >


        
      <ProfileCover
        coverUrl={profile.cover_url}
      />
<div className="px-8 -mt-20">

  <div className="grid lg:grid-cols-12 gap-6">

    {/* LEFT SIDE */}
    <div className="lg:col-span-9">

      <ProfileHeader
        profile={profile}
        editing={editing}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        newBio={newBio}
        setNewBio={setNewBio}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        saveProfile={saveProfile}
      />

      <ProfileStats
        reputation={reputation}
        followersCount={followersCount}
        followingCount={followingCount}
        postsCount={postsCount}
        onFollowersClick={onFollowersClick}
        onPostsClick={onPostsClick}
      />

    </div>

    {/* RIGHT SIDE */}
    <div className="lg:col-span-3">

      <ProfileActions
        currentUser={currentUser}
        profile={profile}
        editing={editing}
        setEditing={setEditing}
        isFollowing={isFollowing}
        onFollow={onFollow}
        onMessage={onMessage}
        onBecomeDriver={onBecomeDriver}
      />

      <ProfileInfo
        profile={profile}
      />

    </div>

  </div>

</div>

    </div>
  )
}