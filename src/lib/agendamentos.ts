import { supabase } from "@/lib/supabase";

export async function buscarAgendamentos() {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return [];
  }

  return data;
}
