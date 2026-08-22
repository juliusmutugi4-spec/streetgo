'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'


interface Match {

  id:string

  name:string

  avatar:string | null

  score:number

  reasons:string[]

  connectionStatus:
    "none" |
    "pending" |
    "accepted"

}



export default function DatingPage() {


  const [matches, setMatches] = useState<Match[]>([])



  async function getConnectionStatus(
    userId:string
  ){

    const res = await fetch(
      "/api/connections/status",
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          otherUserId:userId

        })

      }
    )


    const data = await res.json()


    return data.status || "none"

  }





  useEffect(()=>{


    async function loadMatches(){


const {
  data:{
    user
  }
} = await supabase.auth.getUser()

console.log(
 "AUTH USER ID:",
 user?.id
)

if(!user){

  console.log(
    "No logged in user"
  )

  return

}

const { data: profile } = await supabase

  .from("profiles")

  .select(
    "dating_active"
  )

  .eq(
    "id",
    user.id
  )

  .single()



if(
  !profile?.dating_active
){

  window.location.href =
    "/dating/setup"

  return

}



console.log(
  "MATCH ENGINE URL:",
  process.env.NEXT_PUBLIC_MATCH_ENGINE_URL
)

const res = await fetch(

`${process.env.NEXT_PUBLIC_MATCH_ENGINE_URL}/matches/${user.id}`

)


      const data = await res.json()

console.log(
  "MATCH DATA FROM PYTHON:",
  data
)

      const updatedMatches = await Promise.all(

        (data.matches || []).map(

          async(person:any)=>{


            const status =
              await getConnectionStatus(
                person.id
              )


            return {

              ...person,

              connectionStatus:status

            }


          }

        )

      )



      setMatches(
        updatedMatches
      )


    }



    loadMatches()


  },[])





  async function sendConnection(
    receiverId:string
  ){


    const response = await fetch(

      "/api/connections",

      {

        method:"POST",

        headers:{

          "Content-Type":"application/json"

        },


        body:JSON.stringify({

          receiver_id:receiverId

        })

      }

    )



    const data =
      await response.json()



    console.log(
      "CONNECTION:",
      data
    )



    if(response.ok){


      setMatches(prev=>

        prev.map(person=>

          person.id === receiverId

          ?

          {
            ...person,
            connectionStatus:"pending"
          }

          :

          person

        )

      )


    }

    else{


      alert(
        data.error ||
        "Failed"
      )


    }


  }





  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      p-10
    ">


      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">

        ❤️ StreetGO Connections

      </h1>



      <div className="
        grid
        gap-5
        max-w-xl
      ">


      {
        matches.map(person=>(


          <div

            key={person.id}

            className="
            rounded-2xl
            bg-zinc-900
            border
            border-zinc-800
            p-6
            "

          >


            <div className="
              flex
              items-center
              gap-4
            ">


              {
                person.avatar &&

                <img

                  src={person.avatar}

                  className="
                  w-14
                  h-14
                  rounded-full
                  object-cover
                  "

                />

              }



              <h2 className="
                text-xl
                font-bold
              ">

                {person.name}

              </h2>


            </div>




            <div className="
              text-green-400
              text-2xl
              mt-4
            ">

              {person.score}% Match

            </div>




            <div className="
              mt-4
              space-y-2
              text-sm
              text-zinc-300
            ">


            {
              person.reasons.map(reason=>(

                <p key={reason}>

                  ✓ {reason}

                </p>

              ))
            }


            </div>



<button

onClick={()=>{


  if(person.connectionStatus === "accepted"){


    window.location.href =
      `/chat/${person.id}`


    return;


  }



  sendConnection(
    person.id
  )


}}


className="
mt-5
w-full
rounded-xl
py-3
font-bold
bg-white
text-black
disabled:bg-zinc-700
disabled:text-zinc-400
"


>


{


person.connectionStatus === "pending"

?

"Pending ⏳"


:

person.connectionStatus === "accepted"

?

"Connected 💬"


:

"Connect ❤️"


}



</button>



          </div>


        ))
      }


      </div>


    </main>

  )

}