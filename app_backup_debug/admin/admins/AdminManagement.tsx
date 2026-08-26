'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  Admin,
  AdminRole,
  Profile,
  ROLE_LABELS,
} from './adminUtils'

import AdminForm from './AdminForm'
import AdminList from './AdminList'

import {
  getCurrentUser,
  getCurrentAdminRole,
  getAdmins,
  getProfiles,
  createAdmin as createAdminService,
  deleteAdmin,
} from './adminService'

import { ADMIN_MESSAGES } from './adminMessages'

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [users, setUsers] = useState<Profile[]>([])

  const [selectedUser, setSelectedUser] = useState('')
  const [role, setRole] =
    useState<AdminRole>('driver_admin')

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null)

  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false)

  const [checking, setChecking] =
    useState(true)

  const [loading, setLoading] =
    useState(false)

  const [removingId, setRemovingId] =
    useState<number | null>(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  /*
   * ---------------------------------------------------------
   * LOAD ADMIN DATA
   * ---------------------------------------------------------
   */

  async function loadData() {
    setChecking(true)
    setErrorMessage('')

    try {
      const user = await getCurrentUser()

      if (!user) {
        setIsSuperAdmin(false)
        return
      }

      setCurrentUserId(user.id)

      const currentRole =
        await getCurrentAdminRole(user.id)

      const superAdmin =
        currentRole === 'super_admin'

      setIsSuperAdmin(superAdmin)

      if (!superAdmin) {
        return
      }

      const [
        adminData,
        profileData,
      ] = await Promise.all([
        getAdmins(),
        getProfiles(),
      ])

      setAdmins(adminData)
      setUsers(profileData)

    } catch (error) {
      console.error(
        'Admin management load error:',
        error
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : ADMIN_MESSAGES.loadError
      )

    } finally {
      setChecking(false)
    }
  }

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    loadData()
  }, [])

  /*
   * ---------------------------------------------------------
   * USERS WHO ARE NOT ALREADY ADMINS
   * ---------------------------------------------------------
   */

  const availableUsers = useMemo(() => {
    const adminUserIds = new Set(
      admins.map(
        (admin) => admin.user_id
      )
    )

    return users.filter(
      (user) =>
        !adminUserIds.has(user.id)
    )
  }, [users, admins])

  /*
   * ---------------------------------------------------------
   * CREATE ADMIN
   * ---------------------------------------------------------
   */

  async function createAdmin() {
    if (!selectedUser) {
      setErrorMessage(
        ADMIN_MESSAGES.selectUser
      )

      return
    }

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createAdminService(
        selectedUser,
        role
      )

      setSuccessMessage(
        ADMIN_MESSAGES.createSuccess(
          ROLE_LABELS[role]
        )
      )

      setSelectedUser('')
      setRole('driver_admin')

      await loadData()

    } catch (error) {
      console.error(
        'Create admin error:',
        error
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : ADMIN_MESSAGES.createError
      )

    } finally {
      setLoading(false)
    }
  }

  /*
   * ---------------------------------------------------------
   * REMOVE ADMIN
   * ---------------------------------------------------------
   */

  async function removeAdmin(
    admin: Admin
  ) {
    /*
     * Never allow the current Super Admin
     * to remove themselves.
     */

    if (
      admin.user_id === currentUserId
    ) {
      setErrorMessage(
        ADMIN_MESSAGES.selfRemove
      )

      return
    }

    const username =
      admin.profile?.username ||
      'this administrator'

    const confirmed =
      window.confirm(
        `Remove ${username} as ${ROLE_LABELS[admin.role]}?`
      )

    if (!confirmed) {
      return
    }

    setRemovingId(
      admin.admin_id
    )

    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteAdmin(
        admin.admin_id
      )

      setSuccessMessage(
        ADMIN_MESSAGES.removeSuccess(
          username
        )
      )

      await loadData()

    } catch (error) {
      console.error(
        'Remove admin error:',
        error
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : ADMIN_MESSAGES.removeError
      )

    } finally {
      setRemovingId(null)
    }
  }

  /*
   * ---------------------------------------------------------
   * CHECKING PERMISSIONS
   * ---------------------------------------------------------
   */

  if (checking) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

          <p className="text-sm text-zinc-400">
            {ADMIN_MESSAGES.checkingPermissions}
          </p>

        </div>

      </main>
    )
  }

  /*
   * ---------------------------------------------------------
   * ACCESS DENIED
   * ---------------------------------------------------------
   */

  if (!isSuperAdmin) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">

        <div className="w-full max-w-md rounded-xl border border-red-900/50 bg-zinc-900 p-8 text-center">

          <div className="mb-4 text-3xl">
            🔒
          </div>

          <h1 className="text-xl font-semibold">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {ADMIN_MESSAGES.accessDenied}
          </p>

        </div>

      </main>
    )
  }

  /*
   * ---------------------------------------------------------
   * ADMIN MANAGEMENT PAGE
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-6 md:p-8">

      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              🛡️
            </div>

            <div>

              <h1 className="text-2xl font-semibold">
                Admin Management
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Manage StreetGO administrators and
                their access levels.
              </p>

            </div>

          </div>

        </div>

        {/* Error */}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3">

            <div className="flex items-start gap-3">

              <span className="text-red-400">
                ⚠
              </span>

              <div>

                <p className="text-sm font-medium text-red-300">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-400">
                  {errorMessage}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Success */}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3">

            <div className="flex items-start gap-3">

              <span className="text-emerald-400">
                ✓
              </span>

              <p className="text-sm text-emerald-300">
                {successMessage}
              </p>

            </div>

          </div>
        )}

        {/* Add Admin */}

        <AdminForm
          users={availableUsers}
          selectedUser={selectedUser}
          role={role}
          loading={loading}
          onUserChange={setSelectedUser}
          onRoleChange={setRole}
          onCreate={createAdmin}
        />

        {/* Admin List */}

        <AdminList
          admins={admins}
          currentUserId={currentUserId}
          removingId={removingId}
          onRemove={removeAdmin}
        />

      </div>

    </main>
  )
}