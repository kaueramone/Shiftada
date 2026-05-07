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

  console.log(`[LOGIN PAGE] session=${session?.user?.id ?? 'null'} | error=${s