import Link from "next/link"
import {
  Monitor,
  ShieldCheck,
  CreditCard,
  ChartNoAxesCombined,
  ArrowRight,
  Building2,
  Clock3,
} from "lucide-react"

export default function CyberLandingPage() {
  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/cyber" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black">
              <Monitor size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold">StreetGO Cyber</h1>
              <p className="text-xs text-slate-400">Cyber Café Management</p>
            </div>
          </Link>

          <Link
            href="/login?next=/cyber/dashboard"
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
          >
            Owner Login
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <ShieldCheck size={16} />
            Simple cyber café management
          </div>

          <h2 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Your cyber café.
            <span className="block text-emerald-400">
              Under your control.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Manage your computers, customer sessions, payments and daily
            business operations from one simple dashboard.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/cyber/register"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-500 px-7 py-4 font-bold text-black transition hover:bg-emerald-400"
            >
              Register Your Cyber
              <ArrowRight size={19} />
            </Link>

            <Link
              href="/login?next=/cyber/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-4 font-semibold transition hover:bg-white/10"
            >
              Existing Owner? Sign In
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Start from your cyber café computer. No technical expertise required.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#101a2b] p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Your business</p>
              <h3 className="mt-1 text-xl font-bold">Cyber Control Centre</h3>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Monitor size={25} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Computers", value: "Manage PCs", icon: Monitor },
              { label: "Payments", value: "Track revenue", icon: CreditCard },
              { label: "Sessions", value: "Control time", icon: Clock3 },
              { label: "Reports", value: "View business", icon: ChartNoAxesCombined },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-[#172338] p-5"
                >
                  <Icon className="mb-5 text-emerald-400" size={25} />
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.value}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-3">
              <Building2 className="text-emerald-400" size={22} />
              <div>
                <p className="font-semibold">One control panel</p>
                <p className="mt-1 text-sm text-slate-400">
                  Manage your cyber café from one computer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b1321]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <Monitor className="mb-3 text-emerald-400" size={25} />
            <h3 className="font-bold">Computer Management</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Connect and monitor your cyber café computers.
            </p>
          </div>
          <div>
            <CreditCard className="mb-3 text-emerald-400" size={25} />
            <h3 className="font-bold">Customer Payments</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage customer packages and M-Pesa payments.
            </p>
          </div>
          <div>
            <ChartNoAxesCombined className="mb-3 text-emerald-400" size={25} />
            <h3 className="font-bold">Business Reports</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Follow computer usage and business performance.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-7 text-center text-sm text-slate-500">
        StreetGO Cyber · Powered by StreetGO
      </footer>
    </main>
  )
}
