'use client'

import { useState } from 'react'

export default function PaymentPage() {
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  async function handlePay() {
    if (!amount || !phone) {
      setMessage('Please enter amount and M-PESA number.')
      return
    }

    setMessage('Sending STK Push...')

    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error?.errorMessage ||
          data?.error ||
          'STK Push failed'
        )
      }

      setMessage('STK Push sent. Check your phone.')
      console.log('STK Push response:', data)
    } catch (error) {
      console.error(error)

      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong'
      )
    }
  }

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '60px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: 8 }}>
        Tunda Street
      </h1>

      <h2 style={{ marginBottom: 30 }}>
        Pay ABC Shop
      </h2>

      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="amount"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 'bold',
          }}
        >
          Amount
        </label>

        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="phone"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 'bold',
          }}
        >
          M-PESA Number
        </label>

        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07XXXXXXXX"
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handlePay}
        style={{
          width: '100%',
          padding: 14,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        PAY NOW
      </button>

      {message && (
        <p
          style={{
            marginTop: 20,
            padding: 12,
          }}
        >
          {message}
        </p>
      )}
    </main>
  )
}