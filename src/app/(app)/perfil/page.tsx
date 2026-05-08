import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserShifts, updateUserProfile, deleteShift, getOfferedShiftHistory } from "@/lib/actions/shifts"
import { getUserReputation } from "@/lib/actions/ratings"
import { getTakenShiftHistory } from "@/lib/actions/applications"
import { isProfileComplete, getMissingFields, CONSELHOS, UF_LIST } from "@/lib/utils/profile"
import AvatarUpload from "@/components/AvatarUpload"
import type { Shift, UserProfile } from "@/types"
import Link from "next/link"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function Stars({ avg }: { avg: number | null }) {
  if (avg === null) return <span className="text-xs text-gray-400">Sem avaliações</span>
  return (
    <span className="flex items-center justify-center gap-1">
      <span style={{ color: "#f59e0b" }}>★</span>
      <span className="text-sm font-bold text-gray-800">{avg.toFixed(1)}</span>
    </span>
  )
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
        <p className="text-xs text-gray-500 mt-0.5">{shift.city} · {formatDate(shift.date)}</p>
      </div>
      <DeleteButton id={shift.id} />
    </div>
  )
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })
}

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ hp?: string; ap?: string }>
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const sp = await searchParams
  const hPage = Math.max(1, parseInt(sp.hp ?? "1", 10))
  const aPage = Math.max(1, parseInt(sp.ap ?? "1", 10))

  const [{ data: profile }, shifts, reputation, offeredHistory, takenHistory] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    getUserShifts(),
    getUserReputation(user.id),
    getOfferedShiftHistory(hPage, 3),
    getTakenShiftHistory(aPage, 3),
  ])

  const userProfile = profile as UserProfile | null
  const complete = isProfileComplete(userProfile)
  const missing = getMissingFields(userProfile)

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
  const selectClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A4491] appearance-none"

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <form action={handleSignOut}>
          <button type="submit" className="text-sm text-gray-500 font-medium">Sair</button>
        </form>
      </div>

      {/* Avatar + nome */}
      <div className="flex items-center gap-4 mb-5">
        <AvatarUpload
          userId={user.id}
          currentUrl={userProfile?.avatar_url ?? user.user_metadata?.avatar_url ?? null}
          fallbackInitial={(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
        />
        <div>
          <p className="font-bold text-gray-900">{user.user_metadata?.full_name || "Sem nome"}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Aviso de campos faltando */}
      {!complete && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Complete seu perfil para usar a plataforma</p>
          <p className="text-xs text-amber-700">Faltam: {missing.join(", ")}</p>
        </div>
      )}

      {/* Reputação */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Como ofertante</p>
          <Stars avg={reputation.as_provider.avg} />
          <p className="text-xs text-gray-400 mt-1">
            {reputation.as_provider.count} plantão{reputation.as_provider.count !== 1 ? "ões" : ""} ofertado{reputation.as_provider.count !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Como plantonista</p>
          <Stars avg={reputation.as_worker.avg} />
          <p className="text-xs text-gray-400 mt-1">
            {reputation.as_worker.count} plantão{reputation.as_worker.count !== 1 ? "ões" : ""} realizado{reputation.as_worker.count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Dados profissionais */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-gray-800 mb-4">Dados profissionais</h2>
        <form action={updateUserProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nome completo *</label>
            <input
              name="name"
              defaultValue={userProfile?.name ?? user.user_metadata?.full_name ?? ""}
              placeholder="Seu nome completo"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Especialidade *</label>
            <input
              name="specialty"
              defaultValue={userProfile?.specialty ?? ""}
              placeholder="Ex: Enfermeiro, Médico Clínico Geral, Técnico de Enfermagem..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Telefone / WhatsApp *</label>
            <input
              name="phone"
              type="tel"
              defaultValue={userProfile?.phone ?? ""}
              placeholder="11999999999"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Conselho *</label>
              <div className="relative">
                <select
                  name="conselho"
                  defaultValue={userProfile?.conselho ?? ""}
                  className={selectClass}
                  style={{ paddingRight: "2rem" }}
                >
                  <option value="">Selecione</option>
                  {CONSELHOS.map((c) => (
                    <option key={c.value} value={c.value}>{c.value}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nº de registro *</label>
              <input
                name="registro"
                defaultValue={userProfile?.registro ?? ""}
                placeholder="Ex: 123456"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Estado do conselho *</label>
            <div className="relative">
              <select
                name="estado_uf"
                defaultValue={userProfile?.estado_uf ?? ""}
                className={selectClass}
                style={{ paddingRight: "2rem" }}
              >
                <option value="">Selecione</option>
                {UF_LIST.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white font-semibold py-3 rounded-xl text-sm"
            style={{ backgroundColor: "#2A4491" }}
          >
            Salvar alterações
          </button>
        </form>
      </div>

      {/* Meus plantões */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-gray-800 mb-1">Meus plantões ativos</h2>
        <p className="text-xs text-gray-400 mb-3">
          {shifts.length} publicado{shifts.length !== 1 ? "s" : ""}
        </p>
        {shifts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum plantão publicado ainda.</p>
        ) : (
          <div>{shifts.map((shift) => <ShiftItem key={shift.id} shift={shift} />)}</div>
        )}
      </div>

      {/* Histórico de plantões oferecidos */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-gray-800 mb-1">Histórico de plantões oferecidos</h2>
        <p className="text-xs text-gray-400 mb-3">{offeredHistory.total} no total</p>

        {offeredHistory.total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum plantão passado ainda.</p>
        ) : (
          <>
            <div className="space-y-2">
              {(offeredHistory.data as Record<string, unknown>[]).map((shift) => {
                const apps = (shift.shift_applications ?? []) as Record<string, unknown>[]
                const acceptedCount  = apps.filter(a => a.status === "accepted" || a.status === "completed").length
                const pendingCount   = apps.filter(a => a.status === "pending").length
                const rejectedCount  = apps.filter(a => a.status === "rejected").length
                return (
                  <Link
                    key={shift.id as string}
                    href={`/historico/${shift.id}`}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{shift.title as string}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {shift.city as string} · {formatDateShort(shift.date as string)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-xs text-gray-400">{apps.length} candidato{apps.length !== 1 ? "s" : ""}</span>
                      {acceptedCount > 0 && <span className="text-xs text-green-600">✓{acceptedCount}</span>}
                      {pendingCount > 0 && <span className="text-xs text-yellow-600">⏳{pendingCount}</span>}
                      {rejectedCount > 0 && <span className="text-xs text-red-400">✕{rejectedCount}</span>}
                      <span className="text-gray-300 text-sm">›</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Paginação */}
            {offeredHistory.total > 3 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                {hPage > 1 ? (
                  <Link href={`/perfil?hp=${hPage - 1}&ap=${aPage}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600">← Anterior</Link>
                ) : <span />}
                <span className="text-xs text-gray-400">Pág. {hPage} de {Math.ceil(offeredHistory.total / 3)}</span>
                {hPage < Math.ceil(offeredHistory.total / 3) ? (
                  <Link href={`/perfil?hp=${hPage + 1}&ap=${aPage}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600">Próximo →</Link>
                ) : <span />}
              </div>
            )}
          </>
        )}
      </div>

      {/* Histórico de plantões realizados */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-gray-800 mb-1">Plantões que realizei</h2>
        <p className="text-xs text-gray-400 mb-3">{takenHistory.total} no total</p>

        {takenHistory.total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum plantão realizado ainda.</p>
        ) : (
          <>
            <div className="space-y-2">
              {(takenHistory.data as Record<string, unknown>[]).map((app) => {
                const shift = app.shifts as Record<string, unknown> | undefined
                const STATUS_LABEL: Record<string, { label: string; color: string }> = {
                  pending:   { label: "Aguardando", color: "text-yellow-600" },
                  contacted: { label: "Contatado",  color: "text-blue-600" },
                  accepted:  { label: "Escolhido",  color: "text-green-600" },
                  rejected:  { label: "Recusado",   color: "text-red-400" },
                  completed: { label: "Concluído",  color: "text-[#2A4491]" },
                }
                const { label, color } = STATUS_LABEL[app.status as string] ?? STATUS_LABEL.pending
                return (
                  <Link
                    key={app.id as string}
                    href={`/historico/${shift?.id}`}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{shift?.title as string}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {shift?.city as string} · {formatDateShort(shift?.date as string)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className={`text-xs font-medium ${color}`}>{label}</span>
                      <span className="text-gray-300 text-sm">›</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Paginação */}
            {takenHistory.total > 3 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                {aPage > 1 ? (
                  <Link href={`/perfil?hp=${hPage}&ap=${aPage - 1}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600">← Anterior</Link>
                ) : <span />}
                <span className="text-xs text-gray-400">Pág. {aPage} de {Math.ceil(takenHistory.total / 3)}</span>
                {aPage < Math.ceil(takenHistory.total / 3) ? (
                  <Link href={`/perfil?hp=${hPage}&ap=${aPage + 1}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600">Próximo →</Link>
                ) : <span />}
              </div>
            )}
          </>
        )}
      </div>

      {/* Link Suporte */}
      <Link
        href="/suporte"
        className="flex items-center justify-between w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-600"
      >
        <span className="flex items-center gap-2">❓ Ajuda, políticas e suporte</span>
        <span className="text-gray-400">›</span>
      </Link>
    </div>
  )
}
