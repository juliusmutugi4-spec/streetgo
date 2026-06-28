'use client'
import { useState, useEffect } from 'react'
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
const [uploading, setUploading] = useState(false)
const [progress, setProgress] = useState(0)
const [progressText, setProgressText] = useState('')
const [displayProgress, setDisplayProgress] = useState(0)
async function submitApplication() {

  setUploading(true)
  setProgress(0)
  setProgressText('Preparing application...')

  const {
    data: { user }
  } = await supabase.auth.getUser()
console.log("AUTH USER:", user)
console.log("AUTH UID:", user?.id)


if (!user) {
  setUploading(false)
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
  setUploading(false)
  alert(`Application already exists (${existingDriver.status})`)
  return
}
  let licenseUrl = ''
  let idFrontUrl = ''
  let idBackUrl = ''
  let vehiclePhotoUrl = ''

  // Upload Driving License
// Upload Driving License
if (licensePhoto) {

  setProgress(10)
  setProgressText('Uploading Driving License...')

  const fileName = `${user.id}-${Date.now()}-${licensePhoto.name}`

  const { error } = await supabase.storage
    .from('driver-license')
    .upload(fileName, licensePhoto)
    if (error) {
      alert(error.message)
      return
    }

licenseUrl = fileName

    setProgress(25)
  }

  // Upload ID Front
// Upload ID Front
if (idFront) {

  setProgress(30)
  setProgressText('Uploading ID Front...')

  const fileName = `${user.id}-front-${Date.now()}-${idFront.name}`

  const { error } = await supabase.storage
    .from('driver-id')
    .upload(fileName, idFront)

    if (error) {
      alert(error.message)
      return
    }

idFrontUrl = fileName
    setProgress(50)
  }

  // Upload ID Back
 // Upload ID Back
if (idBack) {

  setProgress(55)
  setProgressText('Uploading ID Back...')

  const fileName = `${user.id}-back-${Date.now()}-${idBack.name}`

  const { error } = await supabase.storage
    .from('driver-id')
    .upload(fileName, idBack)

    if (error) {
      alert(error.message)
      return
    }

idBackUrl = fileName

    setProgress(75)
  }

  // Upload Vehicle Photo
// Upload Vehicle Photo
if (vehiclePhoto) {

  setProgress(80)
  setProgressText('Uploading Vehicle Photo...')

  const fileName = `${user.id}-vehicle-${Date.now()}-${vehiclePhoto.name}`

  const { error } = await supabase.storage
    .from('driver-vehicle')
    .upload(fileName, vehiclePhoto)

    if (error) {
      alert(error.message)
      return
    }

vehiclePhotoUrl = fileName

    setProgress(90)
  }
setProgress(95)
setProgressText('Saving application...')
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
  setUploading(false)
  setProgress(0)
  setProgressText('')

  alert(
    `Code: ${error.code}
Message: ${error.message}
Details: ${error.details}
Hint: ${error.hint}`
  )

  return
}

setProgress(100)
setProgressText('Application submitted successfully! ✅')

setTimeout(() => {
  setUploading(false)

  alert('Application submitted successfully!')

  window.location.href = '/driver'
}, 1200)
}

useEffect(() => {

  if (displayProgress >= progress) return

  const timer = setInterval(() => {

    setDisplayProgress((value) => {

      if (value >= progress) {
        clearInterval(timer)
        return value
      }

      return value + 1

    })

  }, 15)

  return () => clearInterval(timer)

}, [progress, displayProgress])

  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">

{uploading && (
  <div
    className="
      fixed
      inset-0
      z-[9999]
      bg-black/80
      backdrop-blur-md
      flex
      items-center
      justify-center
      p-6
    "
  >
    <div
      className="
        w-full
        max-w-md
        bg-zinc-900
        rounded-3xl
        p-8
        border
        border-zinc-700
        shadow-2xl
      "
    >
      <div className="text-center">

<div className="flex justify-center mb-6">

  <div
    className="
      w-20
      h-20
      rounded-full
      border-4
      border-zinc-700
      border-t-cyan-400
      animate-spin
    "
  />

</div>

        <h2 className="text-2xl font-black mt-5">
          Uploading Driver Application
        </h2>

        <p className="text-zinc-400 mt-2">
          Please don't close this page.
        </p>

      </div>

      <div className="mt-8">

        <div className="flex justify-between text-sm mb-3">

          <span>{progressText}</span>

          <span>{progress}%</span>

        </div>

        <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">

          <div
            className="
              h-full
              bg-cyan-400
              transition-all
              duration-500
            "
style={{
  width: `${displayProgress}%`
}}
          />

        </div>

      </div>

    </div>
  </div>
)}

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
{uploading && (
  <div className="mb-4">

    <div className="flex justify-between text-sm text-zinc-400 mb-2">
      <span>{progressText}</span>
      <span>{displayProgress}%</span>
    </div>

    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">

      <div
        className="
          h-full
          bg-cyan-400
          transition-all
          duration-500
        "
style={{
  width: `${displayProgress}%`
}}
      />

    </div>

  </div>
)}
<button
  onClick={submitApplication}
  disabled={uploading}
  className="
    w-full
    p-4
    rounded-xl
    bg-cyan-500
    text-black
    font-black
    transition-all
    duration-300
    disabled:opacity-70
    disabled:cursor-not-allowed
  "
>
  {uploading ? progressText : 'Submit Application'}
</button>

</div>


        </div>

      </div>

    </main>
  )
}