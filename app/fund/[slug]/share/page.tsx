"use client"

import { use, useEffect } from "react"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default function SharePage({ params }: Props) {
  const { slug } = use(params)

  useEffect(() => {
    if (!slug) return

    window.location.replace(`/fund/${encodeURIComponent(slug)}`)
  }, [slug])

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
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>
          ❤️
        </div>

        <div style={{ fontSize: "18px", fontWeight: 600 }}>
          Opening fundraiser...
        </div>
      </div>
    </main>
  )
}