import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getMyShiftApplications, getMyApplications, cancelApplication } from "@/lib/actions/applications"
import { getPendingRatings } from "@/lib/actions/ratings"
import ApplicantActions from "@/components/ApplicantActions"
import Link from "next/link"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
}

function isPast(dateStr: string) {
  return new Date(dateStr + "T23:59:59") < new Date()
}

// Badge de status para visão do candidato
function CandidateBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending:   { label: "⏳ Aguardando resposta",         color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    contacted: { label: "📱 Contatado via WhatsApp",      color: "text-blue-700 bg-blue-50 border-blue-200" },
    accepted:  { label: "✓ Você foi escolhido!",         color: "text-green-700 bg-green-50 border-green-200" },
    rejected:  { label: "✕ Não foi desta vez",           color: "text-gray-500 bg-gray-50 border-gray-200" },
    completed: { label: "✓ Plantão concluído",           color: "text-[#2A4491] bg-[#eef1f8] border-[#2A4491]/20" },
  }
  const { label, color } = map[status] ?? map.pending
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${color}`}>
      {label}
    </span>
  )
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const userId = session.user.id

  const [ownerApps, myApps, pendingRatings] = await Promise.all([
    getMyShiftApplications(),
    getMyApplications(),
    getPendingRatings(userId),
  ])

  // Agrupar candidaturas por plantão (visão de dono)
  const byShift = new Map<string, { shift: Record<string, unknown>; apps: typeof ownerApps }>()
  for (const app of ownerApps) {
    const sid = app.shift_id
    if (!byShift.has(sid)) {
      byShift.set(sid, {
        shift: app.shifts as unknown as Record<string, unknown>,
        apps: [],
      })
    }
    byShift.get(sid)!.apps.push(app)
  }

  const pendingCount = pendingRatings.rateWorker.length + pendingRatings.rateProvider.length

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shiftada-logo1.png" alt="Shiftada" className="h-7 object-contain opacity-80 mt-1" />
      </div>
      <p className="text-sm text-gray-500 mb-5">Gerencie candidatos e suas candidaturas.</p>

      {/* ── AVALIAÇÕES PENDENTES ── */}
      {pendingCount > 0 && (
        <section className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-amber-800 mb-3">
              ⭐ {pendingCount} avaliação{pendingCount !== 1 ? "ões" : ""} pendente{pendingCount !== 1 ? "s" : ""}
            </h2>
            <div className="space-y-2">
              {pendingRatings.rateWorker.map((app: Record<string, unknown>) => (
                <Link
                  key={String(app.id)}
                  href={`/avaliar/${app.id}?rated_as=worker&to=${app.applicant_id}&shift=${app.shift_id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-amber-100"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Avaliar plantonista</p>
                    <p className="text-xs text-gray-500">
                      {(app.applicant as Record<string, unknown>)?.name as string} ·{" "}
                      {(app.shifts as Record<string, unknown>)?.title as string}
                    </p>
                  </div>
                  <span className="text-yellow-500 text-lg">★</span>
                </Link>
              ))}
              {pendingRatings.rateProvider.map((app: Record<string, unknown>) => (
                <Link
                  key={String(app.id)}
                  href={`/avaliar/${app.id}?rated_as=provider&to=${(app.shifts as Record<string, unknown>)?.user_id}&shift=${app.shift_id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-amber-100"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Avaliar plantão</p>
                    <p className="text-xs text-gray-500">
                      {(app.shifts as Record<string, unknown>)?.title as string}
                    </p>
                  </div>
                  <span className="text-yellow-500 text-lg">★</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CANDIDATOS PARA MEUS PLANTÕES ── */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">
          Candidatos para meus plantões
        </h2>
        {byShift.size === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">Nenhum candidato ainda.</p>
            <p className="text-xs text-gray-400 mt-1">
              Quando alguém se candidatar ao seu plantão, aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(byShift.values()).map(({ shift, apps }) => {
              const datePassed = isPast(String(shift.date))
              return (
                <div key={String(shift.id)} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  {/* Cabeçalho do plantão */}
                  <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: "#eef1f8" }}>
                    <p className="font-bold text-sm text-gray-900 truncate">{String(shift.title)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📅 {formatDate(String(shift.date))} · 🕐 {String(shift.start_time ?? "").slice(0, 5)}–{String(shift.end_time ?? "").slice(0, 5)} · 📍 {String(shift.city)}
                    </p>
                  </div>

                  {/* Candidatos */}
                  {apps.map((app) => {
                    const applicant = app.applicant as unknown as Record<string, unknown> | undefined
                    const ratingLink = `/avaliar/${app.id}?rated_as=worker&to=${app.applicant_id}&shift=${app.shift_id}`
                    return (
                      <div key={app.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                        {/* Info do candidato */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ backgroundColor: "#2A4491" }}
                            >
                              {(applicant?.name as string ?? "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {applicant?.name as string ?? "—"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {applicant?.specialty as string ?? ""}
                                {applicant?.conselho && applicant?.registro
                                  ? ` · ${applicant.conselho}/${applicant.estado_uf ?? ""} ${applicant.registro}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ações condicionais por status */}
                        <ApplicantActions
                          applicationId={app.id}
                          initialStatus={app.status}
                          applicantPhone={applicant?.phone as string ?? ""}
                          applicantName={applicant?.name as string ?? ""}
                          shiftTitle={String(shift.title)}
                          shiftDate={String(shift.date)}
                          shiftStartTime={String(shift.start_time ?? "")}
                          shiftEndTime={String(shift.end_time ?? "")}
                          shiftCity={String(shift.city)}
                          ratingLink={ratingLink}
                          shiftDatePassed={datePassed}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── MINHAS CANDIDATURAS ── */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-3">Minhas candidaturas</h2>
        {myApps.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">Você ainda não se candidatou a nenhum plantão.</p>
            <p className="text-xs text-gray-400 mt-1">
              Volte ao feed e toque em &quot;Quero fazer este plantão&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myApps.map((app) => {
              const shift = app.shifts as unknown as Record<string, unknown> | undefined
              const shiftDate = String(shift?.date ?? "")
              const isCompleted = app.status === "completed"
              const isAccepted = app.status === "accepted"
              const canRate = isCompleted
              const ratingLink = `/avaliar/${app.id}?rated_as=provider&to=${shift?.user_id}&shift=${app.shift_id}`

              return (
                <div
                  key={app.id}
                  className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {shift?.title as string ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {shift?.city as string} · {formatDate(shiftDate)}
                      </p>
                    </div>
                    <CandidateBadge status={app.status} />
                  </div>

                  {/* Ações do candidato */}
                  <div className="flex items-center gap-2 mt-1">
                    {app.status === "pending" && (
                      <form action={cancelApplication.bind(null, app.id)}>
                        <button type="submit" className="text-xs text-gray-400 font-medium underline">
                          Cancelar candidatura
                        </button>
                      </form>
                    )}
                    {canRate && (
                      <Link
                        href={ratingLink}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                        style={{ color: "#2A4491", borderColor: "#2A4491" }}
                      >
                        ⭐ Avaliar plantão
                      </Link>
                    )}
                    {isAccepted && !isCompleted && (
                      <p className="text-xs text-gray-400">
                        Aguardando confirmação do dono do plantão
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
