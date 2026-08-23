"use client"

import { useRouter } from "next/navigation"

import SetupHeader from "./components/SetupHeader"
import SetupIntro from "./components/SetupIntro"
import SetupModeGrid from "./components/SetupModeGrid"
import SetupFooter from "./components/SetupFooter"

type SetupMode = "dating" | "business" | "job"

export default function SetupChoicePage() {
  const router = useRouter()

  function chooseMode(mode: SetupMode) {
    router.push(`/dating/setup/${mode}`)
  }

  function skip() {
    router.push("/dating")
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div
        className="
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-5xl
          flex-col
          px-5
          py-10
          sm:px-8
        "
      >
       <SetupHeader
  onBack={() => router.back()}
  onSkip={() => {
    router.push("/dating")
  }}
/>

        <SetupIntro />

        <SetupModeGrid onChoose={chooseMode} />

        <SetupFooter onSkip={skip} />
      </div>
    </main>
  )
}