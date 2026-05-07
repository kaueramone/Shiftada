import type { UserProfile } from "@/types"

export const CONSELHOS = [
  { value: "CRM", label: "CRM – Medicina" },
  { value: "COREN", label: "COREN – Enfermagem" },
  { value: "CREFITO", label: "CREFITO – Fisioterapia" },
  { value: "CRF", label: "CRF – Farmácia" },
  { value: "CRN", label: "CRN – Nutrição" },
  { value: "CRO", label: "CRO – Odontologia" },
  { value: "CRP", label: "CRP – Psicologia" },
  { value: "CREFONO", label: "CREFONO – Fonoaudiologia" },
  { value: "CRBM", label: "CRBM – Biomedicina" },
  { value: "CRAS", label: "CRAS – Radiologia" },
  { value: "Outro", label: "Outro" },
]

export const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
]

export function isProfileComplete(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false
  return !!(
    profile.name?.trim() &&
    profile.specialty?.trim() &&
    profile.phone?.trim() &&
    profile.conselho?.trim() &&
    profile.registro?.trim() &&
    profile.estado_uf?.trim()
  )
}

export function getMissingFields(profile: Partial<UserProfile> | null | undefined): string[] {
  const missing: string[] = []
  if (!profile?.name?.trim()) missing.push("Nome completo")
  if (!profile?.specialty?.trim()) missing.push("Especialidade")
  if (!profile?.phone?.trim()) missing.push("Telefone")
  if (!profile?.conselho?.trim()) missing.push("Conselho profissional")
  if (!profile?.registro?.trim()) missing.push("Número de registro")
  if (!profile?.estado_uf?.trim()) missing.push("Estado do conselho")
  return missing
}
