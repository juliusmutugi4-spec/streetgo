'use client'

import { useEffect, useState } from 'react'

interface Package {
  id: string
  package_name: string
  duration_minutes: number
  price_kes: number
  is_active: boolean
}

interface Session {
  id: string
  status: string
  starts_at: string
  expires_at: string
}

export default function CyberCustomerPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState('')
  const [phone, setPhone] = useState('')
  const [computerName, setComputerName] = useState('')
  const [token, setToken] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPackages() {
      try {
        const kioskToken = new URLSearchParams(
          window.location.search
        ).get('token')

        if (!kioskToken) {
          throw new Error('Computer access token is missing. Please scan the QR code again.')
        }

        setToken(kioskToken)

        const response = await fetch(
          `/api/cyber/customer/kiosk-packages?token=${encodeURIComponent(kioskToken)}`,
          { cache: 'no-store' }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load packages.')
        }

        setPackages(data.packages || [])
        setComputerName(data.computer?.name || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load packages.')
      } finally {
        setLoading(false)
      }
    }

    loadPackages()
  }, [])

  useEffect(() => {
    if (!paymentId || !token || paymentStatus === 'paid' || paymentStatus === 'failed') {
      return
    }

    let active = true

    async function checkPayment() {
      try {
        const response = await fetch('/api/cyber/payments/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            token,
            payment_id: paymentId,
          }),
        })

        const data = await response.json()

        if (!active) return

        if (!response.ok) {
          setPaymentMessage(data.error || 'Unable to check payment.')
          return
        }

        setPaymentStatus(data.payment.status)

        if (data.payment.status === 'paid') {
          setPaymentMessage('Payment confirmed! Your computer session is ready.')
          setSession(data.session)
        } else if (data.payment.status === 'failed') {
          setPaymentMessage(data.payment.message || 'Payment was not completed.')
        } else {
          setPaymentMessage('Waiting for M-Pesa confirmation. Please complete the prompt on your phone.')
        }
      } catch {
        if (active) {
          setPaymentMessage('Checking payment confirmation...')
        }
      }
    }

    checkPayment()

    const interval = window.setInterval(checkPayment, 3000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [paymentId, token, paymentStatus])

  const selected = packages.find((item) => item.id === selectedPackage)
  const validPhone = /^(?:254|0)7\d{8}$/.test(phone.replace(/\s/g, ''))

  async function payWithMpesa() {
    if (!token || !selectedPackage || !validPhone) return

    setPaying(true)
    setError('')
    setPaymentMessage('Sending M-Pesa payment request...')

    try {
      const response = await fetch('/api/cyber/payments/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          package_id: selectedPackage,
          phone: phone.replace(/\s/g, ''),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to initiate M-Pesa payment.')
      }

      setPaymentId(data.payment_id)
      setPaymentStatus('pending')
      setPaymentMessage('M-Pesa prompt sent. Enter your PIN on your phone.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment request failed.')
      setPaymentMessage('')
    } finally {
      setPaying(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-8 text-white">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-bold tracking-[0.25em] text-emerald-400">
            STREETGO CYBER
          </p>
          <h1 className="mt-5 text-3xl font-bold">Welcome!</h1>
          <p className="mt-2 text-gray-400">
            Select your computer time and pay with M-Pesa.
          </p>

          {computerName && (
            <p className="mt-3 text-sm text-emerald-400">
              Computer: {computerName}
            </p>
          )}
        </header>

        <section className="rounded-2xl border border-gray-800 bg-[#101a2b] p-5">
          <h2 className="text-lg font-semibold">Choose your package</h2>

          {loading ? (
            <p className="mt-5 text-gray-400">Loading packages...</p>
          ) : error && packages.length === 0 ? (
            <p className="mt-5 text-sm text-red-400">{error}</p>
          ) : packages.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-gray-700 p-6 text-center text-gray-400">
              No packages are available for this computer yet.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {packages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={Boolean(paymentId)}
                  onClick={() => setSelectedPackage(item.id)}
                  className={`rounded-xl border p-4 text-left ${
                    selectedPackage === item.id
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  <span className="block font-semibold">{item.package_name}</span>
                  <span className="mt-1 block text-sm text-gray-400">
                    {item.duration_minutes} minutes
                  </span>
                  <span className="mt-3 block text-xl font-bold text-emerald-400">
                    KES {Number(item.price_kes).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-7">
            <label className="mb-2 block text-sm font-medium">
              M-Pesa phone number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              disabled={Boolean(paymentId)}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="07XXXXXXXX"
              maxLength={12}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-4 text-lg text-white outline-none focus:border-emerald-400"
            />

            {phone && !validPhone && (
              <p className="mt-2 text-xs text-red-400">
                Enter a valid Kenyan M-Pesa number.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-gray-900 p-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Selected package</span>
              <span>{selected?.package_name || 'None selected'}</span>
            </div>

            <div className="mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-emerald-400">
                {selected
                  ? `KES ${Number(selected.price_kes).toFixed(2)}`
                  : 'KES 0.00'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={payWithMpesa}
            disabled={
              loading ||
              paying ||
              !token ||
              !selectedPackage ||
              !validPhone ||
              Boolean(paymentId)
            }
            className="mt-5 w-full rounded-xl bg-emerald-600 py-4 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {paying ? 'SENDING REQUEST...' : 'PAY WITH M-PESA'}
          </button>

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}

          {paymentMessage && (
            <div className="mt-5 rounded-xl border border-gray-700 bg-gray-900 p-4 text-center">
              <p className="text-sm text-gray-300">{paymentMessage}</p>

              {paymentStatus === 'pending' && (
                <p className="mt-2 text-xs text-amber-400">
                  Waiting for payment confirmation...
                </p>
              )}

              {paymentStatus === 'paid' && session && (
                <div className="mt-3 text-sm text-emerald-400">
                  <p>Session confirmed.</p>
                  <p className="mt-1">
                    Expires: {new Date(session.expires_at).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <p className="mt-2 text-xs text-red-400">
                  Payment unsuccessful. Please contact the cyber attendant.
                </p>
              )}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            Your computer unlocks only after payment is verified.
          </p>
        </section>

        <p className="mt-8 text-center text-xs text-gray-600">
          Powered by StreetGO
        </p>
      </div>
    </main>
  )
}
