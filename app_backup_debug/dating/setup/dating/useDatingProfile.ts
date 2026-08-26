"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

interface UseDatingProfileProps {
  setAge: React.Dispatch<React.SetStateAction<string>>
  setGender: React.Dispatch<React.SetStateAction<string>>
  setLocation: React.Dispatch<React.SetStateAction<string>>
  setHeadline: React.Dispatch<React.SetStateAction<string>>
  setPersonality: React.Dispatch<React.SetStateAction<string>>
  setLookingFor: React.Dispatch<React.SetStateAction<string>>
  setInterests: React.Dispatch<React.SetStateAction<string[]>>
  setPersonalityTraits: React.Dispatch<
    React.SetStateAction<string[]>
  >
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export function useDatingProfile({
  setAge,
  setGender,
  setLocation,
  setHeadline,
  setPersonality,
  setLookingFor,
  setInterests,
  setPersonalityTraits,
  setLoading,
}: UseDatingProfileProps) {
  const router = useRouter()

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
          .select(
            `
              age,
              gender,
              location,
              headline,
              personality,
              looking_for,
              interests,
              profile_mode
            `
          )
          .eq("id", user.id)
          .single()

        if (error) {
          console.error(
            "Dating profile load error:",
            error
          )
          return
        }

        if (!mounted || !data) return

        setAge(
          data.age?.toString() || ""
        )

        setGender(
          data.gender || ""
        )

        setLocation(
          data.location || ""
        )

        setHeadline(
          data.headline || ""
        )

        setPersonality(
          data.personality || ""
        )

        setLookingFor(
          data.looking_for || ""
        )

        setInterests(
          Array.isArray(data.interests)
            ? data.interests
            : []
        )

        /*
         * Recover saved personality traits.
         */
        const personalityValue =
          data.personality || ""

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

        const recoveredTraits =
          knownTraits.filter((trait) =>
            personalityValue
              .split(",")
              .map(
                (value: string) =>
                  value.trim()
              )
              .includes(trait)
          )

        setPersonalityTraits(
          recoveredTraits
        )
      } catch (error) {
        console.error(
          "Dating setup load error:",
          error
        )
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
  }, [
    router,
    setAge,
    setGender,
    setLocation,
    setHeadline,
    setPersonality,
    setLookingFor,
    setInterests,
    setPersonalityTraits,
    setLoading,
  ])
}