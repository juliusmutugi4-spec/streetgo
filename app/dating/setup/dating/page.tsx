"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { supabase } from "../../../lib/supabase"

import DatingProgress from "./DatingProgress"
import DatingStepAbout from "./DatingStepAbout"
import DatingStepInterests from "./DatingStepInterests"
import DatingStepPersonality from "./DatingStepPersonality"
import DatingStepGoals from "./DatingStepGoals"
import DatingNavigation from "./DatingNavigation"

const TOTAL_STEPS = 4

export default function DatingSetupPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ABOUT
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [location, setLocation] = useState("")
  const [headline, setHeadline] = useState("")

  // INTERESTS
  const [interests, setInterests] = useState<string[]>([])

  // PERSONALITY
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([])
  const [personality, setPersonality] = useState("")

  // GOALS
  const [lookingFor, setLookingFor] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(`
            age,
            gender,
            location,
            headline,
            personality,
            looking_for,
            interests,
            profile_mode
          `)
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Dating profile load error:", error)
          return
        }

        if (!mounted || !data) return

        setAge(data.age?.toString() || "")
        setGender(data.gender || "")
        setLocation(data.location || "")
        setHeadline(data.headline || "")
        setPersonality(data.personality || "")
        setLookingFor(data.looking_for || "")

        setInterests(
          Array.isArray(data.interests) ? data.interests : []
        )

        const personalityValue = data.personality || ""

        const knownTraits = [
          "Calm",
          "Ambitious",
          "Funny",
          "Caring",
          "Adventurous",
          "Creative",
          "Outgoing",
          "Family-oriented",
        ]

        const recoveredTraits = knownTraits.filter((trait) =>
          personalityValue
            .split(",")
            .map((value: string) => value.trim())
            .includes(trait)
        )

        setPersonalityTraits(recoveredTraits)
      } catch (error) {
        console.error("Dating setup load error:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [router])

  function canContinue() {
    if (step === 1) {
      const numericAge = Number(age)

      return (
        numericAge >= 18 &&
        numericAge <= 100 &&
        gender.trim().length > 0
      )
    }

    if (step === 2) {
      return interests.length >= 1
    }

    if (step === 3) {
      return (
        personalityTraits.length >= 1 ||
        personality.trim().length >= 10
      )
    }

    if (step === 4) {
      return lookingFor.length > 0
    }

    return false
  }

  async function saveProfile() {
    if (saving) return

    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const personalityValue = [
        ...personalityTraits,
        personality.trim(),
      ]
        .filter(Boolean)
        .join(", ")

      const { error } = await supabase
        .from("profiles")
        .update({
          profile_mode: "dating",
          dating_active: true,
          age: age ? Number(age) : null,
          gender: gender || null,
          location: location.trim() || null,
          headline: headline.trim() || null,
          interests,
          personality: personalityValue || null,
          looking_for: lookingFor || null,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Dating profile save error:", error)
        alert(error.message)
        return
      }

      router.push("/dating")
    } catch (error) {
      console.error("Dating profile save error:", error)

      alert(
        "Something went wrong while creating your dating profile."
      )
    } finally {
      setSaving(false)
    }
  }

  function nextStep() {
    if (!canContinue()) return

    if (step < TOTAL_STEPS) {
      setStep((current) => current + 1)

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      return
    }

    saveProfile()
  }

  function previousStep() {
    if (saving) return

    if (step > 1) {
      setStep((current) => current - 1)

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      return
    }

    router.push("/dating/setup")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-xl px-5 py-8 sm:px-8">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />

          <div className="mt-8 h-9 w-64 animate-pulse rounded-lg bg-white/10" />

          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/5" />

          <div className="mt-10 space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div
        className="
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-xl
          flex-col
          px-5
          pb-32
          pt-5
          sm:px-8
        "
      >
        <DatingProgress
          step={step}
          totalSteps={TOTAL_STEPS}
          onBack={previousStep}
        />

        <div className="mt-9">
          {step === 1 && (
            <DatingStepAbout
              headline={headline}
              age={age}
              gender={gender}
              location={location}
              setHeadline={setHeadline}
              setAge={setAge}
              setGender={setGender}
              setLocation={setLocation}
            />
          )}

          {step === 2 && (
            <DatingStepInterests
              interests={interests}
              setInterests={setInterests}
            />
          )}

          {step === 3 && (
            <DatingStepPersonality
              personalityTraits={personalityTraits}
              setPersonalityTraits={setPersonalityTraits}
              personality={personality}
              setPersonality={setPersonality}
            />
          )}

          {step === 4 && (
            <DatingStepGoals
              lookingFor={lookingFor}
              setLookingFor={setLookingFor}
            />
          )}
        </div>

        <DatingNavigation
          step={step}
          totalSteps={TOTAL_STEPS}
          canContinue={canContinue()}
          saving={saving}
          onBack={previousStep}
          onNext={nextStep}
        />
      </div>
    </main>
  )
}