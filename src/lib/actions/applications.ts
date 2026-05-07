"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Candidatar-se a um plantão
export async function applyToShift(shiftId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("shift_applications").insert({
    shift_id: shiftId,
    applicant_id: user.id,
    status: "pending",
  })

  // 23505 = unique violation (já se candidatou)
  if (error && error.code !== "23505") throw new Error(error.message)
  revalidatePath("/")
}

// Cancelar candidatura
export async function cancelApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await supabase
    .from("shift_applications")
    .update({ status: "cancelled" })
    .eq("id", applicationId)
    .eq("applicant_id", user.id)

  revalidatePath("/pedidos")
}

// Marcar como "contatado" (dono do plantão entrou em contato)
export async function contactApplicant(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await supabase
    .from("shift_applications")
    .update({ status: "contacted" })
    .eq("id", applicationId)

  revalidatePath("/pedidos")
}

// Candidatos para meus plantões (sou dono)
export async function getMyShiftApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("shift_applications")
    .select(`
      id, shift_id, applicant_id, status, created_at,
      shifts!inner(id, title, city, date, start_time, end_time, user_id),
      applicant:users!applicant_id(id, name, specialty, conselho, registro, estado_uf, phone)
    `)
    .eq("shifts.user_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getMyShiftApplications]", error.message)
    return []
  }
  return data ?? []
}

// Plantões em que me candidatei (sou candidato)
export async function getMyApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("shift_applications")
    .select(`
      id, shift_id, applicant_id, status, created_at,
      shifts(id, title, city, date, start_time, end_time, price, user_id)
    `)
    .eq("applicant_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getMyApplications]", error.message)
    return []
  }
  return data ?? []
}

// IDs dos plantões em que o usuário já se candidatou (para o feed)
export async function getMyAppliedShiftIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("shift_applications")
    .select("shift_id")
    .eq("applicant_id", userId)
    .not("status", "eq", "cancelled")

  return new Set((data ?? []).map((a: { shift_id: string }) => a.shift_id))
}
