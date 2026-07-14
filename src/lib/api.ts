const API_BASE_URL = "http://localhost:8000/api";

export interface EntradaLevantamento {
  data: string;        // "2026-06-01"
  veiculo: string;
  tipo: "revista" | "jornal";
  total_paginas: number;
}

export async function fetchLevantamento(mes: string = "2026-06"): Promise<EntradaLevantamento[]> {
  const response = await fetch(`${API_BASE_URL}/levantamento/?mes=${mes}`);
  if (!response.ok) throw new Error("Falha ao buscar dados de levantamento");
  return response.json();
}

export async function fetchHealth(): Promise<any> {
  const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`);
  if (!response.ok) throw new Error("Health check falhou");
  return response.json();
}
