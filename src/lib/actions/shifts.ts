"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isProfileComplete } from "@/lib/utils/profile"
import type { Shift } from "@/types"

export async function getShifts(filters?: { city?: string; state?: string }): Promise<Shift[]> {
  const supabase = await createClient()

  // Só exibe plantões cuja data seja hoje ou futura.
  // Plantão expira automaticamente quando a data passa.
  // Remoção manual pelo usuário via deleteShift().
  const today = new Date().toISOString().split("T")[0] // "YYYY-MM-DD"

  let query = supabase
    .from("shifts")
    .select("*, users(id, name, specialty)")
    .gte("date", today)
    .order("is_highlighted", { ascending: false })
    .order("date", { ascending: true })
    .order("created_at", { ascending: false })

  if (filters?.city) {
    query = query.ilike("city", `%${filters.city}%`)
  }
  if (filters?.state) {
    query = query.ilike("city", `%, ${filters.state}%`)
  }

  const { data, error } = await query
  if (error) return []
  return data as Shift[]
}

export async function getUserShifts(): Promise<Shift[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []
  return data as Shift[]
}

export async function createShift(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Gate: perfil completo obrigatório antes de publicar
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  if (!isProfileComplete(profile)) {
    return { error: "PROFILE_INCOMPLETE" }
  }

  const { error } = await supabase.from("shifts").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    city: formData.get("city") as string,
    date: formData.get("date") as string,
    start_time: formData.get("start_time") as string,
    end_time: formData.get("end_time") as string,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    whatsapp: formData.get("whatsapp") as string,
    is_highlighted: false,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/")
  redirect("/")
}

export async function deleteShift(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await supabase.from("shifts").delete().eq("id", id).eq("user_id", user.id)
  revalidatePath("/perfil")
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await supabase.from("users").upsert({
    id: user.id,
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    specialty: formData.get("specialty") as string,
    conselho: formData.get("conselho") as string,
    registro: formData.get("registro") as string,
    estado_uf: formData.get("estado_uf") as string,
  }, { onConflict: "id" })

  revalidatePath("/perfil")
}
