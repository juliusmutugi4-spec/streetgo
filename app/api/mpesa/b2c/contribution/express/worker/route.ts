import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization")
    const secret = process.env.EXPRESS_PAYOUT_SECRET

    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 1. Discover newly ready rounds.
    const { data: discovered, error: discoveryError } =
      await supabase.rpc(
        "discover_ready_contribution_payouts"
      )

    if (discoveryError) {
      console.error(
        "EXPRESS DISCOVERY ERROR:",
        discoveryError
      )

      return NextResponse.json(
        { error: discoveryError.message },
        { status: 500 }
      )
    }

    // 2. Claim exactly one queued job.
    const { data: claimed, error: claimError } =
      await supabase.rpc(
        "claim_contribution_payout_job"
      )

    if (claimError) {
      console.error(
        "EXPRESS CLAIM ERROR:",
        claimError
      )

      return NextResponse.json(
        { error: claimError.message },
        { status: 500 }
      )
    }

    if (!claimed || claimed.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No payout jobs ready",
        discovered: discovered ?? 0,
        processed: false,
      })
    }

    const job = claimed[0]

    console.log("EXPRESS JOB CLAIMED:", job)

    let disbursementId = job.disbursement_id

    // 3. Create the disbursement if this job does not have one.
    if (!disbursementId) {
      const {
        data: createdDisbursementId,
        error: createError,
      } = await supabase.rpc(
        "create_merry_go_round_disbursement",
        {
          p_round_id: job.round_id,
        }
      )

      if (createError) {
        console.error(
          "EXPRESS DISBURSEMENT CREATION ERROR:",
          createError
        )

        await supabase
          .from("contribution_payout_jobs")
          .update({
            status: "failed",
            last_error: createError.message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.job_id)
          .eq("status", "processing")

        return NextResponse.json(
          {
            success: false,
            error: createError.message,
            jobId: job.job_id,
          },
          { status: 500 }
        )
      }

      if (!createdDisbursementId) {
        const message =
          "Disbursement creation returned no ID"

        await supabase
          .from("contribution_payout_jobs")
          .update({
            status: "failed",
            last_error: message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.job_id)
          .eq("status", "processing")

        return NextResponse.json(
          {
            success: false,
            error: message,
            jobId: job.job_id,
          },
          { status: 500 }
        )
      }

      disbursementId = createdDisbursementId
    }

    // 4. Prepare the payout.
    const {
      data: prepared,
      error: prepareError,
    } = await supabase.rpc(
      "prepare_contribution_b2c",
      {
        p_disbursement_id: disbursementId,
      }
    )

    if (prepareError) {
      console.error(
        "EXPRESS B2C PREPARATION ERROR:",
        prepareError
      )

      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          disbursement_id: disbursementId,
          last_error: prepareError.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.job_id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          success: false,
          error: prepareError.message,
          jobId: job.job_id,
          disbursementId,
        },
        { status: 500 }
      )
    }

    if (!prepared || prepared.length === 0) {
      const message =
        "B2C preparation returned no payout"

      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          disbursement_id: disbursementId,
          last_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.job_id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          success: false,
          error: message,
          jobId: job.job_id,
          disbursementId,
        },
        { status: 500 }
      )
    }

    console.log(
      "EXPRESS B2C PREPARED:",
      prepared[0]
    )

    // 5. Attach the disbursement to the job.
    const { error: attachError } =
      await supabase
        .from("contribution_payout_jobs")
        .update({
          disbursement_id: disbursementId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.job_id)
        .eq("status", "processing")

    if (attachError) {
      console.error(
        "EXPRESS JOB ATTACH ERROR:",
        attachError
      )

      return NextResponse.json(
        {
          success: false,
          error: attachError.message,
          jobId: job.job_id,
          disbursementId,
        },
        { status: 500 }
      )
    }

    // 6. Submit to the existing B2C endpoint.
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://streetgo.app"

    let response: Response

    try {
      response = await fetch(
        `${origin}/api/mpesa/b2c/contribution`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disbursementId,
          }),
          cache: "no-store",
        }
      )
    } catch (networkError) {
      const message =
        networkError instanceof Error
          ? networkError.message
          : "Network error submitting B2C payout"

      console.error(
        "EXPRESS B2C NETWORK ERROR:",
        networkError
      )

      // Safaricom acceptance is unknown.
      // NEVER mark failed here.
      await supabase
        .from("contribution_payout_jobs")
        .update({
          last_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.job_id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          success: false,
          uncertain: true,
          error: message,
          jobId: job.job_id,
          disbursementId,
        },
        { status: 502 }
      )
    }

    let result: any = null

    try {
      result = await response.json()
    } catch {
      result = null
    }

    if (!response.ok) {
      console.error(
        "EXPRESS B2C REJECTED:",
        result
      )

      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          last_error:
            result?.error ||
            "Contribution B2C request rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.job_id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          success: false,
          error:
            result?.error ||
            "Contribution B2C request rejected",
          jobId: job.job_id,
          disbursementId,
        },
        { status: 502 }
      )
    }

    // 7. Safaricom accepted the request.
    // The callback will eventually change this to paid.
    const { error: submittedError } =
      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "submitted",
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.job_id)
        .eq("status", "processing")

    if (submittedError) {
      console.error(
        "EXPRESS SUBMITTED UPDATE ERROR:",
        submittedError
      )
    }

    console.log(
      "EXPRESS PAYOUT SUBMITTED:",
      {
        jobId: job.job_id,
        roundId: job.round_id,
        disbursementId,
      }
    )

    return NextResponse.json({
      success: true,
      message: "Express payout submitted",
      jobId: job.job_id,
      roundId: job.round_id,
      groupId: job.group_id,
      disbursementId,
      status: "submitted",
      payout: result,
    })
  } catch (error) {
    console.error(
      "EXPRESS WORKER ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Express worker failed",
      },
      { status: 500 }
    )
  }
}