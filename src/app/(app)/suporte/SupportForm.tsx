'use client'

import { useState } from 'react'

export default function SupportForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`[Suporte Shiftada] ${title || 'Problema na plataforma'}`)
    const body = encodeURIComponent(
      `Descricao:\n${description}\n\n${file ? `Screenshot anexado: ${file.name}` : ''}\n\n---\nEnviado pelo app Shiftada`
    )
    window.location.href = `mailto:kaueramones@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-semibold text-green-800">Abrindo seu email...</p>
        <p className="text-sm text-green-600 mt-1">
          Lembre-se de anexar o print diretamente no e-mail antes de enviar.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-3 text-xs text-green-700 underline"
        >
          Voltar ao formulário
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Título do problema
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Não consigo publicar plantão"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Descrição *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="Descreva o que aconteceu, o que você estava tentando fazer e qual o erro que apareceu..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2A4491]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Print / Screenshot
        </label>
        <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-[#2A4491] transition-colors">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-sm text-gray-500">
            {file ? file.name : 'Selecionar imagem (opcional)'}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-1">
          O print será anexado manualmente no seu app de e-mail.
        </p>
      </div>

      <button
        type="submit"
        className="w-full text-white font-semibold py-4 rounded-2xl text-sm transition-colors"
        style={{ backgroundColor: '#2A4491' }}
      >
        Abrir e-mail para enviar
      </button>
    </form>
  )
}
