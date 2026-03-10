
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
    </div>
  )
}