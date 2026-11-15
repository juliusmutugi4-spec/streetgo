


export interface MpesaStkPushInput {
  amount: number
  phone: string
  accountReference: string
  transactionDesc: string
  callbackUrl: string
}

export async function initiateMpesaStkPush(
  input: MpesaStkPushInput
) {
  const shortcode = process.env.MPESA_SHORTCODE
  const passkey = process.env.MPESA_PASSKEY

  if (!shortcode || !passkey) {
    throw new Error("M-Pesa shortcode configuration is missing.")
  }

  if (
    !Number.isSafeInteger(input.amount) ||
    input.amount < 1
  ) {
    throw new Error("STK amount must be a positive whole number.")
  }

  if (!/^254[17]\d{8}$/.test(input.phone)) {
    throw new Error("Invalid Kenyan phone number.")
  }

  if (!input.callbackUrl) {
    throw new Error("M-Pesa callback URL is required.")
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .substring(0, 14)

  const password = Buffer.from(
    `${shortcode}${passkey}${timestamp}`
  ).toString("base64")

  const token = await getMpesaAccessToken()

  const response = await fetch(
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: input.amount,
        PartyA: input.phone,
        PartyB: shortcode,
        PhoneNumber: input.phone,
        CallBackURL: input.callbackUrl,
        AccountReference: input.accountReference,
        TransactionDesc: input.transactionDesc,
      }),
    }
  )

const data = await response.json()

if (!response.ok || data?.ResponseCode !== "0") {
  console.error("MPESA STK REQUEST FAILED:", {
    status: response.status,
    responseCode: data?.ResponseCode,
    errorCode: data?.errorCode,
    errorMessage: data?.errorMessage,
    responseDescription: data?.ResponseDescription,
  })

  throw new Error(
    data?.errorMessage ||
    data?.ResponseDescription ||
    "Safaricom did not accept the STK Push request."
  )
}

return data
}


export async function getMpesaAccessToken() {
  const consumerKey =
    process.env.MPESA_CONSUMER_KEY!;

  const consumerSecret =
    process.env.MPESA_CONSUMER_SECRET!;

  const auth = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

  const response = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const raw = await response.text();

console.log("MPESA OAUTH STATUS:", response.status);

  let data: any = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      `M-PESA OAuth returned non-JSON response: ${
        raw || "EMPTY RESPONSE"
      }`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.errorMessage ||
        data.error_description ||
        "Failed to get M-Pesa token"
    );
  }

  if (!data.access_token) {
    throw new Error(
      "M-Pesa OAuth response did not contain an access token."
    );
  }

  return data.access_token;
}


// ======================================================
// B2C ACCESS TOKEN
// ======================================================

export async function getB2CAccessToken() {
  const consumerKey =
    process.env.MPESA_B2C_CONSUMER_KEY!;

  const consumerSecret =
    process.env.MPESA_B2C_CONSUMER_SECRET!;

  const auth = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

  const response = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.errorMessage ||
        "Failed to get B2C M-Pesa token"
    );
  }

  return data.access_token;
}