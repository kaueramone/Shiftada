import { getShifts } from "@/lib/actions/shifts"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import FilterBar from "@/components/FilterBar"
import type { Shift } from "@/types"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
}

function formatPrice(price: number | null) {
  if (!price) return "A combinar"
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function whatsappUrl(phone: string, shift: Shift) {
  const msg = encodeURIComponent(
    `Olá! Vi seu plantão no Shiftada e tenho interesse.\n\nPlantão: ${shift.title}\nData: ${formatDate(shift.date)}\nHorário: ${shift.start_time} - ${shift.end_time}\nCidade: ${shift.city}`
  )
  const clean = phone.replace(/\D/g, "")
  return `https://wa.me/55${clean}?text=${msg}`
}

function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${shift.is_highlighted ? "border-[#2A4491] ring-1 ring-[#2A4491]" : "border-gray-100"}`}>
      {shift.is_highlighted && (
        <span className="inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2" style={{ backgroundColor: '#2A4491' }}>
          Destaque
        </span>
      )}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{shift.title}</h2>
          {shift.users?.specialty && (
            <span className="text-xs font-medium" style={{ color: '#2A4491' }}>{shift.users.specialty}</span>
          )}
        </div>
        <span className="text-base font-bold text-green-600 whitespace-nowrap">{formatPrice(shift.price)}</span>
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

      <a
        href={whatsappUrl(shift.whatsapp, shift)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.527 5.859L0 24l6.336-1.506A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.573 9.573 0 01-4.9-1.348l-.35-.208-3.763.895.952-3.665-.228-.375A9.557 9.557 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/>
        </svg>
        Pegar plantão
      </a>
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

  const { city, state } = await searchParams
  const shifts = await getShifts({ city, state })

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantões</h1>
          <p className="text-sm text-gray-500 mt-0.5">{shifts.length} disponível{shifts.length !== 1 ? "is" : ""}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shiftada-logo1.png" alt="Shiftada" className="h-7 object-contain opacity-80" />
      </div>

      <Suspense fallback={null}>
        <FilterBar initialState={state ?? ""} initialCity={city ?? ""} />
      </Suspense>

      {shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#eef1f8' }}>
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
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      )}
    </div>
  )
}
