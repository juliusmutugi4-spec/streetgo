'use client'

import LoginModal from "../components/LoginModal"
import { useRouter } from "next/navigation"

export default function LoginPage(){

  const router = useRouter()

  return (
    <LoginModal
      onClose={() => router.push("/")}
      onLogin={() => router.push("/")}
    />
  )

}