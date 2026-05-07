"use client"

import { createShift } from "@/lib/actions/shifts"
import { useTransition } from "react"

export default function CriarPage() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => {
      createShift(formData)
    })
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Plantao</h1>
        <p className="text-sm text-gray-500 mt-0.5">Preencha os dados do plantao</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Titulo *
          </label>
          <input
            name="title"
            required
            placeholder="Ex: Plantao clinico geral UPA"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Descricao
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Detalhes adicionais sobre o plantao..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Cidade *
          </label>
          <input
            name="city"
            required
            placeholder="Ex: Sao Paulo, SP"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Data *
          </label>
          <input
            name="date"
            type="date"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Inicio *
            </label>
            <input
              name="start_time"
              type="time"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Fim *
            </label>
            <input
              name="end_time"
              type="time"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Valor (R$)
          </label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Deixe em branco para 'A combinar'"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            WhatsApp *
          </label>
          <input
            name="whatsapp"
            type="tel"
            required
            placeholder="Ex: 11999999999"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors text-base"
          >
            {isPending ? "Publicando..." : "Publicar Plantao"}
          </button>
        </div>
      </form>
    </div>
  )
}
