import { NextResponse } from "next/server"

import { createServerSupabase } from "../../../lib/serverSupabase"



export async function POST(
  req: Request
) {


try {


const supabase =
await createServerSupabase()



// Logged user

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
success:false,
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
connectionId
}
=
body




if(!connectionId){

return NextResponse.json(
{
success:false,
error:"Missing connectionId"
},
{
status:400
}
)

}





// =====================================
// ACCEPT CONNECTION
// =====================================


const {
data,
error
}
=
await supabase


.from("connections")


.update({

status:"accepted"

})


.eq(
"id",
connectionId
)


.eq(
"receiver_id",
user.id
)


.select(`

id,
status,
created_at,

sender:profiles!connections_sender_id_fkey(
id,
username,
avatar_url
),

receiver:profiles!connections_receiver_id_fkey(
id,
username,
avatar_url
)

`)


.single()





if(error){


console.log(
"ACCEPT ERROR:",
error
)



return NextResponse.json(
{
success:false,
error:error.message
},
{
status:400
}
)

}





if(!data){


return NextResponse.json(
{
success:false,
error:"Connection not found"
},
{
status:404
}
)

}





// =====================================
// GET USER IDS
// =====================================


const connection:any = data



const senderId =
Array.isArray(connection.sender)
?
connection.sender[0]?.id
:
connection.sender?.id



const receiverId =
Array.isArray(connection.receiver)
?
connection.receiver[0]?.id
:
connection.receiver?.id





if(!senderId || !receiverId){


return NextResponse.json(
{
success:false,
error:"Missing profile relation"
},
{
status:500
}
)

}





// =====================================
// CREATE ACCEPTED NOTIFICATION
// =====================================


const otherUserId =
user.id === senderId
?
receiverId
:
senderId



await supabase

.from("notifications")

.insert({

user_id: otherUserId,

actor_id:user.id,

type:
"connection_accepted",

message:
"Your connection request was accepted ❤️",

is_read:false

})







// =====================================
// RETURN CHAT USER
// =====================================


return NextResponse.json({

success:true,

message:
"Connection accepted",

chatUserId:
otherUserId,


connection:data


})





}

catch(error){


console.log(
"SERVER ERROR:",
error
)


return NextResponse.json(

{
success:false,
error:"Server error"
},

{
status:500
}

)


}


}