export type Group = {
  id: string
  group_number: string
  name: string
  organizer_id: string
  member_limit: number
  contribution_amount: number
  frequency: string
  start_date: string
  status: string
  group_code?: string | null
}

export type CurrentRound = {
  id: string
  group_id: string
  round_number: number
  recipient_member_id: string | null
  status: string
  target_amount: number
  collected_amount: number
  created_at: string
  updated_at: string
}

export type Member = {
  id: string
  group_id: string
  user_id: string
  member_number: number
  role: string
  status: string
  display_name: string | null
  phone_number: string | null
  phone_verified: boolean
  member_code: string
  joined_at: string
  created_at: string
}

export type PaymentSummary = {
  pool_collected: number
  paid_members: number
  my_status: string
  my_receipt: string | null
  my_credit: number
  total_funds_received: number
}

export type MemberPaymentStatus = {
  member_id: string
  member_number: number
  member_code: string
  display_name: string | null
  status: string
  amount_paid: number
}