"use client"

import { useEffect } from "react"

type Props = {
  params: {
    slug: string
  }
}

export default function SharePage({ params }: Props) {
  useEffect(() => {
    const destination = `/fund/${encodeURIComponent(params.slug)}`

    window.location.replace(destination)
  }, [params.slug])

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "28px",
            marginBottom: "12px",
          }}
        >
          ❤️
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Opening fundraiser...
        </div>
      </div>
    </main>
  )
}