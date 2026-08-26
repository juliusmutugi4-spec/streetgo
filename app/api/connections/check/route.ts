import { NextResponse } from "next/server"

import { createServerSupabase } from "../../../lib/serverSupabase"



export async function POST(
  req:Request
){


try{


const supabase =
await createServerSupabase()



const {
data:{
user
}
}
=
await supabase.auth.getUser()



if(!user){

return NextResponse.json(
{
connected:false,
error:"Not authenticated"
},
{
status:401
}
)

}



const body =
await req.json()



const {
otherUserId
}
=
body



if(!otherUserId){

return NextResponse.json(
{
connected:false,
error:"Missing user"
},
{
status:400
}
)

}




const {
data,
error
}
=
await supabase

.from("connections")

.select(
"id,status"
)


.or(

`
and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),
and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})
`

)


.eq(
"status",
"accepted"
)


.maybeSingle()





if(error){




return NextResponse.json(
{
connected:false
},
{
status:400
}
)

}





return NextResponse.json({

connected:
!!data,


connection:data


})




}

catch(error){





return NextResponse.json(
{
connected:false
},
{
status:500
}
)


}


}