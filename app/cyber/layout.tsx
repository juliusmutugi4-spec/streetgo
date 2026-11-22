
"use client";

import CyberSidebar from "./components/CyberSidebar";
import { usePathname } from "next/navigation";

export default function CyberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Customer payment page: no management sidebar
  if (pathname === "/cyber/customer") {
    return (
      <div className="min-h-screen bg-[#080d18] text-white">
        {children}
      </div>
    );
  }

  // Cyber owner dashboard: fixed sidebar + independent scrolling content
  return (
    <div className="flex h-screen overflow-hidden bg-[#080d18] text-white">
      <CyberSidebar />

      <main className="min-w-0 flex-1 h-screen overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
