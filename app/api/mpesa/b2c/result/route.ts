import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log("===== B2C RESULT RECEIVED =====")
    console.log(JSON.stringify(body, null, 2))
    console.log("================================")

    const result = body?.Result

    if (!result) {
      console.error("B2C RESULT: Missing Result object")

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    const resultCode = Number(result.ResultCode ?? -1)
    const resultDesc = result.ResultDesc ?? "Unknown result"

    const conversationId =
      result.ConversationID ?? null

    const originatorConversationId =
      result.OriginatorConversationID ?? null

    /*
     * Safaricom's ResultParameters contain the
     * actual transaction information when successful.
     */
    const parameters =
      result.ResultParameters?.ResultParameter ?? []

    const getParameter = (name: string) => {
      const item = parameters.find(
        (parameter: any) =>
          parameter.Key === name
      )

      return item?.Value ?? null
    }

    const transactionId =
      getParameter("TransactionID")

    const transactionAmount =
      getParameter("TransactionAmount")

    const receiverPartyPublicName =
      getParameter("ReceiverPartyPublicName")

    const transactionReceipt =
      getParameter("TransactionReceipt")

    /*
     * Try to find the withdrawal using the
     * B2C ConversationID first.
     */
    let withdrawal = null

    if (conversationId) {
      const { data } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq(
          "b2c_conversation_id",
          conversationId
        )
        .maybeSingle()

      withdrawal = data
    }

    /*
     * Fallback to OriginatorConversationID.
     */
    if (!withdrawal && originatorConversationId) {
      const { data } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq(
          "b2c_originator_conversation_id",
          originatorConversationId
        )
        .maybeSingle()

      withdrawal = data
    }

    if (!withdrawal) {
      console.error(
        "B2C RESULT: Withdrawal not found",
        {
          conversationId,
          originatorConversationId,
        }
      )

      /*
       * Still acknowledge Safaricom.
       * We don't want unnecessary callback retries
       * because our database couldn't find the record.
       */
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    /*
     * IMPORTANT:
     * Never downgrade an already-paid withdrawal.
     */
    if (withdrawal.status === "paid") {
      console.log(
        "B2C RESULT: Withdrawal already paid",
        withdrawal.id
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      })
    }

    /*
     * SUCCESS
     */
    if (resultCode === 0) {
      const updateData: Record<string, any> = {
        status: "paid",
        processed_at: new Date().toISOString(),
        mpesa_confirmed_at:
          new Date().toISOString(),
        mpesa_message: resultDesc,
      }

      if (transactionId) {
        updateData.mpesa_receipt =
          transactionId
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(updateData)
        .eq("id", withdrawal.id)

      if (error) {
        console.error(
          "B2C RESULT: Failed to update paid withdrawal",
          error
        )

        return NextResponse.json(
          {
            ResultCode: 1,
            ResultDesc:
              "Failed to update withdrawal",
          },
          { status: 500 }
        )
      }

      console.log(
        "===== WITHDRAWAL PAID ====="
      )
      console.log({
        withdrawalId: withdrawal.id,
        withdrawalReference:
          withdrawal.withdrawal_reference,
        amount: withdrawal.amount,
        transactionId,
        transactionAmount,
        receiverPartyPublicName,
        transactionReceipt,
      })
      console.log(
        "============================"
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    /*
     * FAILURE
     */
    const { error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "failed",
        processed_at:
          new Date().toISOString(),
        mpesa_message:
          `${resultCode}: ${resultDesc}`,
      })
      .eq("id", withdrawal.id)
      .neq("status", "paid")

    if (error) {
      console.error(
        "B2C RESULT: Failed to update failed withdrawal",
        error
      )

      return NextResponse.json(
        {
          ResultCode: 1,
          ResultDesc:
            "Failed to update withdrawal",
        },
        { status: 500 }
      )
    }

    console.log(
      "===== WITHDRAWAL FAILED ====="
    )
    console.log({
      withdrawalId: withdrawal.id,
      withdrawalReference:
        withdrawal.withdrawal_reference,
      resultCode,
      resultDesc,
    })
    console.log(
      "=============================="
    )

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  } catch (error) {
    console.error(
      "===== B2C RESULT ERROR ====="
    )
    console.error(error)

    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc:
          "Failed to process result",
      },
      { status: 500 }
    )
  }
}