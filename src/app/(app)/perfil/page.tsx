import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserShifts, updateUserProfile, deleteShift } from "@/lib/actions/shifts"
import type { Shift, UserProfile } from "@/types"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={async () => { "use server"; await deleteShift(id) }}>
      <button
        type="submit"
        className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-lg border border-red-100 active:bg-red-50"
      >
        Excluir
      </button>
    </form>
  )
}

function ShiftItem({ shift }: { shift: Shift }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{shift.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{shift.city} - {formatDate(shift.date)}</p>
      </div>
      <DeleteButton id={shift.id} />
    </div>
  )
}

export default async function PerfilPage() {
  const supabase = await createClient()
  // getSession lê dos cookies sem chamada de rede — sempre consistente
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")
  // getUser para dados reais do usuário (feito depois da checagem)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const shifts = await getUserShifts()
  const userProfile = profile as UserProfile | null

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <form action={handleSignOut}>
          <button type="submit" className="text-sm text-gray-500 font-medium">
            Sair
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="foto"
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#2A4491' }}>
            {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-bold text-gray-900">{user.user_metadata?.full_name || "Sem nome"}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
        <h2 className="font-bold text-gray-800 mb-4">Dados profissionais</h2>
        <form action={updateUserProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nome completo</label>
            <input
              name="name"
              defaultValue={userProfile?.name ?? user.user_metadata?.full_name ?? ""}
              placeholder="Seu nome"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Especialidade</label>
            <input
              name="specialty"
              defaultValue={userProfile?.specialty ?? ""}
              placeholder="Ex: Clinico Geral, Emergencista..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Telefone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={userProfile?.phone ?? ""}
              placeholder="11999999999"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
            />
          </div>
          <button
            type="submit"
            className="w-full text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            style={{ backgroundColor: '#2A4491' }}
          >
            Salvar alteracoes
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-bold text-gray-800 mb-1">Meus plantoes</h2>
        <p className="text-xs text-gray-400 mb-3">{shifts.length} publicado{shifts.length !== 1 ? "s" : ""}</p>
        {shifts.length === 0 ? (
          <p className="text-sm text-gray-400 text-cen