'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminManagement() {

  const [admins, setAdmins] = useState<any[]>([])
const [users, setUsers] = useState<any[]>([])
const [selectedUser, setSelectedUser] = useState("")
const [isSuperAdmin, setIsSuperAdmin] = useState(false)
const [checking, setChecking] = useState(true)
const [role, setRole] = useState("driver_admin")
useEffect(() => {
async function loadData(){

  const { data: authData } = await supabase.auth.getUser()


  if(authData.user){

    const { data: currentAdmin } = await supabase
      .from("admins")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("status","active")
      .maybeSingle()


    if(currentAdmin?.role === "super_admin"){
      setIsSuperAdmin(true)
    }

  }



  const { data: adminData } = await supabase
    .from('admins')
    .select(`
      *,
      profiles:user_id (
        username
      )
    `)
    .order('created_at', {
      ascending:false
    })


  setAdmins(adminData || [])



  const { data: userData } = await supabase
    .from('profiles')
    .select('id, username')


  setUsers(userData || [])

}
setChecking(false)





  loadData()

}, [])

async function removeAdmin(id:number){

  const confirmDelete = confirm(
    "Remove this admin?"
  )

  if(!confirmDelete) return


  const { error } = await supabase
    .from("admins")
    .delete()
    .eq("admin_id", id)


  if(error){
    console.log(error)
    alert(error.message)
    return
  }


  alert("Admin removed")

  window.location.reload()

}



async function createAdmin(){

  if(!selectedUser) return

const { data: existing } = await supabase
  .from("admins")
  .select("id")
  .eq("user_id", selectedUser)
  .maybeSingle()


if(existing){
  alert("This user is already an admin")
  return
}
  const { error } = await supabase
    .from('admins')
    .insert({
      user_id: selectedUser,
      role: role,
      status: 'active',
permissions:
  role === "driver_admin"
    ? {
        manage_drivers: true,
        manage_videos: false,
        manage_wallet: false,
        manage_users: false
      }
    : role === "content_admin"
    ? {
        manage_drivers: false,
        manage_videos: true,
        manage_wallet: false,
        manage_users: false
      }
    : role === "finance_admin"
    ? {
        manage_drivers: false,
        manage_videos: false,
        manage_wallet: true,
        manage_users: false
      }
    : role === "support_admin"
    ? {
        manage_drivers: false,
        manage_videos: false,
        manage_wallet: false,
        manage_users: true
      }
    : {
        all: true
      }
    })


  if(error){
    console.log(error)
    return
  }


  alert("Admin created")

  window.location.reload()

}



if(checking){
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
      Checking permissions...
    </main>
  )
}


if(!isSuperAdmin){
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
      Access Denied
    </main>
  )
}


  return (
    <main className="min-h-screen bg-[#09090b] text-white p-8">

<div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-5">

  <h2 className="text-lg font-semibold">
    Add New Admin
  </h2>


  <div className="mt-4 grid gap-4">


    {/* User Select */}
    <select
      value={selectedUser}
      onChange={(e)=>setSelectedUser(e.target.value)}
      className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm"
    >

      <option value="">
        Select User
      </option>


      {users.map((user)=>(
        <option
          key={user.id}
          value={user.id}
        >
          {user.username}
        </option>
      ))}

    </select>



    {/* Role Select */}
    <select
      value={role}
      onChange={(e)=>setRole(e.target.value)}
      className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm"
    >

      <option value="driver_admin">
        Driver Admin
      </option>

      <option value="content_admin">
        Content Admin
      </option>

      <option value="finance_admin">
        Finance Admin
      </option>

      <option value="support_admin">
        Support Admin
      </option>

    </select>



    <button
      onClick={createAdmin}
      className="bg-white text-black rounded-lg py-3 text-sm font-medium hover:bg-zinc-200"
    >
      Create Admin
    </button>


  </div>

</div>


      <h1 className="text-2xl font-semibold">
        Admin Management
      </h1>

      <p className="text-zinc-400 text-sm mt-1">
        Manage StreetGO administrators
      </p>


      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl">

        {admins.map((admin)=>(
          <div
            key={admin.admin_id}
            className="p-4 border-b border-zinc-800 flex justify-between"
          >

            <div>
<p>
  👤 {admin.profiles?.username}
</p>

<p className="text-xs text-zinc-400">
  {admin.role}
</p>

              <p className="text-xs text-zinc-500">
                {admin.status}
              </p>
            </div>


<div className="flex items-center gap-3">


<span className="text-xs text-zinc-500">
 #{admin.admin_id}
</span>


<button
 onClick={()=>removeAdmin(admin.admin_id)}
 className="
 text-xs
 px-3
 py-1
 rounded-lg
 bg-red-500/20
 text-red-400
 hover:bg-red-500/30
 "
>
 Remove
</button>


</div>

          </div>
        ))}

      </div>

    </main>
  )
}