import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import { logAdminAction } from "./auditActions"



export async function copyReference(
  reference:string
){

  if(!reference){
    return
  }


  await navigator.clipboard.writeText(
    reference
  )


  alert("Reference copied")

}





export async function getWalletByTransaction(
  walletId:string
){

  if(!walletId){

    console.log(
      "NO WALLET ID"
    )

    return null

  }


  const supabase = getSupabaseBrowser()


  const {
    data,
    error
  } = await supabase
  .from("wallets")
  .select("*")
  .eq(
    "id",
    walletId
  )
  .single()



  if(error){

    console.log(
      "WALLET ERROR:",
      error
    )

    return null

  }


  return data

}





export async function freezeWallet(
  walletId:string,
  adminId:string
){

  if(!walletId){

    console.log(
      "NO WALLET ID"
    )

    return false

  }



  const supabase = getSupabaseBrowser()



  // 1. Freeze wallet first

  const {
    error
  } = await supabase
  .from("wallets")
  .update({

    money_wallet_active:false

  })
  .eq(
    "id",
    walletId
  )



  if(error){

    console.log(
      "FREEZE WALLET ERROR:",
      error
    )

    return false

  }



  // 2. Save audit log after success

  await logAdminAction({

    adminId,

    action:"FREEZE_WALLET",

    targetType:"wallet",

    targetId:walletId,

    description:"Admin froze wallet"

  })



  return true

}