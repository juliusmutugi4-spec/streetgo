import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import { logAdminAction } from "./auditActions"

export async function copyReference(
  reference: string
) {
  if (!reference) return

  await navigator.clipboard.writeText(reference)

  alert("Reference copied")
}

export async function getWalletByTransaction(
  walletId: string
) {
  if (!walletId) {
    console.log("NO WALLET ID")
    return null
  }

  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", walletId)
    .single()

  if (error) {
    console.log("WALLET ERROR:", error)
    return null
  }

  return data
}

export async function freezeWallet(
  walletId: string,
  adminId: string
) {
  if (!walletId) {
    console.log("NO WALLET ID")
    return false
  }

  const supabase = getSupabaseBrowser()

  const {
    error,
  } = await supabase
    .from("wallets")
    .update({
      money_wallet_active: false,
    })
    .eq("id", walletId)

  if (error) {
    console.log("FREEZE WALLET ERROR:", error)
    return false
  }

  await logAdminAction({
    adminId,
    action: "FREEZE_WALLET",
    targetType: "wallet",
    targetId: walletId,
    description: "Admin froze wallet",
  })

  return true
}

// ======================================================
// MARK WITHDRAWAL AS PAID
// ======================================================

export async function markWithdrawalPaid(
  withdrawalId: string,
  adminId: string,
  mpesaReceipt: string,
  mpesaMessage: string
) {
  if (!withdrawalId || !adminId) {
    console.log("MISSING WITHDRAWAL OR ADMIN ID")
    return false
  }

  if (!mpesaReceipt.trim()) {
    console.log("M-PESA RECEIPT REQUIRED")
    return false
  }

  if (!mpesaMessage.trim()) {
    console.log("M-PESA CONFIRMATION MESSAGE REQUIRED")
    return false
  }

  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_mark_withdrawal_paid",
    {
      p_withdrawal_id: withdrawalId,
      p_admin_id: adminId,
      p_mpesa_receipt: mpesaReceipt.trim(),
      p_mpesa_message: mpesaMessage.trim(),
    }
  )

  if (error) {
    console.error(
      "MARK WITHDRAWAL PAID ERROR:",
      JSON.stringify(error, null, 2)
    )

    return false
  }

  return data === true
}
// ======================================================
// REJECT WITHDRAWAL
// ======================================================

export async function rejectWithdrawal(
  withdrawalId: string,
  adminId: string,
  reason: string
) {
  if (!withdrawalId || !adminId) {
    console.log("MISSING WITHDRAWAL OR ADMIN ID")
    return false
  }

  if (!reason.trim()) {
    console.log("REJECTION REASON REQUIRED")
    return false
  }

  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_reject_withdrawal",
    {
      p_withdrawal_id: withdrawalId,
      p_admin_id: adminId,
      p_reason: reason.trim(),
    }
  )

if (error) {
  console.error(
    "REJECT WITHDRAWAL ERROR:",
    JSON.stringify(error, null, 2)
  )

  console.error(
    "REJECT WITHDRAWAL MESSAGE:",
    error.message
  )

  console.error(
    "REJECT WITHDRAWAL CODE:",
    error.code
  )

  console.error(
    "REJECT WITHDRAWAL DETAILS:",
    error.details
  )

  console.error(
    "REJECT WITHDRAWAL HINT:",
    error.hint
  )

  return false
}

  return data === true
}

// ======================================================
// REASSIGN WITHDRAWAL
// SUPER ADMIN ONLY
// ======================================================

export async function reassignWithdrawal(
  withdrawalId: string,
  superAdminId: string,
  newAdminId: string
) {
  if (
    !withdrawalId ||
    !superAdminId ||
    !newAdminId
  ) {
    console.log(
      "MISSING REASSIGNMENT INFORMATION"
    )

    return false
  }

  const supabase = getSupabaseBrowser()

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_reassign_withdrawal",
    {
      p_withdrawal_id: withdrawalId,
      p_super_admin_id: superAdminId,
      p_new_admin_id: newAdminId,
    }
  )

  if (error) {
    console.error(
      "REASSIGN WITHDRAWAL ERROR:",
      JSON.stringify(error, null, 2)
    )

    return false
  }

  return data === true
}






export async function lookupWithdrawal(
  adminId: string,
  withdrawalReference: string
) {
  if (!adminId || !withdrawalReference.trim()) {
    return null
  }

  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase.rpc(
    "admin_lookup_withdrawal",
    {
      p_admin_id: adminId,
      p_withdrawal_reference:
        withdrawalReference.trim(),
    }
  )

  if (error) {
    console.error(
      "LOOKUP WITHDRAWAL ERROR:",
      error
    )

    throw new Error(error.message)
  }

  return data?.[0] ?? null
}

