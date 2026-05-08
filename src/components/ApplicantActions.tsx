"use client"

import { useState, useTransition } from "react"
import {
  contactApplicant,
  acceptApplicant,
  rejectApplicant,
  confirmShiftCompleted,
} from "@/lib/actions/applications"

interface Props {
  applicationId: string
  initialStatus: string
  applicantPhone: string
  applicantName: string
  shiftTitle: string
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  shiftCity: string
  ratingLink: string   // href para página de avaliar
  shiftDatePassed: boolean
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
}

export default function ApplicantActions({
  applicationId,
  initialStatus,
  applicantPhone,
  applicantName,
  shiftTitle,
  shiftDate,
  shiftStartTime,
  shiftEndTime,
  shiftCity,
  ratingLink,
  shiftDatePassed,
}: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [pending, startTransition] = useTransition()

  function openWhatsApp() {
    const msg = encodeURIComponent(
      `Olá, ${applicantName}! 👋\n\nVi seu interesse no plantão "${shiftTitle}" pelo Shiftada.\n\n📅 ${formatDate(shiftDate)}\n🕐 ${shiftStartTime.slice(0, 5)}–${shiftEndTime.slice(0, 5)}\n📍 ${shiftCity}\n\nVocê ainda está disponível? Se sim, vamos acertar os detalhes!`
    )
    const clean = applicantPhone.replace(/\D/g, "")
    window.open(`https://wa.me/55${clean}?text=${msg}`, "_blank")
  }

  function act(fn: () => Promise<void>, nextStatus: string) {
    startTransition(async () => {
      await fn()
      setStatus(nextStatus)
    })
  }

  // ── pending: botão de entrar em contato ──────────────────
  if (status === "pending") {
    return (
      <button
        disabled={pending}
        onClick={() => {
          act(() => contactApplicant(applicationId), "contacted")
          openWhatsApp()
        }}
        className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
        style={{ backgroundColor: "#25d366" }}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.527 5.859L0 24l6.336-1.506A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.573 9.573 0 01-4.9-1.348l-.35-.208-3.763.895.952-3.665-.228-.375A9.557 9.557 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/>
        </svg>
        Entrar em contato
      </button>
    )
  }

  // ── contacted: fechar ou recusar ─────────────────────────
  if (status === "contacted") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-blue-600 font-medium">📱 Contatado via WhatsApp</span>
        <div className="flex gap-2">
          <button
            disabled={pending}
            onClick={() => act(() => acceptApplicant(applicationId), "accepted")}
            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
            style={{ backgroundColor: "#2A4491" }}
          >
            ✓ Fechar com este
          </button>
          <button
            disabled={pending}
            onClick={() => act(() => rejectApplicant(applicationId), "rejected")}
            className="text-xs font-semibold text-red-600 px-3 py-1.5 rounded-lg border border-red-200 disabled:opacity-60"
          >
            Recusar
          </button>
        </div>
      </div>
    )
  }

  // ── accepted: aguardando data / confirmar realizado ───────
  if (status === "accepted") {
    if (!shiftDatePassed) {
      return (
        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
          ✓ Plantonista escolhido
        </span>
      )
    }
    return (
      <button
        disabled={pending}
        onClick={() => act(() => confirmShiftCompleted(applicationId), "completed")}
        className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
        style={{ backgroundColor: "#2A4491" }}
      >
        ✓ Confirmar plantão realizado
      </button>
    )
  }

  // ── completed: avaliar ────────────────────────────────────
  if (status === "completed") {
    return (
      <a
        href={ratingLink}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
        style={{ color: "#2A4491", borderColor: "#2A4491" }}
      >
        ⭐ Avaliar plantonista
      </a>
    )
  }

  // ── rejected ──────────────────────────────────────────────
  if (status === "rejected") {
    return (
      <span className="text-xs text-gray-400 font-medium">✕ Recusado</span>
    )
  }

  return null
}
