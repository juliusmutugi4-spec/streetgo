import { NextRequest, NextResponse } from "next/server"
import { getMpesaAccessToken } from "@/app/lib/mpesa"
import { createServerSupabase } from "@/app/lib/serverSupabase"

export async function POST(
  req: NextRequest
){

try {


const body = await req.json()


const {
 phone,
 amount,
 user_id
}=body



if(!phone || !amount || !user_id){

return NextResponse.json(
{
error:"Missing payment details"
},
{
status:400
}
)

}



// Get M-Pesa token

const token =
await getMpesaAccessToken()



const timestamp =
new Date()
.toISOString()
.replace(/[-T:.Z]/g,"")
.substring(0,14)



const shortcode =
process.env.MPESA_SHORTCODE!


const passkey =
process.env.MPESA_PASSKEY!



const password =
Buffer
.from(
`${shortcode}${passkey}${timestamp}`
)
.toString("base64")



// STK PUSH REQUEST

const response =
await fetch(
"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
{

method:"POST",

headers:{

Authorization:
`Bearer ${token}`,

"Content-Type":
"application/json"

},


body:JSON.stringify({

BusinessShortCode:
shortcode,

Password:
password,

Timestamp:
timestamp,

TransactionType:
"CustomerPayBillOnline",

Amount:
amount,

PartyA:
phone,

PartyB:
shortcode,

PhoneNumber:
phone,

CallBackURL:
process.env.MPESA_CALLBACK_URL,

AccountReference:
"StreetGO",

TransactionDesc:
"StreetGO Wallet Deposit"

})


}
)



const data =
await response.json()







if(!response.ok){

return NextResponse.json(
{
error:data
},
{
status:400
}
)

}



// Save payment request
const supabase =
  await createServerSupabase()



await supabase
.from("mpesa_payments")
.insert({

user_id,

phone,

amount,

checkout_request_id:
data.CheckoutRequestID,

merchant_request_id:
data.MerchantRequestID,

status:"pending"

})



return NextResponse.json({

success:true,

message:
"STK Push sent",

data

})



}catch(error){





return NextResponse.json(
{
error:"STK failed"
},
{
status:500
}
)


}

}