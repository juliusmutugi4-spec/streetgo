import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    /*
     * EXPRESS WORKER
     *
     * This worker processes ONE already-claimed payout job.
     *
     * It does NOT:
     * - create another disbursement
     * - change the round back to ready
     * - calculate another deduction
     *
     * It simply takes the claimed job and submits its existing
     * disbursement through the existing B2C route.
     */
const authHeader = request.headers.get("authorization")
const expectedSecret = process.env.EXPRESS_PAYOUT_SECRET

if (!expectedSecret) {
  console.error("EXPRESS_PAYOUT_SECRET is not configured")

  return NextResponse.json(
    { error: "Express payout worker is not configured" },
    { status: 500 }
  )
}

if (authHeader !== `Bearer ${expectedSecret}`) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  )
}
    const body = await request.json().catch(() => ({}))
    const jobId = body?.jobId

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      )
    }

    /*
     * 1. Load the claimed Express job.
     */
    const { data: job, error: jobError } = await supabase
      .from("contribution_payout_jobs")
      .select(
        `
        id,
        round_id,
        group_id,
        disbursement_id,
        status,
        attempts,
        locked_at
        `
      )
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      console.error("EXPRESS JOB LOAD ERROR:", jobError)

      return NextResponse.json(
        { error: "Express payout job not found" },
        { status: 404 }
      )
    }

    /*
     * Only a claimed/processing job can be submitted.
     */
    if (job.status !== "processing") {
      return NextResponse.json(
        {
          error: `Express job is not processing. Current status: ${job.status}`,
          jobId: job.id,
        },
        { status: 409 }
      )
    }

    /*
     * This first worker version requires the disbursement
     * to already exist.
     */
    if (!job.disbursement_id) {
      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          last_error:
            "Express job has no disbursement_id.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          error:
            "Express job has no disbursement_id",
        },
        { status: 409 }
      )
    }

    /*
     * 2. Load the exact disbursement attached to this job.
     */
    const { data: disbursement, error: disbursementError } =
      await supabase
        .from("contribution_disbursements")
        .select(
          `
          id,
          round_id,
          group_id,
          amount,
          deduction_amount,
          net_amount,
          phone_number,
          status,
          originator_conversation_id,
          conversation_id,
          mpesa_transaction_id
          `
        )
        .eq("id", job.disbursement_id)
        .single()

    if (disbursementError || !disbursement) {
      console.error(
        "EXPRESS DISBURSEMENT LOAD ERROR:",
        disbursementError
      )

      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          last_error:
            "Attached contribution disbursement was not found.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          error:
            "Attached contribution disbursement was not found",
        },
        { status: 404 }
      )
    }

    /*
     * Make sure the job and disbursement still point
     * to the same round.
     */
    if (disbursement.round_id !== job.round_id) {
      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          last_error:
            "Job round does not match disbursement round.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          error:
            "Express job/disbursement round mismatch",
        },
        { status: 409 }
      )
    }

    /*
     * 3. If Safaricom has already been contacted,
     * NEVER submit again.
     */
    if (
      disbursement.originator_conversation_id ||
      disbursement.conversation_id ||
      disbursement.mpesa_transaction_id
    ) {
      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      return NextResponse.json({
        success: true,
        message:
          "Payout was already submitted to Safaricom. Express will not submit it again.",
        jobId: job.id,
        disbursementId: disbursement.id,
        status: "submitted",
      })
    }

    /*
     * 4. The existing B2C route requires processing.
     */
    if (disbursement.status !== "processing") {
      await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "failed",
          last_error:
            `Disbursement is not processing. Current status: ${disbursement.status}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          error:
            `Disbursement is not processing. Current status: ${disbursement.status}`,
          jobId: job.id,
          disbursementId: disbursement.id,
        },
        { status: 409 }
      )
    }

    /*
     * 5. Call the existing contribution B2C route.
     *
     * IMPORTANT:
     * The existing route performs the final atomic
     * originator_conversation_id claim before Safaricom.
     */
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://streetgo.app"

    let b2cResponse: Response

    try {
      b2cResponse = await fetch(
        `${origin}/api/mpesa/b2c/contribution`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disbursementId: disbursement.id,
          }),
          cache: "no-store",
        }
      )
    } catch (error) {
      /*
       * CRITICAL:
       *
       * We do NOT mark the payout failed here.
       *
       * The B2C route may already have claimed it and
       * Safaricom may have received the request.
       */
      console.error(
        "EXPRESS B2C NETWORK ERROR:",
        error
      )

      await supabase
        .from("contribution_payout_jobs")
        .update({
          last_error:
            "B2C worker connection failed after submission attempt. Reconciliation required.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      return NextResponse.json(
        {
          success: false,
          error:
            "B2C connection failed. Payout remains protected from automatic duplicate retry.",
          jobId: job.id,
          disbursementId: disbursement.id,
        },
        { status: 502 }
      )
    }

    const responseText = await b2cResponse.text()

    let result: Record<string, unknown> = {}

    try {
      result = JSON.parse(responseText)
    } catch {
      result = {
        raw: responseText,
      }
    }

    /*
     * 6. Safaricom accepted the B2C request.
     */
    if (b2cResponse.ok) {
      const { error: updateError } = await supabase
        .from("contribution_payout_jobs")
        .update({
          status: "submitted",
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "processing")

      if (updateError) {
        console.error(
          "EXPRESS JOB SUBMITTED UPDATE ERROR:",
          updateError
        )

        /*
         * The B2C request has already been accepted.
         * Never call Safaricom again just because this
         * database update failed.
         */
        return NextResponse.json({
          success: true,
          warning:
            "Safaricom accepted the payout, but Express job status could not be updated.",
          jobId: job.id,
          disbursementId: disbursement.id,
          payout: result,
        })
      }

      return NextResponse.json({
        success: true,
        message:
          "Express payout submitted successfully.",
        jobId: job.id,
        roundId: job.round_id,
        disbursementId: disbursement.id,
        status: "submitted",
        payout: result,
      })
    }

    /*
     * 7. B2C route explicitly rejected the request.
     *
     * We do NOT retry here.
     */
    console.error(
      "EXPRESS B2C REJECTED:",
      result
    )

    await supabase
      .from("contribution_payout_jobs")
      .update({
        status: "failed",
        last_error:
          typeof result.error === "string"
            ? result.error
            : "B2C request rejected.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .eq("status", "processing")

    return NextResponse.json(
      {
        success: false,
        error:
          typeof result.error === "string"
            ? result.error
            : "B2C request rejected.",
        jobId: job.id,
        disbursementId: disbursement.id,
        payout: result,
      },
      { status: b2cResponse.status }
    )
  } catch (error) {
    console.error(
      "EXPRESS PAYOUT WORKER ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Express payout worker failed",
      },
      { status: 500 }
    )
  }
}