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
      <body className="min-h-full bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
