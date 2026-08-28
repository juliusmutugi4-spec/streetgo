'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QRPage() {
  const [qr, setQr] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')

  useEffect(() => {
    const url = 'https://streetgo.app/pay/TEST_SELLER'

    setPaymentUrl(url)

    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
    })
      .then((qrUrl: string) => {
        setQr(qrUrl)
      })
      .catch((error: Error) => {
        console.error('QR generation failed:', error)
      })
  }, [])

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '60px auto',
        padding: 24,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: 8 }}>
        Tunda Street
      </h1>

      <h2 style={{ marginBottom: 10 }}>
        ABC Shop
      </h2>

      <p style={{ marginBottom: 25 }}>
        Scan to pay this seller
      </p>

      {qr ? (
        <img
          src={qr}
          alt="Tunda Street payment QR code"
          width={280}
          height={280}
        />
      ) : (
        <p>Generating QR code...</p>
      )}

      {paymentUrl && (
        <p
          style={{
            marginTop: 20,
            wordBreak: 'break-all',
            fontSize: 14,
          }}
        >
          {paymentUrl}
        </p>
      )}
    </main>
  )
}