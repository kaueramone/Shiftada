"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { UserReputation } from "@/types"

export async function createRating(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const applicationId = formData.get("application_id") as string
  const toUserId = formData.get("to_user_id") as string
  const shiftId = formData.get("shift_id") as string
  const rating = Number(formData.get("rating"))
  const comment = (formData.get("comment") as string)?.trim() || null
  const ratedAs = formData.get("rated_as") as "provider" | "worker"

  if (!rating || rating < 1 || rating > 5) throw new Error("Avaliação inválida")

  const { error } = await supabase.from("ratings").insert({
    application_id: applicationId,
    from_user_id: user.id,
    to_user_id: toUserId,
    shift_id: shiftId,
    rating,
    comment,
    rated_as: ratedAs,
  })

  if (error && error.code !== "23505") throw new Error(error.message)

  revalidatePath("/pedidos")
  redirect("/pedidos")
}

export async function getUserReputation(userId: string): Promise<UserReputation> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("ratings")
    .select("rating, rated_as")
    .eq("to_user_id", userId)

  if (!data || data.length === 0) {
    return {
      as_provider: { count: 0, avg: null },
      as_worker: { count: 0, avg: null },
    }
  }

  const asProvider = data.filter((r: { rated_as: string }) => r.rated_as === "provider")
  const asWorker = data.filter((r: { rated_as: string }) => r.rated_as === "worker")

  return {
    as_provider: {
      count: asProvider.length,
      avg: asProvider.length
        ? +((asProvider.reduce((s: number, r: { rating: number }) => s + r.rating, 0)) / asProvider.length).toFixed(1)
        : null,
    },
    as_worker: {
      count: asWorker.length,
      avg: asWorker.length
        ? +((asWorker.reduce((s: number, r: { rating: number }) => s + r.rating, 0)) / asWorker.length).toFixed(1)
        : null,
    },
  }
}

// Avaliações que o usuário ainda precisa dar
export async function getPendingRatings(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  // IDs de candidaturas que o usuário já avaliou
  const { data: myRatings } = await supabase
    .from("ratings")
    .select("application_id")
    .eq("from_user_id", userId)

  const ratedIds = new Set((myRatings ?? []).map((r: { application_id: string }) => r.application_id))

  // Candidaturas dos meus plantões (sou dono → preciso avaliar o plantonista)
  const { data: ownerApps } = await supabase
    .from("shift_applications")
    .select(`
      id, applicant_id, shift_id,
      shifts!inner(id, title, date, city, user_id),
      applicant:users!applicant_id(id, name, specialty)
    `)
    .eq("status", "contacted")
    .lt("shifts.date", today)
    .eq("shifts.user_id", userId)

  // Candidaturas em que fui escolhido (sou candidato → preciso avaliar o ofertante)
  const { data: applicantApps } = await supabase
    .from("shift_applications")
    .select(`
      id, applicant_id, shift_id,
      shifts!inner(id, title, date, city, user_id)
    `)
    .eq("applicant_id", userId)
    .eq("status", "contacted")
    .lt("shifts.date", today)

  const rateWorker = (ownerApps ?? []).filter((a: { id: string }) => !ratedIds.has(a.id))
  const rateProvider = (applicantApps ?? []).filter((a: { id: string }) => !ratedIds.has(a.id))

  return { rateWorker, rateProvider }
}
