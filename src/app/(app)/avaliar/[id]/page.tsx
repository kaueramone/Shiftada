import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { createRating } from "@/lib/actions/ratings"
import StarRatingInput from "@/components/StarRatingInput"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

export default async function AvaliarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ rated_as?: string; to?: string; shift?: string }>
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { id: applicationId } = await params
  const { rated_as, to: toUserId, shift: shiftId } = await searchParams

  if (!rated_as || !toUserId || !shiftId) redirect("/pedidos")
  if (rated_as !== "worker" && rated_as !== "provider") redirect("/pedidos")

  // Busca info do plantão
  const { data: shift } = await supabase
    .from("shifts")
    .select("title, date, city, start_time, end_time")
    .eq("id", shiftId)
    .single()

  // Busca info de quem está sendo avaliado
  const { data: toUser } = await supabase
    .from("users")
    .select("name, specialty, conselho, registro, estado_uf")
    .eq("id", toUserId)
    .single()

  // Verifica se já foi avaliado
  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("application_id", applicationId)
    .eq("from_user_id", session.user.id)
    .maybeSingle()

  if (existing) redirect("/pedidos")

  const isRatingWorker = rated_as === "worker"

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliação</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isRatingWorker ? "Avalie o plantonista" : "Avalie o plantão"}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shiftada-logo1.png" alt="Shiftada" className="h-7 object-contain opacity-80 mt-1" />
      </div>

      {/* Info do plantão */}
      {shift && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-5">
          <p className="font-bold text-sm text-gray-900 mb-1">{shift.title}</p>
          <p className="text-xs text-gray-500">
            📅 {formatDate(shift.date)} · 🕐 {shift.start_time?.slice(0, 5)}–{shift.end_time?.slice(0, 5)} · 📍 {shift.city}
          </p>
        </div>
      )}

      {/* Info de quem está sendo avaliado */}
      {toUser && (
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundColor: "#2A4491" }}
          >
            {(toUser.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{toUser.name}</p>
            <p className="text-xs text-gray-500">{toUser.specialty}</p>
            {toUser.conselho && toUser.registro && (
              <p className="text-xs text-gray-400">
                {toUser.conselho}/{toUser.estado_uf} {toUser.registro}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Formulário de avaliação */}
      <form action={createRating} className="space-y-5">
        <input type="hidden" name="application_id" value={applicationId} />
        <input type="hidden" name="to_user_id" value={toUserId} />
        <input type="hidden" name="shift_id" value={shiftId} />
        <input type="hidden" name="rated_as" value={rated_as} />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {isRatingWorker
              ? "Como você avalia o profissional que fez o plantão?"
              : "Como você avalia a experiência neste plantão?"}
          </label>
          <StarRatingInput name="rating" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Comentário (opcional)
          </label>
          <textarea
            name="comment"
            rows={3}
            placeholder={
              isRatingWorker
                ? "Ex: Profissional pontual e comprometido..."
                : "Ex: Plantão bem organizado, equipe acolhedora..."
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A4491] resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full text-white font-semibold py-4 rounded-2xl text-base"
          style={{ backgroundColor: "#2A4491" }}
        >
          Enviar avaliação
        </button>
      </form>
    </div>
  )
}
