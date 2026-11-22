import CyberSidebar from "./components/CyberSidebar";

export default function CyberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#080d18] text-white">

      {/* LEFT SIDEBAR */}
      <CyberSidebar />

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}