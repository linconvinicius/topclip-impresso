const API_BASE_URL = "http://localhost:8000/api";

export interface EntradaLevantamento {
  data: string;        // "2026-06-01"
  veiculo: string;
  tipo: "revista" | "jornal";
  total_paginas: number;
}

/**
 * Busca os dados de levantamento.
 * 1. Tenta o backend local (localhost:8000) — funciona no ambiente de desenvolvimento.
 * 2. Se falhar, carrega o JSON estático em /data/levantamento-{mes}.json — funciona no GitHub Pages.
 */
export async function fetchLevantamento(mes: string = "2026-06"): Promise<EntradaLevantamento[]> {
  // Tenta o backend local primeiro
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
    const response = await fetch(`${API_BASE_URL}/levantamento/?mes=${mes}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Backend indisponível — usa fallback estático
  }

  // Fallback: JSON estático exportado do banco (usado no GitHub Pages)
  const staticUrl = `${import.meta.env.BASE_URL}data/levantamento-${mes}.json`;
  const fallback = await fetch(staticUrl);
  if (!fallback.ok) {
    throw new Error(`Dados não encontrados para ${mes}. Backend offline e sem dados estáticos para este mês.`);
  }
  return fallback.json();
}

export async function fetchHealth(): Promise<any> {
  const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`);
  if (!response.ok) throw new Error("Health check falhou");
  return response.json();
}
