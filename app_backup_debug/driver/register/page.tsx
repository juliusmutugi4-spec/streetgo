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
  <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
    
    {/* =====================================================
        CRITICAL CORE TELEMETRY UPLOAD OVERLAY
    ====================================================== */}
    {uploading && (
      <div className="fixed inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200">
        <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/60 p-8 rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative overflow-hidden">
          
          {/* Laser Scanning Indicator Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse" />

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute h-full w-full rounded-full border-2 border-zinc-800 border-t-cyan-400 animate-spin" />
                <span className="text-sm font-black text-cyan-400 animate-pulse">▲</span>
              </div>
            </div>

            <h2 className="text-lg font-black uppercase tracking-widest text-zinc-100">
              Uploading Matrix
            </h2>
            <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1.5">
              Maintain Connection — Do Not Terminate
            </p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
              <span className="truncate max-w-[80%] text-zinc-500">{progressText}</span>
              <span className="text-cyan-400">{progress}%</span>
            </div>
            
            <div className="h-1 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out shadow-[0_0_8px_#06b6d4]"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* =====================================================
        CENTRAL INTERFACE CONTENT
    ====================================================== */}
    <div className="max-w-2xl mx-auto">
      
      {/* HEADER SECTION PANEL */}
      <div className="mb-10 relative">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-gradient-to-b from-cyan-400 to-blue-500" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-100">
          Operator Registry
        </h1>
        <p className="text-xs text-zinc-400 tracking-wide font-medium mt-1 uppercase">
          Initialize verification logs to authenticate driver status
        </p>
      </div>

      {/* CORE PROFILE MATRIX CARD */}
      <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-5 sm:p-6 backdrop-blur-md mb-6 shadow-inner">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
          <span className="text-cyan-400 text-xs">📋</span> Personal Telemetry Logs
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,246,0.05)] transition-all"
            />
          </div>

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />

          <input
            type="text"
            placeholder="National ID Number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* HARDWARE MATRIX SPECIFICATION CARD */}
      <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-5 sm:p-6 backdrop-blur-md mb-6 shadow-inner">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
          <span className="text-emerald-400 text-xs">⚙️</span> Transport Hardware Specs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="boda">🏍️ Bodaboda Fleet</option>
              <option value="taxi">🚗 Taxi Grid</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 text-[10px]">▼</div>
          </div>

          <input
            type="text"
            placeholder="Plate Number"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />

          <input
            type="text"
            placeholder="Vehicle Model"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />

          <input
            type="text"
            placeholder="Vehicle Color"
            value={vehicleColor}
            onChange={(e) => setVehicleColor(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* CORE IDENTITY MATRIX UPLOAD CARD */}
      <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-5 sm:p-6 backdrop-blur-md mb-8 shadow-inner">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
          <span className="text-amber-400 text-xs">🪪</span> Document Authentication Nodes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Item File Module Array */}
          {[
            { label: 'Driving License Matrix', state: licensePhoto, setter: setLicensePhoto },
            { label: 'ID Front Facade', state: idFront, setter: setIdFront },
            { label: 'ID Back Facade', state: idBack, setter: setIdBack },
            { label: 'Vehicle Configuration Photo', state: vehiclePhoto, setter: setVehiclePhoto }
          ].map((item, index) => (
            <div key={index} className="group relative bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between transition-all duration-200 hover:border-zinc-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors mb-2">
                {item.label}
              </span>
              
              <label className="relative flex items-center justify-between w-full cursor-pointer overflow-hidden text-[11px] font-mono font-bold tracking-wide rounded border border-dashed py-2 px-3 border-zinc-800 bg-zinc-900/20 text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 transition-all">
                <span className="truncate max-w-[80%]">
                  {item.state ? `✓ ${item.state.name}` : 'CHOOSE FILE'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => item.setter(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          ))}

        </div>
      </div>

      {/* SUBMISSION ACTIVATION LAYER */}
      <div className="space-y-4">
        <button
          onClick={submitApplication}
          disabled={uploading}
          className="relative overflow-hidden w-full py-4 rounded-xl bg-gradient-to-b from-cyan-400 to-cyan-500 text-zinc-950 font-black uppercase text-xs tracking-widest shadow-[0_4px_20px_rgba(34,211,246,0.25)] transition-all duration-300 hover:from-cyan-300 hover:to-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,246,0.45)] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">{uploading ? 'Transmitting Module...' : 'Commit Registry Application'}</span>
        </button>
      </div>

    </div>
  </main>
)

}