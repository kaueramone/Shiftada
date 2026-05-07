import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  const uid = session?.user?.id ?? 'null'
  const err = sessionError?.message ?? 'none'
  console.log(`[LOGIN PAGE] session=${uid} | error=${err}`)

  if (session) {
    console.log('[LOGIN PAGE] session ok -> redirect /')
    redirect("/")
  }

  console.log('[LOGIN PAGE] sem sessao -> renderiza form')

  const { error } = await searchParams
  return <LoginForm error={error} />
}
