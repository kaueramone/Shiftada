"use client"

import { createShift } from "@/lib/actions/shifts"
import { useTransition, useState } from "react"
import Link from "next/link"

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
]

interface CriarFormProps {
  isProfileComplete: boolean
}

export default function CriarForm({ isProfileComplete }: CriarFormProps) {
  const [isPending, startTransition] = useTransition()
  const [profileError, setProfileError] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Combina cidade + estado → "São Paulo, SP"
    const cidade = (formData.get("cidade") as string).trim()
    const estado = formData.get("estado") as string
    formData.set("city", estado ? `${cidade}, ${estado}` : cidade)
    formData.delete("cidade")
    formData.delete("estado")

    startTransition(async () => {
      const result = await createShift(formData)
      if (result && "error" in result && result.error === "PROFILE_INCOMPLETE") {
        setProfileError(true)
      }
    })
  }

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A4491] focus:border-transparent"
  const selectClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A4491] focus:border-transparent appearance-none"

  return (
    <>
      {/* Aviso de perfil incompleto */}
      {(!isProfileComplete || profileError) && (
        <Link
          href="/perfil"
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-5"
        >
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Perfil incompleto</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Para publicar plantões você precisa preencher todos os dados profissionais, incluindo
              conselho e número de registro. Toque aqui para completar.
            </p>
          </div>
        </Link>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título *</label>
          <input
            name="title"
            required
            placeholder="Ex: Plantão clínico geral UPA"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Detalhes adicionais sobre o plantão..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado *</label>
            <div className="relative">
              <select name="estado" required className={selectClass} style={{ paddingRight: "2.5rem" }}>
                <option value="">Selecione</option>
                {UF_LIST.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade *</label>
            <input name="cidade" required placeholder="Ex: São Paulo" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data *</label>
          <input name="date" type="date" required className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Início *</label>
            <input name="start_time" type="time" required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fim *</label>
            <input name="end_time" type="time" required className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor (R$)</label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Deixe em branco para 'A combinar'"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp *</label>
          <input
            name="whatsapp"
            type="tel"
            required
            placeholder="Ex: 11999999999"
            className={inputClass}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || !isProfileComplete}
            className="w-full disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors text-base"
            style={{ backgroundColor: "#2A4491" }}
          >
            {isPending ? "Publicando..." : "Publicar Plantão"}
          </button>
        </div>
      </form>
    </>
  )
}
