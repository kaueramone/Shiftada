import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isProfileComplete } from "@/lib/utils/profile"
import CriarForm from "./CriarForm"

export default async function CriarPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  const complete = isProfileComplete(profile)

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Plantão</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preencha os dados do plantão</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shiftada-logo1.png" alt="Shiftada" className="h-7 object-contain opacity-80 mt-1" />
      </div>

      <CriarForm isProfileComplete={complete} />
    </div>
  )
}
