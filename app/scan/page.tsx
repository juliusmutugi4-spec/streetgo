'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    async function startScanner() {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            scanner.stop().then(() => {
              window.location.href = decodedText
            })
          },
          () => {
            // QR not detected yet
          }
        )
      } catch (err) {
        console.error('Camera error:', err)
        setError(
          'Unable to access the camera. Please allow camera permission.'
        )
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
      }
    }
  }, [])

  return (
    <main
      style={{
        maxWidth: 500,
        margin: '40px auto',
        padding: 20,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Tunda Street</h1>

      <h2>Scan to Pay</h2>

      <p>
        Point your camera at the seller&apos;s QR code.
      </p>

      <div
        id="qr-reader"
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '25px auto',
        }}
      />

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}
    </main>
  )
}