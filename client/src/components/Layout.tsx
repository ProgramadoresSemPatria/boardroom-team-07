import { Sidebar } from "./Sidebar"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-opacity ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Menu className="w-6 h-6" />
      </button>

      <div 
        className={`
          fixed lg:static inset-y-0 left-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          transition-transform duration-300 ease-in-out 
          z-40
        `}
      >
        <Sidebar />
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className={`lg:hidden absolute top-4 right-4 p-2 rounded-md text-white hover:bg-zinc-700/50 transition-opacity ${!isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div
        className={`
          fixed inset-0 bg-black transition-opacity duration-300 lg:hidden
          ${isMobileMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto w-full lg:w-[calc(100%-16rem)] relative">
        {children}
      </main>
    </div>
  )
}

// Used AI to make it mobile responsive