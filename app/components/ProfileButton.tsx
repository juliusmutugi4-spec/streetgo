'use client';

import React, { useTransition } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileButtonProps {
  username?: string | null;
  avatarUrl?: string | null;
}

export default function ProfileButton({
  username,
  avatarUrl,
}: ProfileButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleProfileClick = () => {
    if (isPending) return;

    const destination = username
      ? `/profile/${encodeURIComponent(username)}`
      : '/';

    startTransition(() => {
      router.push(destination);
    });
  };

  return (
    <button
      type="button"
      onClick={handleProfileClick}
      disabled={isPending}
      aria-label={username ? `Open ${username}'s profile` : 'Open profile'}
      className="group flex w-full min-w-0 flex-col items-center justify-center gap-0.5 py-1 transition-colors duration-150 hover:text-[var(--foreground)] active:scale-95 focus:outline-none disabled:pointer-events-none"
    >
      {/* INJECTED ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes mini-fluid-pulse {
          0%, 100% { transform: scaleY(0.4) rotate(0deg); opacity: 0.35; }
          50% { transform: scaleY(1.3) rotate(6deg); opacity: 1; }
        }
        .profile-bar-anim {
          animation: mini-fluid-pulse 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .profile-bar-anim {
            animation: mini-fluid-fade 2s ease-in-out infinite alternate !important;
            transform: scaleY(1) rotate(0deg) !important;
          }
          @keyframes mini-fluid-fade {
            from { opacity: 0.3; }
            to { opacity: 0.9; }
          }
        }
      `}</style>

      {/* PROFILE LOADING VISUALIZER */}
      <div
        className={`relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] transition-transform duration-150 ${
          isPending ? '' : 'group-hover:scale-105'
        }`}
      >
        {isPending ? (
          <div className="flex h-3 w-4 items-center justify-between gap-[0.5px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="profile-bar-anim w-[1.5px] h-[8px] rounded-full bg-[#00e694]"
                style={{
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        ) : avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username || 'Profile'}
            fill
            sizes="20px"
            className="object-cover select-none"
          />
        ) : username ? (
          <span className="font-['Courier_New'] text-[8px] font-bold text-[var(--foreground)]">
            {username.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User size={12} strokeWidth={1.8} />
        )}
      </div>

      {/* USERNAME */}
      <span className="max-w-[65px] truncate font-['Courier_New'] text-[8px] font-bold leading-none tracking-tight text-[var(--muted)] group-hover:text-[var(--foreground)]">
        {isPending ? 'Loading...' : username || 'Profile'}
      </span>
    </button>
  );
}
