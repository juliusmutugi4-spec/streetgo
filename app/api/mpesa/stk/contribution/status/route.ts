import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      )
    }

    const userToken = authHeader.replace("Bearer ", "")

    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Your StreetGO session is invalid.",
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)

    const transactionId =
      searchParams.get("transactionId")?.trim() || ""

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID is required.",
        },
        { status: 400 }
      )
    }

    /*
     * Find the transaction and verify that it belongs
     * to the authenticated user's contribution member.
     */
    const { data: transaction, error: transactionError } =
      await supabase
        .from("contribution_transactions")
        .select(`
          id,
          group_id,
          member_id,
          amount,
          status,
          mpesa_receipt,
          failure_reason
        `)
        .eq("id", transactionId)
        .maybeSingle()

    if (transactionError) {
      throw new Error(transactionError.message)
    }

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment transaction not found.",
        },
        { status: 404 }
      )
    }

    /*
     * Verify ownership through contribution_members.
     */
    const { data: member, error: memberError } =
      await supabase
        .from("contribution_members")
        .select("id")
        .eq("id", transaction.member_id)
        .eq("user_id", user.id)
        .maybeSingle()

    if (memberError) {
      throw new Error(memberError.message)
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to view this payment.",
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      status: transaction.status,
      amount: Number(transaction.amount || 0),
      mpesaReceipt: transaction.mpesa_receipt || null,
      resultCode: null,
      resultDesc: transaction.failure_reason || null,
    })
  } catch (error: any) {
    console.error(
      "CONTRIBUTION PAYMENT STATUS ERROR:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to check payment status.",
      },
      { status: 500 }
    )
  }
}