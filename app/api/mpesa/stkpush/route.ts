import { NextResponse } from 'next/server'
import axios from 'axios'

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      'Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET'
    )
  }

  const auth = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString('base64')

  const { data } = await axios.get(
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  )

  if (!data?.access_token) {
    throw new Error('Safaricom did not return an access token')
  }

  return data.access_token
}

export async function POST(req: Request) {
  try {
    const { amount, phone } = await req.json()

    // --------------------------------------------------
    // Validate request
    // --------------------------------------------------

    if (!amount || Number(amount) < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount must be at least KSh 1',
        },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number is required',
        },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // Environment configuration
    // --------------------------------------------------

    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const callbackUrl = process.env.MPESA_CALLBACK_URL

    if (!shortcode) {
      throw new Error('Missing MPESA_SHORTCODE')
    }

    if (!passkey) {
      throw new Error('Missing MPESA_PASSKEY')
    }

    if (!callbackUrl) {
      throw new Error('Missing MPESA_CALLBACK_URL')
    }

    // --------------------------------------------------
    // Format phone number
    // --------------------------------------------------

    const cleanPhone = String(phone).replace(/\D/g, '')

    let formattedPhone = cleanPhone

    if (cleanPhone.startsWith('0')) {
      formattedPhone = `254${cleanPhone.slice(1)}`
    } else if (cleanPhone.startsWith('7')) {
      formattedPhone = `254${cleanPhone}`
    } else if (cleanPhone.startsWith('254')) {
      formattedPhone = cleanPhone
    }

    // Basic Kenyan phone validation
    if (!/^2547\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Kenyan phone number',
        },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // Timestamp
    // --------------------------------------------------

    const date = new Date()

    const timestamp =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0')

    // --------------------------------------------------
    // STK Push password
    // --------------------------------------------------

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString('base64')

    // --------------------------------------------------
    // Get production OAuth token
    // --------------------------------------------------

    const token = await getAccessToken()

    // --------------------------------------------------
    // Send production STK Push
    // --------------------------------------------------

    const { data } = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,

        TransactionType: 'CustomerPayBillOnline',

        Amount: Math.floor(Number(amount)),

        PartyA: formattedPhone,
        PartyB: shortcode,

        PhoneNumber: formattedPhone,

        CallBackURL: callbackUrl,

        AccountReference: 'StreetGO',

        TransactionDesc: 'Wallet Deposit',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('=================================')
    console.log('MPESA STK PUSH RESPONSE')
    console.log(data)
    console.log('=================================')

    return NextResponse.json(data)
  } catch (error: any) {
    const details =
      error.response?.data ||
      error.message ||
      'Unknown M-PESA STK Push error'

    console.error('=================================')
    console.error('MPESA STK PUSH ERROR')
    console.error(details)
    console.error('=================================')

    return NextResponse.json(
      {
        success: false,
        error: details,
      },
      { status: 400 }
    )
  }
}