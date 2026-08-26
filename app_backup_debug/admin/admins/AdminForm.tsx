'use client';

import { useId } from 'react';
import { AdminRole, Profile } from './adminUtils';

interface AdminFormProps {
  users: Profile[];
  selectedUser: string;
  role: AdminRole;
  loading: boolean;
  onUserChange: (userId: string) => void;
  onRoleChange: (role: AdminRole) => void;
  onCreate: () => void;
}

export default function AdminForm({
  users,
  selectedUser,
  role,
  loading,
  onUserChange,
  onRoleChange,
  onCreate,
}: AdminFormProps) {
  const userSelectId = useId();
  const roleSelectId = useId();
  const isSubmitDisabled = loading || !selectedUser;

  return (
    <section 
      className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:p-6"
      aria-labelledby="form-title"
    >
      {/* Header Section */}
      <header className="mb-5">
        <h2 id="form-title" className="text-lg font-semibold text-zinc-100">
          Add New Admin
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Assign an existing StreetGO user an administrator role.
        </p>
      </header>

      {/* Form Fields Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* User Selection */}
        <div className="flex flex-col">
          <label 
            htmlFor={userSelectId}
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            User
          </label>
          <select
            id={userSelectId}
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username?.trim() || 'Unnamed User'}
              </option>
            ))}
          </select>
          {users.length === 0 && (
            <p className="mt-2 text-xs text-amber-500/90" role="status">
              All available users are already administrators.
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="flex flex-col">
          <label 
            htmlFor={roleSelectId}
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Administrator Role
          </label>
          <select
            id={roleSelectId}
            value={role}
            onChange={(e) => onRoleChange(e.target.value as AdminRole)}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="driver_admin">Driver Admin</option>
            <option value="content_admin">Content Admin</option>
            <option value="finance_admin">Finance Admin</option>
            <option value="support_admin">Support Admin</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onCreate}
        disabled={isSubmitDisabled}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg 
              className="h-4 w-4 animate-spin text-black" 
              viewBox="0 0 24 24" 
              fill="none" 
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating Admin...</span>
          </>
        ) : (
          'Create Admin'
        )}
      </button>
    </section>
  );
}
