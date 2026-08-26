import { getSupabaseBrowser } from '../../lib/supabase-browser'
import {
  Admin,
  AdminRole,
  Profile,
  getPermissions,
} from './adminUtils'

export async function getCurrentUser() {
  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}

export async function getCurrentAdminRole(
  userId: string
) {
  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.role as AdminRole | undefined
}

export async function getAdmins(): Promise<Admin[]> {
  const supabase = getSupabaseBrowser()

  const {
    data: adminData,
    error: adminError,
  } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (adminError) {
    throw new Error(adminError.message)
  }

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select('id, username')

  if (profileError) {
    throw new Error(profileError.message)
  }

  const profiles = (profileData || []) as Profile[]
  const rawAdmins = (adminData || []) as Admin[]

  const profileMap = new Map<string, Profile>()

  profiles.forEach((profile) => {
    profileMap.set(profile.id, profile)
  })

  return rawAdmins.map((admin) => ({
    ...admin,
    profile: profileMap.get(admin.user_id),
  }))
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .select('id, username')

  if (error) {
    throw new Error(error.message)
  }

  return (data || []) as Profile[]
}

export async function createAdmin(
  userId: string,
  role: AdminRole
) {
  const supabase = getSupabaseBrowser()

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from('admins')
    .select('admin_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing) {
    throw new Error(
      'This user is already an admin.'
    )
  }

  const {
    error: createError,
  } = await supabase
    .from('admins')
    .insert({
      user_id: userId,
      role,
      status: 'active',
      permissions: getPermissions(role),
    })

  if (createError) {
    throw new Error(createError.message)
  }
}

export async function deleteAdmin(
  adminId: number
) {
  const supabase = getSupabaseBrowser()

  const {
    error,
  } = await supabase
    .from('admins')
    .delete()
    .eq('admin_id', adminId)

  if (error) {
    throw new Error(error.message)
  }
}