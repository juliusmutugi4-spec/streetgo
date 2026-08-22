'use client'

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"



export default function DatingSetupPage(){

const router = useRouter()


const [profileMode,setProfileMode] =
useState<
"dating" | "business" | "job"
>("dating")



const [age,setAge] = useState("")
const [gender,setGender] = useState("")

const [interests,setInterests] =
useState<string[]>([])

const [personality,setPersonality] =
useState("")

const [lookingFor,setLookingFor] =
useState("")


// New StreetGO fields

const [headline,setHeadline] =
useState("")

const [profession,setProfession] =
useState("")

const [skills,setSkills] =
useState<string[]>([])

const [experience,setExperience] =
useState("")

const [education,setEducation] =
useState("")

const [availability,setAvailability] =
useState("")


const [loading,setLoading] =
useState(false)




const interestOptions = [

"football",
"music",
"movies",
"technology",
"travel",
"business"

]



const skillOptions = [

"React",
"Next.js",
"Python",
"AI",
"Marketing",
"Design",
"Finance"

]





useEffect(()=>{


async function loadProfile(){


const {
data:{
user
}
}=await supabase.auth.getUser()


if(!user)return



const {data}=await supabase

.from("profiles")

.select("*")

.eq(
"id",
user.id
)

.single()



if(data){


setProfileMode(
data.profile_mode || "dating"
)


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



setHeadline(
data.headline || ""
)


setProfession(
data.profession || ""
)


setSkills(
data.skills || []
)


setExperience(
data.experience || ""
)


setEducation(
data.education || ""
)


setAvailability(
data.availability || ""
)


}



}



loadProfile()


},[])








function toggleArray(
item:string,
value:string[],
setValue:any
){

if(value.includes(item)){

setValue(
value.filter(
x=>x!==item
)
)

}else{


setValue([
...value,
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
}=await supabase.auth.getUser()



if(!user){

alert(
"Please login"
)

setLoading(false)

return

}






const {error}=await supabase

.from("profiles")

.update({


profile_mode:profileMode,


age:
age ? Number(age):null,


gender,


interests,


personality,


looking_for:lookingFor,



headline,


profession,


skills,


experience,


education,


availability,



dating_active:true



})

.eq(
"id",
user.id
)





setLoading(false)



if(error){

alert(
error.message
)

return

}



alert(
"StreetGO profile activated 🚀"
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
font-black
mb-8
">

Create StreetGO Profile

</h1>





<div className="
grid
grid-cols-3
gap-3
mb-8
">


{
[
["dating","❤️ Dating"],
["business","💼 Business"],
["job","🎯 Jobs"]

].map(item=>(


<button

key={item[0]}

onClick={()=>
setProfileMode(
item[0] as any
)
}

className={`
rounded-xl
py-3
font-bold

${
profileMode===item[0]

?

"bg-white text-black"

:

"bg-zinc-800"

}

`}

>

{item[1]}

</button>


))

}


</div>









<input

value={headline}

onChange={
e=>setHeadline(
e.target.value
)
}

placeholder="
Profile headline
"

className="
w-full
mb-4
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>





<input

value={profession}

onChange={
e=>setProfession(
e.target.value
)
}

placeholder="
Profession
"

className="
w-full
mb-6
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>










{
profileMode==="dating" &&

<>


<input

type="number"

value={age}

onChange={
e=>setAge(
e.target.value
)
}

placeholder="Age"

className="
w-full
mb-4
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>




<select

value={gender}

onChange={
e=>setGender(
e.target.value
)
}

className="
w-full
mb-5
bg-black
border
border-zinc-700
rounded-xl
p-3
"

>

<option value="">
Gender
</option>

<option value="male">
Male
</option>

<option value="female">
Female
</option>


</select>





<div className="
flex
flex-wrap
gap-2
">


{
interestOptions.map(item=>(


<button

key={item}

onClick={()=>
toggleArray(
item,
interests,
setInterests
)
}

className={

interests.includes(item)

?

"bg-pink-500 text-black px-4 py-2 rounded-full"

:

"bg-zinc-800 px-4 py-2 rounded-full"

}

>

{item}

</button>


))

}


</div>


</>


}









{
(profileMode==="business" ||
profileMode==="job") &&


<>


<textarea

value={headline}

onChange={
e=>setHeadline(
e.target.value
)
}

placeholder="
Tell people what you do
"

className="
w-full
mb-5
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>





<div className="
flex
flex-wrap
gap-2
mb-5
">

{
skillOptions.map(skill=>(


<button

key={skill}

onClick={()=>
toggleArray(
skill,
skills,
setSkills
)
}

className={

skills.includes(skill)

?

"bg-green-500 text-black px-4 py-2 rounded-full"

:

"bg-zinc-800 px-4 py-2 rounded-full"

}

>

{skill}

</button>


))

}

</div>






<input

value={experience}

onChange={
e=>setExperience(
e.target.value
)
}

placeholder="
Experience
"

className="
w-full
mb-4
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>




<input

value={education}

onChange={
e=>setEducation(
e.target.value
)
}

placeholder="
Education
"

className="
w-full
mb-4
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>




<input

value={availability}

onChange={
e=>setAvailability(
e.target.value
)
}

placeholder="
Availability
"

className="
w-full
mb-6
bg-black
border
border-zinc-700
rounded-xl
p-3
"

/>



</>


}










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

"Activate StreetGO 🚀"

}


</button>



</div>


</main>

)


}