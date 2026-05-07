"use client"

import { createShift } from "@/lib/actions/shifts"
import { useTransition } from "react"

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
]

export default function CriarPage() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Combina cidade + estado → "São Paulo, SP" para manter compatibilidade com o filtro
    const cidade = (formData.get("cidade") as string).trim()
    const estado = formData.get("estado") as string
    formData.set("city", estado ? `${cidade}, ${estado}` : cidade)
    formData.delete("cidade")
    formData.delete("estado")

    startTransition(() => {
      createShift(formData)
    })
  }

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A4491] focus:border-transparent"

  const selectClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A4491] focus:border-transparent appearance-none"

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

        {/* Estado + Cidade separados */}
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
            <input
              name="cidade"
              required
              placeholder="Ex: São Paulo"
              className={inputClass}
            />
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
            disabled={isPending}
            className="w-full disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors text-base"
            style={{ backgroundColor: "#2A4491" }}
          >
            {isPending ? "Publicando..." : "Publicar Plantão"}
          </button>
        </div>
      </form>
    </div>
  )
}
