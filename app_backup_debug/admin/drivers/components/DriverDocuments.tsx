'use client'
import Image from "next/image"
import type { Driver } from "../types"


interface DriverDocumentsProps {
  driver: Driver
}

export default function DriverDocuments({ driver }: DriverDocumentsProps) {
  // Document configuration matrix for clean rendering
  const documents = [
    {
      key: 'license_url',
      url: driver.license_url,
      label: 'Driving License',
      icon: '🪪',
    },
    {
      key: 'id_front_url',
      url: driver.id_front_url,
      label: 'ID Front Card',
      icon: '🆔',
    },
    {
      key: 'id_back_url',
      url: driver.id_back_url,
      label: 'ID Back Card',
      icon: '🆔',
    },
    {
      key: 'vehicle_photo_url',
      url: driver.vehicle_photo_url,
      label: 'Vehicle Verification',
      icon: '🏍️',
    },
  ]

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase mb-4 flex items-center gap-2">
        <span role="img" aria-label="folder">📂</span> Verification Dossier
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) =>
          doc.url ? (
            <a
              key={doc.key}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-zinc-950/40 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700/80 hover:bg-zinc-900/30 transition-all duration-200 outline-none focus:ring-2 focus:ring-zinc-700"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-zinc-800/60">
<Image
  src={doc.url}
  alt={doc.label}
  fill
  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
  sizes="(max-width:768px) 100vw, 25vw"
/>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                  <span className="text-xs bg-zinc-900/90 text-zinc-200 px-2.5 py-1 rounded-md border border-zinc-700/50 shadow-md font-medium">
                    Expand Image
                  </span>
                </div>
              </div>

              {/* Document Identity Meta */}
              <div className="p-3">
                <p className="font-semibold text-zinc-200 text-sm flex items-center gap-1.5">
                  <span className="text-base">{doc.icon}</span>
                  {doc.label}
                </p>
                <p className="text-[11px] text-zinc-500 font-medium mt-0.5 tracking-wide">
                  Click to inspect file
                </p>
              </div>
            </a>
          ) : (
            /* Standard Blank Fallback Template */
            <div
              key={doc.key}
              className="flex flex-col items-center justify-center text-center p-5 aspect-video sm:aspect-auto sm:h-full bg-zinc-950/20 border border-dashed border-zinc-800/60 rounded-xl text-zinc-600 transition-colors hover:border-zinc-800"
            >
              <span className="text-xl opacity-40 filter grayscale mb-2" role="img" aria-label="missing">
                {doc.icon}
              </span>
              <p className="text-xs font-semibold tracking-tight text-zinc-500">
                {doc.label}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">
                Missing asset upload
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
