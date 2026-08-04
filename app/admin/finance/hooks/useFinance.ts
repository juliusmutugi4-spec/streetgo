import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js"


export default function useFinance(
  authorized:boolean
){

const supabase = getSupabaseBrowser()


const [summary,setSummary] = useState<any>({
  total_deposits:0,
  total_withdrawals:0,
  pending_transactions:0,
  total_transactions:0
})


const [transactions,setTransactions] =
useState<any[]>([])


const [chartData,setChartData] =
useState<any[]>([])


const [extraFinance,setExtraFinance] =
useState({
  todayRevenue:0,
  activeWallets:0,
  totalWalletBalance:0
})


const [loading,setLoading] =
useState(true)


useEffect(()=>{

console.log("🔥 useFinance effect started");
console.log("AUTHORIZED =", authorized);


if(!authorized)
return


let cancelled = false


async function loadFinance(){



const {
data,
error
}= await supabase
.rpc("get_finance_summary")



const {
data:transactionData,
error:transactionError
}
=
await supabase
.from("transactions")
.select(`
 *,
 wallet_id,
 profiles:user_id(
   username
 )
`)
.order(
"created_at",
{
ascending:false
}
)
.limit(20)



if(transactionError){

console.log(
"TRANSACTION ERROR:",
transactionError
)

setLoading(false)

return

}



if(cancelled) return

setTransactions(
transactionData || []
)




const {
data:revenueData
}
=
await supabase
.rpc("get_revenue_chart")



if(cancelled) return

setChartData(
revenueData || []
)



const [
todayRevenueRes,
activeWalletRes,
totalBalanceRes
]= await Promise.all([


supabase.rpc(
"get_today_revenue"
),


supabase.rpc(
"get_active_wallet_users"
),


supabase.rpc(
"get_total_wallet_balance"
)

])



if(cancelled) return

setExtraFinance({

todayRevenue:
Number(todayRevenueRes.data || 0),


activeWallets:
Number(activeWalletRes.data || 0),


totalWalletBalance:
Number(totalBalanceRes.data || 0)

})



if(error){

console.log(
"FINANCE ERROR:",
error
)

setLoading(false)

return

}



if(cancelled) return

setSummary(data)

setLoading(false)


}



loadFinance()
const channel = supabase
  .channel("finance-transactions")
  .on(
    "system",
    {},
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("SYSTEM EVENT:", payload);
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "transactions",
    },
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("📢 TRANSACTION CHANGED:", payload);
      loadFinance();
    }
  )
  .subscribe((status: RealtimeChannel["state"]) => {
    console.log("REALTIME STATUS:", status);
  });

return () => {
  cancelled = true;

  supabase.removeChannel(channel);
};

},[authorized])



return {

summary,

transactions,

setTransactions,

chartData,

extraFinance,

loading

}


}