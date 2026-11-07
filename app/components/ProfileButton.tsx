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
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] transition-transform duration-150 group-hover:scale-105">

        {isPending ? (
          <div className="flex h-3 w-4 items-end justify-between gap-[1px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-2 w-[1.5px] bg-[var(--foreground)] animate-[wobble_1s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.15}s` }}
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

      <span className="max-w-[65px] truncate font-['Courier_New'] text-[8px] font-bold leading-none tracking-tight text-[var(--muted)] group-hover:text-[var(--foreground)]">
        {isPending ? 'Loading...' : username || 'Profile'}
      </span>
    </button>
  );
}
