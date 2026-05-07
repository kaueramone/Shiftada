"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      router.replace("/login?error=auth")
      return
    }

    if (code) {
      const supabase = createClient()
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error('[CALLBACK] exchangeCodeForSession error:', error.message)
          window.location.href = "/login?error=auth"
        } else {
          console.log('[CALLBACK] exchangeCodeForSession OK | user:', data.user?.id, '| session expires:', data.session?.expires_at)
          window.location.href = "/"
        }
      })
    } else {
      console.warn('[CALLBACK] sem code na URL')
      window.location.href = "/login"
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className=