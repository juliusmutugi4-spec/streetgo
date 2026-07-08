import { useState } from "react"
import { supabase } from "../lib/supabase"

export type PredictionType = {
  id: string
  title: string
  description: string
  username?: string
  avatar_url?: string
  created_at: string
}

let cachedPredictions: PredictionType[] = []
let predictionsLoaded = false

export function usePredictions(user: any) {
  const [predictions, setPredictions] = useState<PredictionType[]>([])
  const [voteCounts, setVoteCounts] = useState<any>({})

  const fetchPredictions = async () => {
    if (predictionsLoaded) {
      setPredictions(cachedPredictions)
      return
    }

    const { data, error } = await supabase
      .from("predictions")
      .select("*")

if (error) {
  console.log("Prediction Error:", error)
  console.log("Message:", error.message)
  console.log("Details:", error.details)
  console.log("Hint:", error.hint)
  console.log("Code:", error.code)
  return
}

    cachedPredictions = data || []
    predictionsLoaded = true
    setPredictions(cachedPredictions)
  }

  const fetchVoteCounts = async () => {
    const { data } = await supabase
      .from("prediction_votes")
      .select("*")

    const counts: any = {}

    data?.forEach((vote: any) => {
      if (!counts[vote.prediction_id]) {
        counts[vote.prediction_id] = {
          agree: 0,
          disagree: 0,
        }
      }

      counts[vote.prediction_id][vote.vote]++
    })

    setVoteCounts(counts)
  }

  const votePrediction = async (
    predictionId: string,
    vote: "agree" | "disagree"
  ) => {
    if (!user) {
      alert("Login first")
      return
    }

    const { error } = await supabase
      .from("prediction_votes")
      .upsert(
        {
          prediction_id: predictionId,
          user_id: user.id,
          vote,
        },
        {
          onConflict: "prediction_id,user_id",
        }
      )

    if (error) {
      alert(error.message)
      return
    }

    await fetchVoteCounts()
  }

  return {
    predictions,
    setPredictions,
    voteCounts,
    setVoteCounts,
    fetchPredictions,
    fetchVoteCounts,
    votePrediction,
  }
}