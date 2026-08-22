"use client"

import { 
  useEffect, 
  useState 
} from "react"

import type {
  RealtimePostgresChangesPayload
} from "@supabase/supabase-js"

import { supabase } from "../lib/supabase"



export type RequestCategory =
  | "dating"
  | "business"
  | "job"



interface Request {

  id:string

  sender:{
    id:string
    username:string
    avatar_url:string | null
    headline?:string
  }

}




interface Props {

  type?:RequestCategory

  onAccepted?:()=>void

}





export default function ConnectionRequests(
{
  type="dating",
  onAccepted
}:Props
){



const [requests,setRequests] =
useState<Request[]>([])



const [open,setOpen] =
useState(false)



const [isLoading,setIsLoading] =
useState(true)





// =====================================
// LOAD REQUESTS
// =====================================

async function loadRequests(){


try{


const res =
await fetch(
"/api/connections/incoming"
)



if(!res.ok){

throw new Error(
"Failed loading requests"
)

}



const data =
await res.json()



setRequests(
data.requests || []
)



}

catch(error){

console.error(
"REQUEST LOAD ERROR:",
error
)

}


finally{

setIsLoading(false)

}


}









// =====================================
// REALTIME
// =====================================


useEffect(()=>{


let channel:any



async function startRealtime(){



const {
data:{
user
}
}
=
await supabase.auth.getUser()



if(!user){

return

}





await loadRequests()





channel =

supabase

.channel(
`connection-request-${user.id}`
)



.on(


"postgres_changes",


{


event:"INSERT",

schema:"public",

table:"connections",


filter:

`receiver_id=eq.${user.id}`


},


(
payload:
RealtimePostgresChangesPayload<any>

)=>{


console.log(
"NEW CONNECTION REQUEST:",
payload
)



loadRequests()



}


)



.subscribe(
  (status: string)=>{


    console.log(
      "REALTIME:",
      status
    )


  }
)



}



startRealtime()



return()=>{


if(channel){

supabase.removeChannel(
channel
)

}


}



},[])









// =====================================
// ACCEPT
// =====================================


async function acceptRequest(
id:string
){



const res =
await fetch(

"/api/connections/accept",

{


method:"POST",


headers:{

"Content-Type":
"application/json"

},


body:JSON.stringify({

connectionId:id

})


}

)





if(res.ok){


setRequests(

old=>

old.filter(

item=>

item.id !== id

)

)


onAccepted?.()



}



}









// =====================================
// REJECT
// =====================================


async function rejectRequest(
id:string
){



const res =
await fetch(

"/api/connections/reject",

{


method:"POST",


headers:{

"Content-Type":
"application/json"

},


body:JSON.stringify({

connectionId:id

})


}

)





if(res.ok){


setRequests(

old=>

old.filter(

item=>

item.id !== id

)

)



}



}









const config = {


dating:{


buttonBg:
"bg-rose-600 hover:bg-rose-500",


icon:"❤️",


title:
"Match Requests",


subtext:
"wants to connect with you",


accept:
"Accept"



},



business:{


buttonBg:
"bg-blue-600 hover:bg-blue-500",


icon:"🤝",


title:
"Network Invitations",


subtext:
"wants to connect professionally",


accept:
"Connect"



},



job:{


buttonBg:
"bg-emerald-600 hover:bg-emerald-500",


icon:"💼",


title:
"Job Requests",


subtext:
"sent you an opportunity",


accept:
"Review"



}



}[type]










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

onClick={()=>
setOpen(!open)
}

className={`

relative

p-3

rounded-full

text-white

shadow-xl

${config.buttonBg}

`}

>


<span className="text-xl">

{config.icon}

</span>



{

requests.length > 0 &&


<span

className="

absolute

-top-1

-right-1

bg-red-500

rounded-full

w-5

h-5

text-xs

flex

items-center

justify-center

font-bold

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

w-96

max-h-[500px]

overflow-y-auto

bg-zinc-950

border

border-zinc-800

rounded-2xl

shadow-2xl

p-4

"


>



<h3

className="

font-bold

mb-4

text-zinc-300

"

>


{config.title}

</h3>






{

isLoading &&

<p className="text-zinc-500">

Loading...

</p>

}








{

!isLoading &&
requests.length===0 &&


<div

className="

text-center

py-10

text-zinc-500

"

>


No new requests


</div>


}








{

requests.map(request=>(


<div

key={request.id}

className="

border-b

border-zinc-800

pb-4

mb-4

"


>



<div

className="

flex

gap-3

items-center

"

>


{


request.sender.avatar_url ?

<img

src={
request.sender.avatar_url
}

className="

w-12

h-12

rounded-full

object-cover

"

/>

:

<div

className="

w-12

h-12

rounded-full

bg-zinc-800

flex

items-center

justify-center

"

>

{

request.sender.username

.substring(0,2)

.toUpperCase()

}

</div>


}





<div>


<p className="font-bold">

{request.sender.username}

</p>



<p className="text-xs text-zinc-500">

{config.subtext}

</p>


</div>


</div>







<div

className="

flex

gap-2

mt-3

"

>



<button

onClick={()=>
acceptRequest(request.id)
}

className="

flex-1

bg-white

text-black

rounded-lg

py-2

font-bold

text-sm

"

>


{config.accept}


</button>





<button

onClick={()=>
rejectRequest(request.id)
}

className="

flex-1

bg-zinc-800

rounded-lg

py-2

text-sm

"

>


Decline


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