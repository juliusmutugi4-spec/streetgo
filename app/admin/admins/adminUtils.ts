export type AdminRole =
  | 'driver_admin'
  | 'content_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'super_admin'

export interface Profile {
  id: string
  username: string | null
}

export interface Admin {
  admin_id: number
  user_id: string
  role: AdminRole
  status: string
  permissions: Record<string, boolean> | null
  created_at: string
  profile?: Profile
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  driver_admin: 'Driver Admin',
  content_admin: 'Content Admin',
  finance_admin: 'Finance Admin',
  support_admin: 'Support Admin',
  super_admin: 'Super Admin',
}

export function getPermissions(role: AdminRole) {
  switch (role) {
    case 'driver_admin':
      return {
        manage_drivers: true,
        manage_videos: false,
        manage_wallet: false,
        manage_users: false,
      }

    case 'content_admin':
      return {
        manage_drivers: false,
        manage_videos: true,
        manage_wallet: false,
        manage_users: false,
      }

    case 'finance_admin':
      return {
        manage_drivers: false,
        manage_videos: false,
        manage_wallet: true,
        manage_users: false,
      }

    case 'support_admin':
      return {
        manage_drivers: false,
        manage_videos: false,
        manage_wallet: false,
        manage_users: true,
      }

    case 'super_admin':
      return {
        all: true,
      }

    default:
      return {}
  }
}