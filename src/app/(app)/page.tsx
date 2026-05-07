import { getShifts } from "@/lib/actions/shifts"
import { applyToShift } from "@/lib/actions/applications"
import { getMyAppliedShiftIds } from "@/lib/actions/applications"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import FilterBar from "@/components/FilterBar"
import { isProfileComplete } from "@/lib/utils/profile"
import type { Shift } from "@/types"
import Link from "next/link"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
}

function formatPrice(price: number | null) {
  if (!price) return "A combinar"
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// Botão de candidatura via server action com .bind()
function ApplyButton({ shiftId }: { shiftId: string }) {
  const action = applyToShift.bind(null, shiftId)
  return (
    <form action={action}>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 w-full text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        style={{ backgroundColor: "#2A4491" }}
      >
        Quero fazer este plantão
      </button>
    </form>
  )
}

function ShiftCard({
  shift,
  currentUserId,
  profileComplete,
  hasApplied,
}: {
  shift: Shift
  currentUserId: string
  profileComplete: boolean
  hasApplied: boolean
}) {
  const isOwner = shift.user_id === currentUserId

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border ${
        shift.is_highlighted
          ? "border-[#2A4491] ring-1 ring-[#2A4491]"
          : "border-gray-100"
      }`}
    >
      {shift.is_highlighted && (
        <span
          className="inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: "#2A4491" }}
        >
          Destaque
        </span>
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-base leading-tight truncate">
            {shift.title}
          </h2>
          {shift.users?.specialty && (
            <span className="text-xs font-medium" style={{ color: "#2A4491" }}>
              {shift.users.specialty}
            </span>
          )}
        </div>
        <span className="text-base font-bold text-green-600 whitespace-nowrap">
          {formatPrice(shift.price)}
        </span>
      </div>

      {shift.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{shift.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
          📍 {shift.city}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
          📅 {formatDate(shift.date)}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
          🕐 {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
        </span>
      </div>

      {/* CTA — varia por estado */}
      {isOwner ? (
        <Link
          href="/pedidos"
          className="flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl text-sm border-2 transition-colors"
          style={{ borderColor: "#2A4491", color: "#2A4491" }}
        >
          Ver candidatos
        </Link>
      ) : !profileComplete ? (
        <Link
          href="/perfil"
          className="flex items-center justify-center w-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold py-3 rounded-xl text-sm"
        >
          ⚠️ Complete seu perfil para se candidatar
        </Link>
      ) : hasApplied ? (
        <div className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-500 font-semibold py-3 rounded-xl text-sm border border-gray-100">
          ✓ Candidatura enviada
        </div>
      ) : (
        <ApplyButton shiftId={shift.id} />
      )}
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string }>
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const userId = session.user.id
  const { city, state } = await searchParams

  // Busca paralela: plantões + perfil + candidaturas do usuário
  const [shifts, profileResult, appliedShiftIds] = await Promise.all([
    getShifts({ city, state }),
    supabase.from("users").select("*").eq("id", userId).single(),
    getMyAppliedShiftIds(userId),
  ])

  const profile = profileResult.data
  const profileComplete = isProfileComplete(profile)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantões</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {shifts.length} disponível{shifts.length !== 1 ? "is" : ""}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shiftada-logo1.png" alt="Shiftada" className="h-7 object-contain opacity-80" />
      </div>

      {/* Aviso de perfil incompleto */}
      {!profileComplete && (
        <Link
          href="/perfil"
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4"
        >
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Perfil incompleto</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Complete seus dados profissionais para se candidatar a plantões ou publicar anúncios.
            </p>
          </div>
        </Link>
      )}

      <Suspense fallback={null}>
        <FilterBar initialState={state ?? ""} initialCity={city ?? ""} />
      </Suspense>

      {shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#eef1f8" }}
          >
            <span className="text-3xl">🏥</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {city || state ? "Nenhum plantão encontrado" : "Nenhum plantão ainda"}
          </h2>
          <p className="text-gray-500 text-sm max-w-xs">
            {city || state
              ? "Tente outros filtros ou aguarde novos anúncios."
              : "Seja o primeiro a anunciar um plantão na sua região."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              currentUserId={userId}
              profileComplete={profileComplete}
              hasApplied={appliedShiftIds.has(shift.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
