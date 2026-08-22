'use client'
import { useEffect, useState } from "react"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"

interface Request {

  id:string

  sender:{
    id:string
    username:string
    avatar_url:string | null
  }

}


interface Props {

  onAccepted?:()=>void

}



export default function DatingRequests({
  onAccepted
}:Props){


const [requests,setRequests] =
useState<Request[]>([])


const [open,setOpen] =
useState(false)



async function loadRequests(){


const res = await fetch(
  "/api/connections/incoming"
)


const data =
await res.json()


setRequests(
  data.requests || []
)


}




useEffect(()=>{


loadRequests()


const channel =
supabase
.channel("connection-requests")
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"connections"
},
(payload: RealtimePostgresChangesPayload<any>)=>{

console.log(
"NEW CONNECTION REQUEST",
payload
)


loadRequests()


}
)
.subscribe()



return ()=>{

supabase.removeChannel(channel)

}


},[])




async function acceptRequest(
id:string
){


const res =
await fetch(

"/api/connections/accept",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

connectionId:id

})

}

)



if(res.ok){


setRequests(prev=>
prev.filter(
item=>item.id !== id
)
)


onAccepted?.()


}



}




async function rejectRequest(
id:string
){


const res =
await fetch(

"/api/connections/reject",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

connectionId:id

})

}

)



if(res.ok){


setRequests(prev=>
prev.filter(
item=>item.id !== id
)
)


}



}




return (

<div
className="
fixed
top-5
right-5
z-50
"
>


<button

onClick={()=>setOpen(!open)}

className="
relative
bg-pink-600
rounded-full
px-5
py-3
font-bold
shadow-xl
"

>

❤️


{
requests.length > 0 &&

<span

className="
absolute
-top-2
-right-2
bg-red-500
text-white
rounded-full
text-xs
px-2
py-1
"

>

{requests.length}

</span>

}


</button>




{
open &&

<div

className="
absolute
right-0
mt-3
w-80
bg-zinc-900
border
border-zinc-700
rounded-2xl
p-4
shadow-2xl
"

>


<h3 className="
font-bold
mb-4
">

Connection Requests

</h3>



{
requests.length === 0 &&

<p className="
text-zinc-400
">

No requests

</p>

}





{
requests.map(request=>(


<div

key={request.id}

className="
border-b
border-zinc-700
pb-4
mb-4
"

>


<div className="
flex
items-center
gap-3
">


{
request.sender.avatar_url &&

<img

src={
request.sender.avatar_url
}

className="
w-12
h-12
rounded-full
"

/>

}



<div>

<p className="
font-bold
">

{request.sender.username}

</p>


<p className="
text-sm
text-zinc-400
">

wants to connect ❤️

</p>


</div>


</div>



<div className="
flex
gap-2
mt-3
">


<button

onClick={()=>
acceptRequest(request.id)
}

className="
flex-1
bg-white
text-black
rounded-xl
py-2
font-bold
"

>

Accept

</button>



<button

onClick={()=>
rejectRequest(request.id)
}

className="
flex-1
bg-red-600
rounded-xl
py-2
font-bold
"

>

Reject

</button>


</div>


</div>


))

}


</div>

}


</div>

)

}