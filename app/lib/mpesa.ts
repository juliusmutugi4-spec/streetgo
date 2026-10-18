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

  console.log("📡 MPESA OAUTH STATUS:", response.status);
  console.log("📡 MPESA OAUTH RAW RESPONSE:", raw);

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