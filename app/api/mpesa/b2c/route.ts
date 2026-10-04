import { NextRequest, NextResponse } from "next/server";
import { getB2CAccessToken } from "@/app/lib/mpesa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { phone, amount } = body;

    if (!phone || !amount) {
      return NextResponse.json(
        {
          error: "phone and amount are required",
        },
        { status: 400 }
      );
    }

    const token = await getB2CAccessToken();

    // Unique ID for this B2C request
    const originatorConversationID =
      `SG${Date.now()}`;

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          OriginatorConversationID:
            originatorConversationID,

          InitiatorName:
            process.env.MPESA_B2C_INITIATOR_NAME,

          SecurityCredential:
            process.env.MPESA_B2C_SECURITY_CREDENTIAL,

          CommandID: "BusinessPayment",

          Amount: Number(amount),

          PartyA:
            process.env.MPESA_B2C_SHORTCODE,

          PartyB: phone,

          Remarks: "StreetGO B2C Payment",

          QueueTimeOutURL:
            process.env.MPESA_B2C_TIMEOUT_URL,

          ResultURL:
            process.env.MPESA_B2C_RESULT_URL,

          Occasion: "StreetGO",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "SAFARICOM B2C ERROR:",
        data
      );

      return NextResponse.json(
        {
          error: data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("B2C ERROR:", error);

    return NextResponse.json(
      {
        error: "B2C request failed",
      },
      {
        status: 500,
      }
    );
  }
}