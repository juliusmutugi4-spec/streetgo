"use client"

import { useEffect, useState } from "react"



interface Request {

  id:string

  status:string

  sender:{
    id:string
    username:string
    avatar_url:string | null
  }

}



export default function ConnectionsPage(){


  const [requests,setRequests] = useState<Request[]>([])



  useEffect(()=>{


    fetch(
      "/api/connections/incoming"
    )

    .then(res=>res.json())

    .then(data=>{

      setRequests(
        data.requests || []
      )

    })


  },[])





  async function acceptRequest(
    id:string
  ){


    const res = await fetch(

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



    const data = await res.json()



    



    if(res.ok){


      setRequests(

        old =>
        old.filter(
          item=>item.id !== id
        )

      )


    }


  }


async function rejectRequest(
  id:string
){


  const res = await fetch(

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


    setRequests(

      old =>
      old.filter(
        item=>item.id !== id
      )

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

        ❤️ Connection Requests

      </h1>



      <div className="
        max-w-xl
        space-y-5
      ">


      {
        requests.map(request=>(


          <div

            key={request.id}

            className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-5
            "

          >


            <div className="
              flex
              items-center
              gap-4
            ">


              {
                request.sender.avatar_url &&

                <img

                  src={
                    request.sender.avatar_url
                  }

                  className="
                  w-14
                  h-14
                  rounded-full
                  "
                />

              }



              <div>

                <h2 className="
                  font-bold
                  text-xl
                ">

                  {request.sender.username}

                </h2>


                <p className="
                  text-zinc-400
                ">

                  wants to connect with you

                </p>

              </div>


            </div>



<div className="
flex
gap-3
mt-5
">


<button

onClick={()=>acceptRequest(request.id)}

className="
flex-1
bg-white
text-black
py-3
rounded-xl
font-bold
"

>

Accept ❤️

</button>



<button

onClick={()=>rejectRequest(request.id)}

className="
flex-1
bg-red-600
text-white
py-3
rounded-xl
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


    </main>

  )

}