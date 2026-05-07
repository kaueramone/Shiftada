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
  created_at: string
}
