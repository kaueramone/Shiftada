import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log(`[LOGIN PAGE] session=${session?.user?.id ?? 'null'} | error=${error?.message ?? 'none'}`)

  if (session) {
    console.log('[LOGIN PAGE] session encontrada → redirect /')
    redirect("/")
  }

  console.log('[LOGIN PAGE] sem sessão → renderiza form')

  const { error } = await searchParams
  return <LoginForm error={error} />
}
