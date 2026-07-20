'use client'

import ProfileCover from "./ProfileCover"
import ProfileHeader from "./ProfileHeader"
import ProfileActions from "./ProfileActions"
import ProfileStats from "./ProfileStats"
import ProfileInfo from "./ProfileInfo"
import ProfileAchievements from "./ProfileAchievements" // Added the horizontal component

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
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-[16px] border border-zinc-900/60 bg-[#02050a] shadow-xl">
      
      {/* 1. Cover Image Section */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[240px] overflow-hidden">
        <ProfileCover coverUrl={profile.cover_url} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050a] via-transparent to-transparent opacity-90" />
      </div>

      {/* 2. Micro-Spaced Content Workspace */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 pb-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* Main User Identity Stack (Left Column) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
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
            
            {/* Numerical Stats Area */}
            <div className="w-full pt-3 border-t border-zinc-900/80">
              <ProfileStats 
                reputation={reputation} 
                followersCount={followersCount} 
                followingCount={followingCount} 
                postsCount={postsCount} 
                onFollowersClick={onFollowersClick} 
                onPostsClick={onPostsClick} 
              />
            </div>

            {/* Horizontal Swipe Achievements Row */}
            <ProfileAchievements />
          </div>

          {/* Micro Action Sidebar (Right Column) */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:pt-14 self-start w-full">
            {/* Functional Buttons Container */}
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
            
            {/* User Meta Meta-Data (Location, Date, Website) */}
            <div className="pt-2 border-t border-zinc-900/40 lg:border-t-0">
              <ProfileInfo profile={profile} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
