import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roundId } = body

    if (!roundId) {
      return NextResponse.json(
        { error: "roundId is required" },
        { status: 400 }
      )
    }

    // 1. Make sure the round is actually ready.
    const { data: round, error: roundError } = await supabase
      .from("contribution_rounds")
      .select(
        "id, group_id, target_amount, collected_amount, status"
      )
      .eq("id", roundId)
      .single()

    if (roundError || !round) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      )
    }

    if (round.status !== "ready") {
      return NextResponse.json({
        success: false,
        message: `Round is not ready. Current status: ${round.status}`,
      })
    }

    if (Number(round.collected_amount) < Number(round.target_amount)) {
      return NextResponse.json(
        { error: "Round has not collected the full target amount" },
        { status: 400 }
      )
    }

    // 2. Create exactly one payout for this round.
    const { data: disbursement, error: disbursementError } =
      await supabase.rpc(
        "create_merry_go_round_disbursement",
        {
          p_round_id: roundId,
        }
      )

    if (disbursementError) {
      console.error(
        "Failed to create contribution disbursement:",
        disbursementError
      )

      return NextResponse.json(
        { error: disbursementError.message },
        { status: 400 }
      )
    }

    if (!disbursement || disbursement.length === 0) {
      return NextResponse.json(
        { error: "Unable to create contribution disbursement" },
        { status: 400 }
      )
    }

    const payoutId = disbursement

    // 3. Send the payout through the dedicated contribution B2C route.
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://streetgo.app"

    const response = await fetch(
      `${origin}/api/mpesa/b2c/contribution`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disbursementId: payoutId,
        }),
        cache: "no-store",
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error(
        "Contribution B2C request failed:",
        result
      )

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Contribution payout failed",
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      roundId,
      disbursementId: payoutId,
      payout: result,
    })
  } catch (error) {
    console.error(
      "Contribution automatic payout error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Automatic contribution payout failed",
      },
      { status: 500 }
    )
  }
}