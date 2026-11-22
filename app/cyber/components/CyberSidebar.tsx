
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  Building2,
  Users,
  Wallet,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Activity,
} from "lucide-react";

const navigation = [
  {
    title: "MAIN MENU",
    items: [
      {
        name: "Dashboard",
        description: "Business overview",
        href: "/cyber/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Computers",
        description: "Manage your devices",
        href: "/cyber/computers",
        icon: Monitor,
      },
      {
        name: "Branches",
        description: "Manage locations",
        href: "/cyber/branches",
        icon: Building2,
      },
      {
        name: "Customers",
        description: "Customer management",
        href: "/cyber/customer",
        icon: Users,
      },
      {
        name: "Pricing & Services",
        description: "Rates and packages",
        href: "/cyber/pricing",
        icon: Wallet,
      },
    ],
  },
];

export default function CyberSidebar() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-screen w-[320px] min-w-[320px] shrink-0 flex-col border-r border-slate-800 bg-[#0b1220] text-white">

      {/* ================================================= */}
      {/* BRAND HEADER                                       */}
      {/* ================================================= */}

      <div className="flex h-[112px] shrink-0 items-center gap-4 border-b border-slate-800 px-7">

        <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-600/25">
          <ShieldCheck size={32} strokeWidth={2.3} />
        </div>

        <div className="min-w-0">
          <h1 className="text-[22px] font-black tracking-wide text-white">
            STREETGO
          </h1>

          <p className="mt-1 text-[12px] font-bold tracking-[2.8px] text-blue-400">
            CYBER SYSTEM
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Business management
          </p>
        </div>

      </div>

      {/* ================================================= */}
      {/* NAVIGATION                                         */}
      {/* ================================================= */}

      <div className="flex-1 overflow-y-auto px-5 py-8">

        {navigation.map((section) => (
          <div key={section.title} className="mb-10">

            {/* Section title */}
            <div className="mb-5 flex items-center justify-between px-3">
              <p className="text-[12px] font-extrabold tracking-[2px] text-slate-500">
                {section.title}
              </p>

              <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Navigation links */}
            <nav className="space-y-2.5">

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-[76px] items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-200 ${
                      active
                        ? "border-blue-500/30 bg-blue-600/15 shadow-lg shadow-blue-950/20"
                        : "border-transparent hover:border-slate-700 hover:bg-slate-800/60"
                    }`}
                  >

                    {/* Active indicator */}
{active && (
  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-500" />
)}

                    {/* Icon */}
                    <div
                      className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-blue-400"
                      }`}
                    >
                      <Icon size={25} strokeWidth={2.2} />
                    </div>

                    {/* Label */}
                    <div className="min-w-0 flex-1">

                      <p
                        className={`text-[16px] font-bold ${
                          active
                            ? "text-white"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {item.name}
                      </p>

                      <p className="mt-1 text-[12px] text-slate-500">
                        {item.description}
                      </p>

                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={19}
                      className={`shrink-0 transition-all ${
                        active
                          ? "translate-x-0 text-blue-400 opacity-100"
                          : "-translate-x-1 text-slate-600 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />

                  </Link>
                );
              })}

            </nav>
          </div>
        ))}

        {/* ================================================= */}
        {/* MANAGEMENT                                         */}
        {/* ================================================= */}

        <div className="mb-8">

          <div className="mb-5 px-3">
            <p className="text-[12px] font-extrabold tracking-[2px] text-slate-500">
              MANAGEMENT
            </p>
          </div>

          <div className="space-y-2.5">

            {/* Settings */}
            <button
              type="button"
              disabled
              className="flex min-h-[68px] w-full cursor-not-allowed items-center gap-4 rounded-2xl border border-transparent px-4 text-left opacity-60"
            >
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                <Settings size={24} />
              </div>

              <div className="flex-1">
                <p className="text-[15px] font-bold text-slate-400">
                  Settings
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Account preferences
                </p>
              </div>

              <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-500">
                SOON
              </span>
            </button>

            {/* Help */}
            <button
              type="button"
              disabled
              className="flex min-h-[68px] w-full cursor-not-allowed items-center gap-4 rounded-2xl border border-transparent px-4 text-left opacity-60"
            >
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                <HelpCircle size={24} />
              </div>

              <div className="flex-1">
                <p className="text-[15px] font-bold text-slate-400">
                  Help & Support
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Get assistance
                </p>
              </div>

              <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-500">
                SOON
              </span>
            </button>

          </div>
        </div>

      </div>

      {/* ================================================= */}
      {/* SYSTEM STATUS FOOTER                                */}
      {/* ================================================= */}

      <div className="shrink-0 border-t border-slate-800 p-5">

        <div className="rounded-2xl border border-slate-700/70 bg-slate-800/40 p-4">

          {/* System identity */}
          <div className="flex items-center gap-4">

            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>

            <div className="min-w-0">
              <p className="text-[14px] font-bold text-white">
                StreetGO Cyber
              </p>

              <p className="mt-1 text-[12px] text-slate-400">
                Management System
              </p>
            </div>

          </div>

          {/* Operational status */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.05] px-3 py-3">

            <div className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </div>

            <div className="flex-1">
              <p className="text-[12px] font-bold text-emerald-400">
                System operational
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Management services active
              </p>
            </div>

            <Activity size={18} className="text-emerald-500/60" />

          </div>

        </div>

        {/* Version */}
        <div className="mt-4 flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-600">
            STREETGO CYBER
          </span>

          <span className="text-[11px] font-medium text-slate-600">
            v1.0
          </span>
        </div>

      </div>

    </aside>
  );
}
