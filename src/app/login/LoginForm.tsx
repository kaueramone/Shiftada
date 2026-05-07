"use client"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Mode = "login" | "signup"

export default function LoginForm({ error: initialError }: { error?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError ?? "")
  const [success, setSuccess] = useState("")

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const supabase = createClient()

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError("Email ou senha incorretos.")
      } else {
        router.push("/")
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-3">
            <Image
              src="/shiftada-logo1.png"
              alt="Shiftada"
              width={180}
              height={60}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-gray-600 mt-2 text-sm leading-relaxed text-center max-w-[260px] mx-auto">
            A plataforma que conecta profissionais de saúde a plantões disponíveis —
            médicos, enfermeiros, técnicos e mais.
            Rápido, simples e via WhatsApp.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="w-full max-w-sm bg-gray-100 rounded-xl p-1 flex mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); setSuccess("") }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setSuccess("") }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="w-full max-w-sm space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-green-700 text-sm text-center">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-colors text-base"
            style={{ backgroundColor: loading ? '#1e3070' : '#2A4491' }}
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="w-full max-w-sm mt-4">
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-2xl transition-colors text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>
        </div>

      </div>

      {/* Assinatura */}
      <div className="pb-6 text-center">
        <p className="text-xs text-gray-400">
          Desenvolvido com 💙 por{" "}
          <a
            href="https://kaueramone.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-500 hover:text-[#2A4491] transition-colors"
          >
            KAUE RAMONE
          </a>
        </p>
      </div>
    </div>
  )
}
