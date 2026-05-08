export interface Shift {
  id: string
  user_id: string
  title: string
  description: string | null
  city: string
  date: string
  start_time: string
  end_time: string
  price: number | null
  whatsapp: string
  is_highlighted: boolean
  created_at: string
  users?: UserProfile
}

export interface UserProfile {
  id: string
  name: string | null
  phone: string | null
  specialty: string | null
  conselho: string | null   // CRM, COREN, CREFITO, etc.
  registro: string | null   // número de registro profissional
  estado_uf: string | null  // UF do conselho (SP, RJ, etc.)
  avatar_url: string | null // foto de perfil personalizada
  created_at: string
}

export interface ShiftApplication {
  id: string
  shift_id: string
  applicant_id: string
  status: "pending" | "contacted" | "completed" | "cancelled"
  created_at: string
  shifts?: Partial<Shift>
  applicant?: Partial<UserProfile>
}

export interface Rating {
  id: string
  application_id: string
  from_user_id: string
  to_user_id: string
  shift_id: string
  rating: number
  comment: string | null
  rated_as: "provider" | "worker"
  created_at: string
}

export interface UserReputation {
  as_provider: { count: number; avg: number | null }
  as_worker: { count: number; avg: number | null }
}
