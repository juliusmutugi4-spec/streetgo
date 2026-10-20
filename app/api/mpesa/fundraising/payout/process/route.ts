import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured")
      return NextResponse.json(
        { success: false, error: "Processor not configured" },
        { status: 500 }
      )
    }

    const authorization = request.headers.get("authorization")
    const providedSecret = request.headers.get("x-cron-secret")

    const authorized =
      authorization === `Bearer ${cronSecret}` ||
      providedSecret === cronSecret

    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Pick up only payouts that are ready for processing.
    const { data: payouts, error } = await supabase
      .from("fundraising_payouts")
      .select("id, contribution_id, amount, destination_type, status")
      .eq("status", "pending")
      .eq("destination_type", "phone")
      .gte("amount", 10)
      .order("created_at", { ascending: true })
      .limit(10)

    if (error) {
      console.error("Failed to load pending payouts:", error)

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load pending payouts",
        },
        { status: 500 }
      )
    }

    if (!payouts || payouts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending fundraising payouts",
        processed: 0,
      })
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app"

    const results = []

    for (const payout of payouts) {
      try {
        console.log("PROCESSING FUNDRAISING PAYOUT:", {
          payoutId: payout.id,
          contributionId: payout.contribution_id,
          amount: payout.amount,
        })

        const response = await fetch(
          `${origin}/api/mpesa/fundraising/payout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contributionId: payout.contribution_id,
            }),
            cache: "no-store",
          }
        )

        const result = await response.json().catch(() => null)

        results.push({
          payoutId: payout.id,
          contributionId: payout.contribution_id,
          amount: payout.amount,
          success: response.ok,
          result,
        })

        console.log("FUNDRAISING PAYOUT PROCESS RESULT:", {
          payoutId: payout.id,
          responseStatus: response.status,
          result,
        })
      } catch (error) {
        console.error("FUNDRAISING PAYOUT PROCESS ERROR:", {
          payoutId: payout.id,
          error,
        })

        results.push({
          payoutId: payout.id,
          contributionId: payout.contribution_id,
          amount: payout.amount,
          success: false,
          error: "Payout request failed",
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("FUNDRAISING PAYOUT PROCESSOR ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Processor failed",
      },
      { status: 500 }
    )
  }
}