import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Shiftada - Plantoes medicos",
  description: "Encontre e anuncie plantoes medicos de forma rapida e simples.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2A4491",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full text-gray-900 antialiased" style={{ backgroundColor: '#e5e7eb' }}>
        {/* Container mobile-first: max 430px centralizado no desktop */}
        <div className="max-w-[430px] mx-auto min-h-screen bg-white relative" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.12)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
