'use client'

import { Suspense } from "react"
import LoginModal from "../components/LoginModal"
import { useRouter, useSearchParams } from "next/navigation"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const requestedNext = searchParams.get("next")
  const nextPath =
    requestedNext === "/cyber/dashboard" ? requestedNext : "/"

  return (
    <LoginModal
      onClose={() => router.push("/")}
      onLogin={() => router.push(nextPath)}
    />
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080d18]" />}>
      <LoginContent />
    </Suspense>
  )
}
