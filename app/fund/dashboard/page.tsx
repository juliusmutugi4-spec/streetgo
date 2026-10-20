import { Suspense } from "react"
import DashboardContent from "./DashboardContent"

export default function FundraiserDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm text-white/60">
              Loading fundraiser...
            </p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
