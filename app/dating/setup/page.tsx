'use client'

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"


export default function DatingSetupPage(){

  const router = useRouter()


  const [age,setAge] = useState("")
  const [gender,setGender] = useState("")
  const [interests,setInterests] = useState<string[]>([])
  const [personality,setPersonality] = useState("")
  const [lookingFor,setLookingFor] = useState("")

  const [loading,setLoading] = useState(false)



  const interestOptions = [
    "football",
    "music",
    "movies",
    "technology",
    "travel",
    "business"
  ]



useEffect(()=>{

  async function loadProfile(){

    const {
      data:{
        user
      }
    } = await supabase.auth.getUser()


    if(!user) return


    const {data,error}=await supabase

      .from("profiles")

      .select(`
        age,
        gender,
        interests,
        personality,
        looking_for
      `)

      .eq(
        "id",
        user.id
      )

      .single()



    if(error){

      console.log(error)

      return

    }



    if(data){

      setAge(
        data.age?.toString() || ""
      )


      setGender(
        data.gender || ""
      )


      setInterests(
        data.interests || []
      )


      setPersonality(
        data.personality || ""
      )


      setLookingFor(
        data.looking_for || ""
      )

    }


  }


  loadProfile()


},[])




  function toggleInterest(item:string){

    if(interests.includes(item)){

      setInterests(
        interests.filter(
          i => i !== item
        )
      )

    }else{

      setInterests([
        ...interests,
        item
      ])

    }

  }



  async function saveProfile(){


    setLoading(true)


    const {
      data:{
        user
      }
    } = await supabase.auth.getUser()



    if(!user){

      alert(
        "Please login first"
      )

      setLoading(false)

      return

    }



    const {error} = await supabase

      .from("profiles")

      .update({

        age:Number(age),

        gender,

        interests,

        personality,

        looking_for:lookingFor,

        dating_active:true

      })

      .eq(
        "id",
        user.id
      )



    setLoading(false)



    if(error){

      console.log(error)

      alert(
        error.message
      )

      return

    }



    alert(
      "Dating profile activated ❤️"
    )


    router.push(
      "/dating"
    )


  }



  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      p-8
    ">


      <div className="
        max-w-xl
        mx-auto
        bg-zinc-900
        rounded-3xl
        p-8
        border
        border-zinc-800
      ">


        <h1 className="
          text-3xl
          font-bold
          mb-8
        ">
          ❤️ Create Dating Profile
        </h1>



        <label>
          Age
        </label>

        <input

          type="number"

          value={age}

          onChange={
            e=>setAge(e.target.value)
          }

          className="
          w-full
          mt-2
          mb-6
          bg-black
          border
          border-zinc-700
          rounded-xl
          p-3
          "

          placeholder="25"

        />



        <label>
          Gender
        </label>


        <select

          value={gender}

          onChange={
            e=>setGender(e.target.value)
          }

          className="
          w-full
          mt-2
          mb-6
          bg-black
          border
          border-zinc-700
          rounded-xl
          p-3
          "

        >

          <option value="">
            Select
          </option>

          <option value="male">
            Male
          </option>

          <option value="female">
            Female
          </option>


        </select>





        <label>
          Interests
        </label>


        <div className="
          flex
          flex-wrap
          gap-3
          mt-3
          mb-6
        ">


          {interestOptions.map(item=>(

            <button

              key={item}

              onClick={()=>toggleInterest(item)}

              className={

                interests.includes(item)

                ?

                "px-4 py-2 rounded-full bg-emerald-500 text-black"

                :

                "px-4 py-2 rounded-full bg-zinc-800"

              }

            >

              {item}

            </button>

          ))}


        </div>





        <label>
          Personality
        </label>


        <select

          value={personality}

          onChange={
            e=>setPersonality(e.target.value)
          }

          className="
          w-full
          mt-2
          mb-6
          bg-black
          border
          border-zinc-700
          rounded-xl
          p-3
          "

        >

          <option value="">
            Select
          </option>

          <option value="social">
            Social
          </option>

          <option value="quiet">
            Quiet
          </option>

          <option value="adventurous">
            Adventurous
          </option>


        </select>





        <label>
          Looking for
        </label>


        <select

          value={lookingFor}

          onChange={
            e=>setLookingFor(e.target.value)
          }

          className="
          w-full
          mt-2
          mb-8
          bg-black
          border
          border-zinc-700
          rounded-xl
          p-3
          "

        >

          <option value="">
            Select
          </option>

          <option value="relationship">
            Relationship
          </option>


          <option value="friendship">
            Friendship
          </option>


          <option value="networking">
            Networking
          </option>


        </select>





        <button

          onClick={saveProfile}

          disabled={loading}

          className="
          w-full
          bg-white
          text-black
          rounded-xl
          py-4
          font-bold
          "

        >

          {
            loading
            ?
            "Saving..."
            :
            "❤️ Start Dating"
          }


        </button>


      </div>


    </main>

  )

}