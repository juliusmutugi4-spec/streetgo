'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminManagement() {

  const [admins, setAdmins] = useState<any[]>([])
const [users, setUsers] = useState<any[]>([])
const [selectedUser, setSelectedUser] = useState("")
const [role, setRole] = useState("driver_admin")
useEffect(() => {

  async function loadData(){

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', {
        ascending:false
      })

    setAdmins(adminData || [])


    const { data: userData } = await supabase
      .from('profiles')
      .select('id, username')


    setUsers(userData || [])

  }


  loadData()

}, [])


async function createAdmin(){

  if(!selectedUser) return


  const { error } = await supabase
    .from('admins')
    .insert({
      user_id: selectedUser,
      role: role,
      status: 'active',
      permissions:{
        all:false
      }
    })


  if(error){
    console.log(error)
    return
  }


  alert("Admin created")

  window.location.reload()

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
                👤 {admin.role}
              </p>

              <p className="text-xs text-zinc-500">
                {admin.status}
              </p>
            </div>


            <span className="text-xs">
              #{admin.admin_id}
            </span>

          </div>
        ))}

      </div>

    </main>
  )
}