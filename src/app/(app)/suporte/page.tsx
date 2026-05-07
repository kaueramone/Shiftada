import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { generatePixPayload } from "@/lib/pix"
import QRCode from "qrcode"
import SupportForm from "./SupportForm"
import CopyButton from "./CopyButton"

const PIX_KEY = "kaueramone@live.com"

export default async function SuportePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const pixPayload = generatePixPayload(PIX_KEY, "Shiftada", "SAO PAULO")
  const qrDataUrl = await QRCode.toDataURL(pixPayload, {
    width: 200,
    margin: 2,
    color: { dark: "#2A4491", light: "#ffffff" },
  })

  return (
    <div className="px-4 pt-6 pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Suporte</h1>
      <p className="text-sm text-gray-500 mb-6">Ajuda, politicas e como apoiar o projeto.</p>

      {/* ── REPORTAR PROBLEMA ── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Reportar um problema</h2>
        <SupportForm />
      </section>

      {/* ── POLÍTICAS DE USO ── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Politicas de uso</h2>
        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-3 leading-relaxed">
          <p>
            <strong className="text-gray-800">1. Sobre a plataforma</strong><br />
            O Shiftada e uma plataforma de conexao entre profissionais da saude que buscam e oferecem plantoes medicos. Nao somos parte de nenhuma relacao de emprego, prestacao de servicos ou contrato entre as partes.
          </p>
          <p>
            <strong className="text-gray-800">2. Responsabilidade dos usuarios</strong><br />
            Cada usuario e responsavel pela veracidade das informacoes que publica. Anuncios falsos, enganosos ou que violem a etica medica serao removidos e o usuario podera ser banido.
          </p>
          <p>
            <strong className="text-gray-800">3. Contato via WhatsApp</strong><br />
            Todo contato entre profissionais acontece fora da plataforma, via WhatsApp. O Shiftada nao intermedia, nao garante e nao e responsavel por acordos fechados entre as partes.
          </p>
          <p>
            <strong className="text-gray-800">4. Dados pessoais</strong><br />
            Coletamos apenas os dados necessarios para o funcionamento da plataforma (nome, email, especialidade e telefone). Nao vendemos, alugamos ou compartilhamos seus dados com terceiros.
          </p>
          <p>
            <strong className="text-gray-800">5. Uso aceitavel</strong><br />
            E proibido usar o Shiftada para spam, assedio, fraude ou qualquer atividade ilegal. Nos reservamos o direito de encerrar contas que violem estas politicas.
          </p>
          <p>
            <strong className="text-gray-800">6. Alteracoes</strong><br />
            Estas politicas podem ser atualizadas a qualquer momento. O uso continuado da plataforma apos alteracoes implica aceitacao dos novos termos.
          </p>
        </div>
      </section>

      {/* ── PIX / APOIAR ── */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-1">Apoiar o Shiftada</h2>
        <p className="text-sm text-gray-500 mb-4">
          O Shiftada e um projeto independente. Se ele te ajudou, considere contribuir com qualquer valor via PIX.
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR Code PIX Shiftada"
            width={180}
            height={180}
            className="rounded-xl mb-4"
          />
          <p className="text-xs text-gray-500 mb-1">Chave PIX (email)</p>
          <p className="font-mono text-sm font-semibold text-gray-800 mb-3">{PIX_KEY}</p>
          <CopyButton text={PIX_KEY} />
        </div>
      </section>
    </div>
  )
}
