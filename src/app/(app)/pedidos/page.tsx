import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getMyShiftApplications, getMyApplications, cancelApplication } from "@/lib/actions/applications"
import { getPendingRatings } from "@/lib/actions/ratings"
import ContactButton from "@/components/ContactButton"
import Link from "next/link"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Aguardando", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    contacted: { label: "Contatado ✓", className: "bg-green-50 text-green-700 border-green-200" },
    completed: { label: "Concluído", className: "bg-blue-50 text-blue-700 border-blue-200" },
    cancelled: { label: "Cancelado", className: "bg-gray-50 text-gray-500 border-gray-200" },
  }
  const { label, className } = map[status] ?? map.pending
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${className}`}>
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
    if (!byShift.has(sid)) byShift.set(sid, { shift: app.shifts as Record<string, unknown>, apps: [] })
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
                    <p className="text-xs font-semibold text-gray-800">
                      Avalie o plantonista
                    </p>
                    <p className="text-xs text-gray-500">
                      {(app.applicant as Record<string, unknown>)?.name as string} · {(app.shifts as Record<string, unknown>)?.title as string}
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
                    <p className="text-xs font-semibold text-gray-800">
                      Avalie o plantão
                    </p>
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
              Quando alguém se candidatar a um dos seus plantões, aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(byShift.values()).map(({ shift, apps }) => (
              <div key={String(shift.id)} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Cabeçalho do plantão */}
                <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: "#eef1f8" }}>
                  <p className="font-bold text-sm text-gray-900 truncate">{String(shift.title)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📅 {formatDate(String(shift.date))} · 🕐 {String(shift.start_time ?? "").slice(0, 5)}–{String(shift.end_time ?? "").slice(0, 5)} · 📍 {String(shift.city)}
                  </p>
                </div>

                {/* Lista de candidatos */}
                {apps.map((app) => {
                  const applicant = app.applicant as Record<string, unknown> | undefined
                  return (
                    <div key={app.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {applicant?.name as string ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {applicant?.specialty as string ?? ""}
                          {applicant?.conselho && applicant?.registro
                            ? ` · ${applicant.conselho}/${applicant.estado_uf ?? ""} ${applicant.registro}`
                            : ""}
                        </p>
                      </div>
                      <ContactButton
                        applicationId={app.id}
                        applicantPhone={applicant?.phone as string ?? ""}
                        applicantName={applicant?.name as string ?? ""}
                        shiftTitle={String(shift.title)}
                        shiftDate={String(shift.date)}
                        shiftStartTime={String(shift.start_time ?? "")}
                        shiftEndTime={String(shift.end_time ?? "")}
                        shiftCity={String(shift.city)}
                        alreadyContacted={app.status === "contacted"}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
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
              const shift = app.shifts as Record<string, unknown> | undefined
              return (
                <div
                  key={app.id}
                  className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {shift?.title as string ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {shift?.city as string} · {formatDate(String(shift?.date ?? ""))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    {app.status === "pending" && (
                      <form action={cancelApplication.bind(null, app.id)}>
                        <button type="submit" className="text-xs text-gray-400 font-medium">
                          Cancelar
                        </button>
                      </form>
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
