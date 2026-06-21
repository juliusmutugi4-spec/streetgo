'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
export default function DriverRegisterPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('boda')
  const [plateNumber, setPlateNumber] = useState('')

  const [vehicleModel, setVehicleModel] = useState('')
const [vehicleColor, setVehicleColor] = useState('')
const [licensePhoto, setLicensePhoto] = useState<File | null>(null)
const [idFront, setIdFront] = useState<File | null>(null)
const [idBack, setIdBack] = useState<File | null>(null)
const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null)
const [status, setStatus] = useState('pending')


async function submitApplication() {

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    alert('Please login first')
    return
  }

const { data: existingDriver } = await supabase
  .from('drivers')
  .select('id,status')
  .eq('user_id', user.id)
  .single()

if (existingDriver) {
  alert(`Application already exists (${existingDriver.status})`)
  return
}

const { error } = await supabase
  .from('drivers')
  .insert({
    user_id: user.id,
    full_name: fullName,
    phone,
    national_id: idNumber,
    vehicle_type: vehicleType,
    plate_number: plateNumber,
    vehicle_model: vehicleModel,
    vehicle_color: vehicleColor,
    status: 'pending'
  })

  if (error) {
    alert(error.message)
  } else {
    alert('Application submitted successfully')
  }
}


  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">

      <div className="max-w-xl mx-auto">

        <h1 className="text-4xl font-black mb-8">
          🚗 Become Driver
        </h1>

        <div className="space-y-4">

          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e)=>setFullName(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          />

          <input
            placeholder="National ID Number"
            value={idNumber}
            onChange={(e)=>setIdNumber(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          />

          <select
            value={vehicleType}
            onChange={(e)=>setVehicleType(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          >
            <option value="boda">🏍️ Bodaboda</option>
            <option value="taxi">🚗 Taxi</option>
          </select>

          <input
            placeholder="Plate Number"
            value={plateNumber}
            onChange={(e)=>setPlateNumber(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          />

          <input
  placeholder="Vehicle Model"
  value={vehicleModel}
  onChange={(e)=>setVehicleModel(e.target.value)}
  className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
/>

<input
  placeholder="Vehicle Color"
  value={vehicleColor}
  onChange={(e)=>setVehicleColor(e.target.value)}
  className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
/>

<button
  onClick={submitApplication}
  className="
  w-full
  p-4
  rounded-xl
  bg-cyan-500
  text-black
  font-black
  "
>
  Submit Application
</button>

<h2 className="text-2xl font-bold mt-10 mb-5">
  Upload Documents
</h2>

<div className="space-y-4">


  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <p>🪪 Driving License</p>

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setLicensePhoto(e.target.files?.[0] || null)
      }
    />
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <p>🆔 ID Front</p>

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setIdFront(e.target.files?.[0] || null)
      }
    />
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <p>🆔 ID Back</p>

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setIdBack(e.target.files?.[0] || null)
      }
    />
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <p>🏍️ Vehicle Photo</p>

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setVehiclePhoto(e.target.files?.[0] || null)
      }
    />
  </div>

</div>


        </div>

      </div>

    </main>
  )
}