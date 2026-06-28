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

console.log("AUTH USER:", user)

if (!user) {
  alert("Not logged in")
  return
}
console.log('Logged in user:', user)
  if (!user) {
    alert('Please login first')
    return
  }

  const { data: existingDriver } = await supabase
    .from('drivers')
    .select('id,status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingDriver) {
    alert(`Application already exists (${existingDriver.status})`)
    return
  }

  let licenseUrl = ''
  let idFrontUrl = ''
  let idBackUrl = ''
  let vehiclePhotoUrl = ''

  // Upload Driving License
  if (licensePhoto) {

    const fileName = `${user.id}-${Date.now()}-${licensePhoto.name}`

    const { error } = await supabase.storage
      .from('driver-license')
      .upload(fileName, licensePhoto)

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('driver-license')
      .getPublicUrl(fileName)

    licenseUrl = data.publicUrl
  }

  // Upload ID Front
  if (idFront) {

    const fileName = `${user.id}-front-${Date.now()}-${idFront.name}`

    const { error } = await supabase.storage
      .from('driver-id')
      .upload(fileName, idFront)

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('driver-id')
      .getPublicUrl(fileName)

    idFrontUrl = data.publicUrl
  }

  // Upload ID Back
  if (idBack) {

    const fileName = `${user.id}-back-${Date.now()}-${idBack.name}`

    const { error } = await supabase.storage
      .from('driver-id')
      .upload(fileName, idBack)

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('driver-id')
      .getPublicUrl(fileName)

    idBackUrl = data.publicUrl
  }

  // Upload Vehicle Photo
  if (vehiclePhoto) {

    const fileName = `${user.id}-vehicle-${Date.now()}-${vehiclePhoto.name}`

    const { error } = await supabase.storage
      .from('driver-vehicle')
      .upload(fileName, vehiclePhoto)

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('driver-vehicle')
      .getPublicUrl(fileName)

    vehiclePhotoUrl = data.publicUrl
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
      status: 'pending',

      license_url: licenseUrl,
      id_front_url: idFrontUrl,
      id_back_url: idBackUrl,
      vehicle_photo_url: vehiclePhotoUrl
    })

  if (error) {
    alert(error.message)
    return
  }

  alert('Application submitted successfully!')

  window.location.href = '/driver'
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