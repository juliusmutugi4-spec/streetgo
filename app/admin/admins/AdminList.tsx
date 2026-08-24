'use client';

import { Admin, ROLE_LABELS } from './adminUtils';

interface AdminListProps {
  admins: Admin[];
  currentUserId: string | null;
  removingId: number | null;
  onRemove: (admin: Admin) => void;
}

export default function AdminList({
  admins,
  currentUserId,
  removingId,
  onRemove,
}: AdminListProps) {
  const hasAdmins = admins.length > 0;

  return (
    <section 
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70"
      aria-labelledby="admin-list-title"
    >
      {/* Header Section */}
      <header className="border-b border-zinc-800 px-5 py-5 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="admin-list-title" className="text-lg font-semibold text-zinc-100">
              Current Administrators
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {admins.length} {admins.length === 1 ? 'administrator' : 'administrators'} registered
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-400">
            Super Admin
          </div>
        </div>
      </header>

      {/* Empty State */}
      {!hasAdmins && (
        <div className="px-6 py-16 text-center" role="status">
          <div className="mb-3 text-3xl" aria-hidden="true">👥</div>
          <h3 className="text-sm font-medium text-zinc-200">No administrators found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Add an administrator using the form above.
          </p>
        </div>
      )}

      {/* Admin List Items */}
      {hasAdmins && (
        <ul className="divide-y divide-zinc-800" role="list">
          {admins.map((admin) => {
            const isCurrentUser = admin.user_id === currentUserId;
            const isRemoving = removingId === admin.admin_id;
            const username = admin.profile?.username?.trim() || 'Unknown User';
            
            // Dynamic color handling based on status type
            const isStatusActive = admin.status?.toLowerCase() === 'active';
            const statusColorClass = isStatusActive ? 'text-emerald-500' : 'text-zinc-500';

            return (
              <li
                key={admin.admin_id}
                className={`px-5 py-5 transition-colors md:px-6 ${
                  isCurrentUser ? 'bg-white/[0.015]' : 'hover:bg-white/[0.005]'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  
                  {/* User Information */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-sm" 
                      aria-hidden="true"
                    >
                      👤
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100">
                          {username}
                        </span>
                        {isCurrentUser && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            You
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {ROLE_LABELS[admin.role] || admin.role}
                      </p>
                      
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <span className="text-zinc-500">ID #{admin.admin_id}</span>
                        <span className="text-zinc-700" aria-hidden="true">•</span>
                        <span className={`capitalize ${statusColorClass}`}>
                          {admin.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center sm:justify-end">
                    {isCurrentUser ? (
                      <span className="inline-block rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-500">
                        Current Account
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRemove(admin)}
                        disabled={isRemoving}
                        className="inline-flex min-w-[76px] items-center justify-center rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRemoving ? (
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Removing...
                          </span>
                        ) : (
                          'Remove'
                        )}
                      </button>
                    )}
                  </div>

                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
