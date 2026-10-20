import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("STREETGO C2B CONFIRMATION:")
    console.log(JSON.stringify(body, null, 2))

    const msisdn = String(body.MSISDN || "")
    const accountNumber = String(body.BillRefNumber || "")
    const firstName = String(body.FirstName || "")
    const middleName = String(body.MiddleName || "")
    const lastName = String(body.LastName || "")
    const amount = Number(body.TransAmount || 0)
    const receipt = String(body.TransID || "")

    // ==================================================
    // 1. FUNDRAISING PAYMENT
    // ==================================================

    if (
      accountNumber.toUpperCase().startsWith("FUND-") &&
      receipt &&
      amount > 0
    ) {
      console.log("FUNDRAISING C2B PAYMENT:", {
        accountNumber,
        amount,
        receipt,
        msisdn,
      })

      const { data: fundraisingData, error: fundraisingError } =
        await supabase.rpc(
          "complete_fundraising_c2b_payment",
          {
            p_reference: accountNumber,
            p_mpesa_receipt: receipt,
            p_amount: amount,
            p_msisdn: msisdn,
            p_first_name: firstName,
            p_middle_name: middleName,
            p_last_name: lastName,
          }
        )

      if (fundraisingError) {
        console.error(
          "FUNDRAISING PAYMENT ERROR:",
          fundraisingError
        )

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Success",
        })
      }

      console.log(
        "FUNDRAISING PAYMENT COMPLETED:",
        fundraisingData
      )

      const fundraisingResult =
        Array.isArray(fundraisingData)
          ? fundraisingData[0]
          : fundraisingData

      // ==================================================
      // CREATE FUNDRAISING PAYOUT RECORD
      // ==================================================

      if (
        fundraisingResult?.success &&
        fundraisingResult?.contribution_id
      ) {
        const contributionId =
          fundraisingResult.contribution_id

        const campaignId =
          fundraisingResult.campaign_id

        console.log(
          "CREATING FUNDRAISING PAYOUT RECORD:",
          {
            contributionId,
            campaignId,
            amount,
          }
        )

        /*
         * Load the campaign destination.
         *
         * We snapshot the destination into the payout record
         * so that changing the campaign later cannot redirect
         * an already-paid contribution.
         */
        const { data: campaign, error: campaignError } =
          await supabase
            .from("fundraising_campaigns")
            .select(
              `
                id,
                destination_type,
                destination_phone,
                destination_paybill,
                destination_account,
                destination_till,
                destination_bank_name,
                destination_bank_account
              `
            )
            .eq("id", campaignId)
            .single()

        if (campaignError || !campaign) {
          console.error(
            "FUNDRAISING CAMPAIGN LOAD ERROR:",
            campaignError
          )
        } else {
          /*
           * One contribution can only have one payout.
           *
           * The database UNIQUE constraint on contribution_id
           * prevents duplicate payout records.
           */
          const { data: payoutData, error: payoutError } =
            await supabase
              .from("fundraising_payouts")
              .upsert(
                {
                  contribution_id: contributionId,
                  campaign_id: campaign.id,
                  amount,

                  destination_type:
                    campaign.destination_type,

                  destination_phone:
                    campaign.destination_phone,

                  destination_paybill:
                    campaign.destination_paybill,

                  destination_account:
                    campaign.destination_account,

                  destination_till:
                    campaign.destination_till,

                  destination_bank_name:
                    campaign.destination_bank_name,

                  destination_bank_account:
                    campaign.destination_bank_account,

                  status: "pending",
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "contribution_id",
                  ignoreDuplicates: true,
                }
              )
              .select()
              .maybeSingle()

          if (payoutError) {
            console.error(
              "FUNDRAISING PAYOUT RECORD ERROR:",
              payoutError
            )
          } else {
            console.log(
              "FUNDRAISING PAYOUT RECORD READY:",
              payoutData
            )

// ==================================================
// AUTOMATIC FUNDRAISING PAYOUT
// ==================================================

if (
  campaign.destination_type === "phone" &&
  amount >= 10
) {
  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://streetgo.app"

    console.log(
      "STARTING AUTOMATIC FUNDRAISING PAYOUT:",
      {
        contributionId,
        amount,
      }
    )

    const payoutResponse = await fetch(
      `${origin}/api/mpesa/fundraising/payout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contributionId,
        }),
        cache: "no-store",
      }
    )

    const payoutResult =
      await payoutResponse.json()

    if (!payoutResponse.ok) {
      console.error(
        "AUTOMATIC FUNDRAISING PAYOUT FAILED:",
        payoutResult
      )
    } else {
      console.log(
        "AUTOMATIC FUNDRAISING PAYOUT STARTED:",
        payoutResult
      )
    }
  } catch (error) {
    console.error(
      "AUTOMATIC FUNDRAISING PAYOUT ERROR:",
      error
    )
  }
}

          }
        }
      }

      /*
       * IMPORTANT:
       *
       * We do NOT send the fundraiser money here yet.
       *
       * The contribution has been successfully received and
       * the payout has been recorded as PENDING.
       *
       * The separate fundraising payout router will handle
       * the actual disbursement.
       */

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      })
    }

    // ==================================================
    // 2. EXISTING MERRY-GO-ROUND PAYMENT
    // ==================================================

    if (!accountNumber || !firstName) {
      console.log(
        "C2B payment did not contain enough identity information."
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      })
    }

    const { data: paymentData, error: paymentError } =
      await supabase.rpc(
        "complete_merry_go_round_manual_payment",
        {
          p_member_code: accountNumber,
          p_mpesa_receipt: receipt,
          p_amount: amount,
          p_msisdn: msisdn,
          p_first_name: firstName,
          p_middle_name: middleName,
          p_last_name: lastName,
        }
      )

    if (paymentError) {
      console.error(
        "CONTRIBUTION PAYMENT ERROR:",
        paymentError
      )
    } else {
      console.log(
        "CONTRIBUTION PAYMENT COMPLETED:",
        paymentData
      )
    }

    // ==================================================
    // 3. VERIFY MERRY-GO-ROUND MEMBER
    // ==================================================

    const {
      data: verificationData,
      error: verificationError,
    } = await supabase.rpc(
      "verify_member_from_c2b",
      {
        p_msisdn: msisdn,
        p_account_number: accountNumber,
        p_first_name: firstName,
        p_middle_name: middleName,
        p_last_name: lastName,
      }
    )

    if (verificationError) {
      console.error(
        "MEMBER VERIFICATION ERROR:",
        verificationError
      )
    } else {
      console.log(
        "STREETGO MEMBER VERIFIED:",
        verificationData
      )
    }

    // ==================================================
    // 4. AUTOMATIC MERRY-GO-ROUND PAYOUT
    // ==================================================

    const paymentRow =
      Array.isArray(paymentData)
        ? paymentData[0]
        : paymentData

    if (
      paymentRow?.round_id &&
      paymentRow?.round_status === "ready"
    ) {
      console.log(
        "ROUND READY - STARTING AUTOMATIC B2C PAYOUT:",
        paymentRow.round_id
      )

      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://streetgo.app"

      const processResponse = await fetch(
        `${origin}/api/mpesa/b2c/contribution/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roundId: paymentRow.round_id,
          }),
          cache: "no-store",
        }
      )

      const processResult =
        await processResponse.json()

      if (!processResponse.ok) {
        console.error(
          "AUTOMATIC CONTRIBUTION PAYOUT FAILED:",
          processResult
        )
      } else {
        console.log(
          "AUTOMATIC CONTRIBUTION PAYOUT STARTED:",
          processResult
        )
      }
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  } catch (error) {
    console.error(
      "C2B CONFIRMATION ERROR:",
      error
    )

    /*
     * Always acknowledge Safaricom so that the
     * confirmation request is not repeatedly retried.
     */
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "StreetGO C2B confirmation endpoint is operational",
  })
}