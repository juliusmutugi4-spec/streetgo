'use client'

import ProfileCover from "./ProfileCover"
import ProfileHeader from "./ProfileHeader"
import ProfileActions from "./ProfileActions"
import ProfileStats from "./ProfileStats"
import ProfileInfo from "./ProfileInfo"
import ProfileAchievements from "./ProfileAchievements"
import ProfileTabs from "./ProfileTabs"
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
newWebsite: string
setNewWebsite: React.Dispatch<React.SetStateAction<string>>
newLocation: string
setNewLocation: React.Dispatch<React.SetStateAction<string>>
  activeTab: string
setActiveTab: React.Dispatch<React.SetStateAction<string>>
  avatarFile: File | null
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>
  saveProfile: () => void
  isFollowing: boolean
  onFollow: () => void
  onMessage: () => void
  onBack: () => void
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

newWebsite,
setNewWebsite,
newLocation,
setNewLocation,

activeTab,
setActiveTab,

avatarFile,
  setAvatarFile,
  saveProfile,
  isFollowing,
  onFollow,
  onMessage,
  onBack,
  onBecomeDriver,
  onPostsClick,
  onFollowersClick,
  reputation,
}: ProfileHeroProps) {
  return (
    <div className="w-full overflow-hidden bg-[#02050a] rounded-none sm:rounded-[20px] border-x-0 sm:border-x border-y border-zinc-900/80 shadow-2xl">
      
      {/* 1. Fluid Banner Block */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] h-[180px] sm:max-h-[240px] overflow-hidden select-none">
        <ProfileCover
  coverUrl={profile.cover_url}
  onBack={onBack}
/>
        {/* Anti-aliasing shadow overlay to hide color banding on mobile screens */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050a] via-[#02050a]/20 to-transparent pointer-events-none z-10" />
      </div>

      {/* 2. Unified Content Layer */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-9 sm:-mt-12 pb-6 z-20">
        
        {/* Core Layout Grid System: Dynamic flex columns on mobile, dual column columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          
          {/* Main User Identity Stack Column */}
          <div className="lg:col-span-9 flex flex-col gap-3.5 w-full">
            
            {/* Split Avatar and Identification Data Text info row */}
<ProfileHeader
  profile={profile}
  editing={editing}
  newUsername={newUsername}
  setNewUsername={setNewUsername}
  newBio={newBio}
  setNewBio={setNewBio}

  newWebsite={newWebsite}
  setNewWebsite={setNewWebsite}
  newLocation={newLocation}
  setNewLocation={setNewLocation}

  avatarFile={avatarFile}
  setAvatarFile={setAvatarFile}
  saveProfile={saveProfile}
/>
            
            {/* High Density Numerical Analytics Items inline sub-row */}
            <div className="w-full pt-2.5 border-t border-zinc-900/60">
              <ProfileStats 
                reputation={reputation} 
                followersCount={followersCount} 
                followingCount={followingCount} 
                postsCount={postsCount} 
                onFollowersClick={onFollowersClick} 
                onPostsClick={onPostsClick} 
              />
            </div>

            {/* Horizontal Swipe Action Milestones Block */}
            <div className="w-full mt-1">
              <ProfileAchievements />
            </div>
<ProfileTabs
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>





          </div>

          {/* Action and Structural Meta-Information Sidebar Panel */}
          <div className="lg:col-span-3 flex flex-col gap-4 self-start w-full">
            
            {/* Micro grid action controller buttons rows layout */}
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
            
            {/* Personal Core Meta Coordinates (Joined, Website, Location Map details) */}
            <div className="pt-3.5 border-t border-zinc-900/60 lg:border-t-0 lg:pt-0">
              <ProfileInfo profile={profile} />
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
