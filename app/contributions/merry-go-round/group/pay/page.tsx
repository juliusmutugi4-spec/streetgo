"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"

type Group = {
  id: string
  group_number: string
  name: string
  member_limit: number
  contribution_amount: number
  frequency: string
  status: string
}

type Member = {
  id: string
  member_code: string
  member_number: number
  phone_number: string | null
  phone_verified: boolean
  display_name: string | null
}

type PaymentSummary = {
  required_amount: number
  round_paid: number
  my_credit: number
  amount_to_pay: number
  my_status: string
}

function ContributionPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get("groupId")

  const [group, setGroup] = useState<Group | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [summary, setSummary] = useState<PaymentSummary | null>(null)

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [phoneNumber, setPhoneNumber] = useState("")
  const [savingPhone, setSavingPhone] = useState(false)

  useEffect(() => {
    loadPaymentDetails()
  }, [groupId])

  async function loadPaymentDetails() {
    try {
      setLoading(true)
      setError("")

      if (!groupId) {
        throw new Error("Contribution group was not specified.")
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        router.push("/login")
        return
      }

      const { data: groupData, error: groupError } = await supabase
        .from("contribution_groups")
        .select(
          "id,group_number,name,member_limit,contribution_amount,frequency,status"
        )
        .eq("id", groupId)
        .single()

      if (groupError) throw groupError
      if (!groupData) {
        throw new Error("Contribution group was not found.")
      }

      const { data: memberData, error: memberError } = await supabase
        .from("contribution_members")
        .select(
          "id,member_code,member_number,phone_number,phone_verified,display_name"
        )
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (memberError) throw memberError

      if (!memberData) {
        throw new Error("You are not an active member.")
      }

      /*
       * Get the member's actual amount due.
       *
       * This takes available personal credit into account.
       */
      const {
        data: summaryData,
        error: summaryError,
      } = await supabase.rpc("get_merry_go_round_payment_summary", {
        p_group_id: groupId,
      })

      if (summaryError) throw summaryError

      const paymentSummary = Array.isArray(summaryData)
        ? summaryData[0]
        : summaryData

      if (!paymentSummary) {
        throw new Error("StreetGO could not calculate your contribution.")
      }

      setGroup(groupData)
      setMember(memberData)
      setPhoneNumber(memberData.phone_number || "")

      setSummary({
        required_amount: Number(paymentSummary.required_amount || 0),
        round_paid: Number(paymentSummary.round_paid || 0),
        my_credit: Number(paymentSummary.my_credit || 0),
        amount_to_pay: Number(paymentSummary.amount_to_pay || 0),
        my_status: paymentSummary.my_status || "due",
      })
    } catch (err: any) {
      console.error("CONTRIBUTION PAYMENT LOAD ERROR:", err)

      setError(
        err?.message || "Unable to load payment details."
      )
    } finally {
      setLoading(false)
    }
  }




async function waitForPaymentConfirmation(
  transactionId: string,
  accessToken: string,
  amount: number
) {
  const maxAttempts = 30
  const intervalMs = 2000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `/api/mpesa/stk/contribution/status?transactionId=${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      )

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success) {
        if (data.status === "paid") {
          setPaymentSuccess(true)
          setPaying(false)

          setSummary((current) =>
            current
              ? {
                  ...current,
                  amount_to_pay: 0,
                  my_status: "paid",
                }
              : current
          )

          setMessage(
            `Payment successful. KES ${amount.toLocaleString()} received.`
          )

          setTimeout(() => {
            router.push(
              `/contributions/merry-go-round/group?groupId=${groupId}`
            )
          }, 1200)

          return
        }

        if (
          data.status === "failed" ||
          data.status === "cancelled"
        ) {
          setPaying(false)
          setError(
            data.resultDesc ||
              "The M-PESA payment was not completed."
          )
          return
        }
      }
    } catch (error) {
      console.error(
        "PAYMENT STATUS CHECK ERROR:",
        error
      )
    }

    await new Promise((resolve) =>
      setTimeout(resolve, intervalMs)
    )
  }

  setPaying(false)
  setError(
    "We could not confirm the payment yet. Please check your M-PESA messages before trying again."
  )
}









  async function requestMpesaPayment() {
    try {
      setPaying(true)
      setError("")
      setMessage("")

      if (!groupId || !group || !member) {
        throw new Error("Contribution details are not loaded.")
      }

      /*
       * This RPC is now responsible for:
       *
       * 1. Applying the member's available credit.
       * 2. Calculating the remaining amount.
       * 3. Creating the pending STK transaction only
       *    when money is actually still required.
       */
      const {
        data: paymentData,
        error: paymentError,
      } = await supabase.rpc("create_merry_go_round_payment", {
        p_group_id: groupId,
      })

      if (paymentError) throw paymentError

      const payment = Array.isArray(paymentData)
        ? paymentData[0]
        : paymentData

      if (!payment) {
        throw new Error(
          "StreetGO did not return a payment instruction."
        )
      }

      const amountToPay = Number(payment.amount || 0)

      /*
       * Credit completely covered the contribution.
       */
      if (amountToPay <= 0) {
        setSummary((current) =>
          current
            ? {
                ...current,
                amount_to_pay: 0,
                my_status: "paid",
              }
            : current
        )

        setMessage(
          "Your StreetGO credit covered this contribution."
        )

        setPaying(false)

        setTimeout(() => {
          router.push(
            `/contributions/merry-go-round/group?groupId=${group.id}`
          )
        }, 1200)

        return
      }

      /*
       * Normalize Safaricom phone number.
       */
      let normalizedPhone = phoneNumber.replace(/\D/g, "")

      if (/^07\d{8}$/.test(normalizedPhone)) {
        normalizedPhone = `254${normalizedPhone.substring(1)}`
      }

      if (!/^2547\d{8}$/.test(normalizedPhone)) {
        throw new Error(
          "Enter a valid Safaricom number, for example 0712345678."
        )
      }

      /*
       * Save/update member phone if necessary.
       */
      if (
        !member.phone_number ||
        member.phone_number.replace(/\D/g, "") !== normalizedPhone
      ) {
        setSavingPhone(true)

        const { error: phoneError } = await supabase.rpc(
          "set_contribution_member_phone",
          {
            p_phone_number: normalizedPhone,
          }
        )

        setSavingPhone(false)

        if (phoneError) throw phoneError

        setMember((current) =>
          current
            ? {
                ...current,
                phone_number: normalizedPhone,
                phone_verified: false,
              }
            : current
        )
      }

      /*
       * Get authenticated session.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error(
          "Your StreetGO session has expired. Please log in again."
        )
      }

      setMessage(
        `Requesting M-PESA payment of KES ${amountToPay.toLocaleString()}...`
      )

      /*
       * IMPORTANT:
       *
       * Send the exact remaining amount returned by
       * create_merry_go_round_payment().
       *
       * Example:
       *
       * Contribution = 10
       * Credit = 2
       * STK amount = 8
       */
      const response = await fetch(
        "/api/mpesa/stk/contribution",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            groupId,
            phone: normalizedPhone,
            transactionId: payment.transaction_id,
            amount: amountToPay,
          }),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "StreetGO could not start the M-PESA payment."
        )
      }

setMessage(
  `M-PESA request sent for KES ${amountToPay.toLocaleString()}. Check your phone and enter your M-PESA PIN.`
)

await waitForPaymentConfirmation(
  payment.transaction_id,
  session.access_token,
  amountToPay
)

return

      /*
       * Refresh the displayed summary.
       */
      setSummary((current) =>
        current
          ? {
              ...current,
              amount_to_pay: amountToPay,
            }
          : current
      )
    } catch (err: any) {
      console.error(
        "CONTRIBUTION PAYMENT ERROR:",
        err
      )

      setError(
        err?.message ||
          "Unable to start the contribution payment."
      )

      setMessage("")
    } finally {
      setPaying(false)
      setSavingPhone(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

          <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-emerald-400">
            StreetGO
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Loading payment...
          </p>
        </div>
      </main>
    )
  }

  if (error && !group) {
    return (
      <main className="min-h-screen bg-[#020617] px-5 py-10 text-white">
        <div className="mx-auto max-w-md">
          <p className="text-xs font-black tracking-[.2em] text-red-400">
            PAYMENT ERROR
          </p>

          <h1 className="mt-3 text-2xl font-black">
            Unable to load payment
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-200/70">
            {error}
          </p>

          <button
            onClick={() =>
              router.push(
                "/contributions/merry-go-round/group"
              )
            }
            className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-4 font-black text-[#03130d]"
          >
            BACK TO GROUP
          </button>
        </div>
      </main>
    )
  }

  if (!group || !member || !summary) {
    return null
  }

  const requiredAmount = Number(
    summary.required_amount || group.contribution_amount
  )

  const amountToPay = Number(
    summary.amount_to_pay || 0
  )

  const isPaid =
    amountToPay <= 0 ||
    summary.my_status === "paid"

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">

      {/* M-PESA PROCESSING OVERLAY */}
      {(paying || paymentSuccess) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md">
          <div className="flex w-full max-w-xs flex-col items-center text-center">

<div className="relative flex h-16 w-16 items-center justify-center">
{paymentSuccess ? (
  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
    <div className="absolute inset-0 animate-ping rounded-full border border-emerald-400/20" />

    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10">
      <CheckCircle2
        size={38}
        strokeWidth={2.5}
        className="text-emerald-400"
      />
    </div>
  </div>
) : (
    <>
      <div className="absolute inset-0 rounded-full border border-slate-800" />

      <Loader2
        size={34}
        strokeWidth={2}
        className="animate-spin text-emerald-400"
      />

      <span className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </>
  )}
</div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              M-PESA
            </p>

<h2 className="mt-2 text-base font-bold text-white">
  {paymentSuccess
    ? "✓ 🎉 Payment Successful"
    : "Processing Payment"}
</h2>

<p className="mt-2 max-w-[230px] text-[11px] leading-5 text-slate-500">
  {paymentSuccess
    ? "Your contribution has been received. Returning to your group..."
    : "Check your phone for the M-PESA STK prompt and enter your PIN."}
</p>

            <p className="mt-5 text-xl font-bold text-emerald-400">
              KES {amountToPay.toLocaleString()}
            </p>

            <div className="mt-6 flex items-center gap-2 text-[9px] uppercase tracking-wider text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure StreetGO Payment
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md space-y-6">

        {/* BACK */}
        <button
          onClick={() =>
            router.push(
              `/contributions/merry-go-round/group?groupId=${group.id}`
            )
          }
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Group
        </button>

        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-base font-bold text-white">
            Make Contribution
          </h1>

          <p className="text-xs text-slate-500">
            Settle your rotation safely via M-PESA.
          </p>
        </div>

        {/* INFO */}
        <div className="space-y-2.5 border-y border-slate-900 py-4 text-xs">

          <div className="flex justify-between">
            <span className="text-slate-500">
              Group
            </span>

            <span className="font-semibold text-slate-200">
              {group.name}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Member
            </span>

            <span className="font-semibold text-slate-200">
              #{member.member_number}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Required Contribution
            </span>

            <span className="font-semibold text-slate-200">
              KES {requiredAmount.toLocaleString()}
            </span>
          </div>

          {/* CREDIT */}
          {summary.my_credit > 0 && (
            <div className="flex justify-between border-t border-slate-900/60 pt-2">
              <span className="text-slate-500">
                Available Credit
              </span>

              <span className="font-semibold text-cyan-400">
                KES {summary.my_credit.toLocaleString()}
              </span>
            </div>
          )}

          {/* AMOUNT DUE */}
          <div className="flex items-center justify-between border-t border-slate-900/60 pt-2">

            <span className="font-medium text-slate-400">
              {isPaid ? "Status" : "Amount to Pay"}
            </span>

            {isPaid ? (
              <span className="flex items-center gap-1.5 text-lg font-bold text-emerald-400">
                <CheckCircle2 size={20} />
                PAID
              </span>
            ) : (
              <span className="text-lg font-bold text-emerald-400">
                KES {amountToPay.toLocaleString()}
              </span>
            )}

          </div>
        </div>

        {/* PHONE */}
        {!isPaid && (
          <div className="space-y-1.5">

            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Safaricom Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
              placeholder="0712345678"
              maxLength={13}
              disabled={paying}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/40 disabled:opacity-50"
            />

          </div>
        )}

        {/* STATUS */}
        {message && (
          <p className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2.5 text-[11px] font-medium text-emerald-400">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/10 bg-red-500/5 p-2.5 text-[11px] font-medium text-red-400">
            {error}
          </p>
        )}

        {/* ACTION */}
        {!isPaid ? (
          <button
            type="button"
            disabled={paying}
            onClick={requestMpesaPayment}
            className="w-full rounded-xl bg-emerald-400 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-600"
          >
            {savingPhone
              ? "Saving Number..."
              : paying
                ? "Processing M-PESA..."
                : `Pay KES ${amountToPay.toLocaleString()}`}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 py-4 text-sm font-bold text-emerald-400">
            <CheckCircle2 size={20} />
            Contribution Paid
          </div>
        )}

        <p className="mx-auto max-w-xs text-center text-[10px] leading-normal text-slate-600">
          StreetGO will never ask for your PIN. Only complete prompt
          popups you trigger yourself.
        </p>

      </div>
    </main>
  )
}

export default function ContributionPayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
          <div className="text-center">

            <Loader2
              size={32}
              className="mx-auto animate-spin text-emerald-400"
            />

            <p className="mt-4 text-xs font-black tracking-[0.2em] text-emerald-400">
              STREETGO
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Loading payment...
            </p>

          </div>
        </main>
      }
    >
      <ContributionPayContent />
    </Suspense>
  )
}