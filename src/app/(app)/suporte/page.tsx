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
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shiftada-logo1.png" alt="Shiftada" className="h-7 object-contain opacity-80 mt-1" />
      </div>
      <p className="text-sm text-gray-500 mb-5">Ajuda, políticas e como apoiar o projeto.</p>

      {/* ── BANNER BETA ── */}
      <div className="rounded-2xl p-4 mb-7 border border-[#2A4491]/20" style={{ backgroundColor: '#eef1f8' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🚀</span>
          <div>
            <p className="font-bold text-[#2A4491] text-sm mb-1">Você está no beta do Shiftada!</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Estamos em fase de testes e cada usuário que nos ajuda a testar e alimentar a plataforma
              será lembrado. No lançamento oficial — quando a plataforma for monetizada —
              os early adopters ganharão <strong>benefícios exclusivos</strong> dentro do Shiftada
              como forma de reconhecimento pela contribuição.
            </p>
            <p className="text-xs text-[#2A4491] font-semibold mt-2">
              Obrigado por fazer parte desde o início. 🙌
            </p>
          </div>
        </div>
      </div>

      {/* ── REPORTAR PROBLEMA ── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Reportar um problema</h2>
        <SupportForm />
      </section>

      {/* ── LGPD ── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Privacidade e LGPD</h2>
        <div className="rounded-2xl p-4 border border-[#2A4491]/20 text-sm text-gray-600 leading-relaxed space-y-3" style={{ backgroundColor: '#eef1f8' }}>
          <p className="font-semibold text-[#2A4491]">🔒 Seus dados estão protegidos pela LGPD</p>
          <p>
            O Shiftada solicita seus dados profissionais — como conselho de classe e número de registro —
            exclusivamente para <strong className="text-gray-800">garantir a segurança de todos os usuários</strong>.
            Verificamos que apenas profissionais regularizados pelos conselhos da área da saúde
            anunciam e se candidatam a plantões na plataforma.
          </p>
          <p>
            Operamos em conformidade com a <strong className="text-gray-800">Lei Geral de Proteção de Dados
            (LGPD — Lei nº 13.709/2018)</strong>. As informações coletadas são armazenadas com segurança
            e utilizadas somente para o funcionamento da plataforma.
          </p>
          <p>
            <strong className="text-gray-800">Não vendemos nem compartilhamos</strong> seus dados com terceiros para fins comerciais.
            Para solicitar exclusão dos seus dados, entre em contato pelo e-mail abaixo.
          </p>
        </div>
      </section>

      {/* ── POLÍTICAS DE USO ── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Políticas de uso</h2>
        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-3 leading-relaxed">
          <p>
            <strong className="text-gray-800">1. Sobre a plataforma</strong><br />
            O Shiftada é uma plataforma de conexão entre profissionais da saúde que buscam e oferecem plantões. Não somos parte de nenhuma relação de emprego, prestação de serviços ou contrato entre as partes.
          </p>
          <p>
            <strong className="text-gray-800">2. Responsabilidade dos usuários</strong><br />
            Cada usuário é responsável pela veracidade das informações que publica. Anúncios falsos, enganosos ou que violem a ética profissional serão removidos e o usuário poderá ser banido.
          </p>
          <p>
            <strong className="text-gray-800">3. Contato via WhatsApp</strong><br />
            Todo contato entre profissionais acontece fora da plataforma, via WhatsApp. O Shiftada não intermedeia, não garante e não é responsável por acordos fechados entre as partes.
          </p>
          <p>
            <strong className="text-gray-800">4. Dados pessoais</strong><br />
            Coletamos apenas os dados necessários para o funcionamento da plataforma (nome, e-mail, especialidade e telefone). Não vendemos, alugamos ou compartilhamos seus dados com terceiros.
          </p>
          <p>
            <strong className="text-gray-800">5. Uso aceitável</strong><br />
            É proibido usar o Shiftada para spam, assédio, fraude ou qualquer atividade ilegal. Nos reservamos o direito de encerrar contas que violem estas políticas.
          </p>
          <p>
            <strong className="text-gray-800">6. Alterações</strong><br />
            Estas políticas podem ser atualizadas a qualquer momento. O uso continuado da plataforma após alterações implica aceitação dos novos termos.
          </p>
        </div>
      </section>

      {/* ── PIX / APOIAR ── */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-1">Apoiar o Shiftada</h2>
        <p className="text-sm text-gray-500 mb-4">
          O Shiftada é um projeto independente. Se ele te ajudou, considere contribuir com qualquer valor via PIX.
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
