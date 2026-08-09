import { getSupabaseBrowser } from "../../../lib/supabase-browser"

export async function logAdminAction({
  adminId,
  action,
  targetType,
  targetId,
  description,
}: {
  adminId: string
  action: string
  targetType?: string
  targetId?: string
  description: string
}) {
  const supabase = getSupabaseBrowser()

  const { error } = await supabase
    .from("admin_logs")
    .insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      description,
    })

  if (error) {
    console.error(
      "AUDIT LOG ERROR:",
      error
    )

    return false
  }

  return true
}