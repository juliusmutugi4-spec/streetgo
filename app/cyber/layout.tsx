import CyberSidebar from "./components/CyberSidebar";

export default function CyberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#080d18] text-white">

      {/* FIXED SIDEBAR */}
      <CyberSidebar />

      {/* INDEPENDENT SCROLLING CONTENT */}
      <main className="min-w-0 flex-1 h-screen overflow-y-auto overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}