import { NextResponse } from 'next/server'
import axios from 'axios'

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const { data } = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  )

  return data.access_token
}

export async function POST(req: Request) {
  try {
    const { amount, phone } = await req.json()

    console.log('STK Push request:', { amount, phone })

    // Format phone number to 2547XXXXXXXX
    const cleanPhone = String(phone).replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('0')
      ? `254${cleanPhone.slice(1)}`
      : cleanPhone

    console.log('Formatted phone:', formattedPhone)

    const date = new Date()

    const timestamp =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0')

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    const token = await getAccessToken()

    console.log('Access token received')
    console.log('Callback URL:', process.env.MPESA_CALLBACK_URL)

    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Number(amount),
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'StreetMarket',
        TransactionDesc: 'Wallet Deposit',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    console.log('Safaricom Response:', data)

    return NextResponse.json(data)
  } catch (error: any) {
    const details = error.response?.data || error.message

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