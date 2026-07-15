import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLevantamento, EntradaLevantamento } from "@/lib/api";
import {
  Download,
  RefreshCw,
  BookOpen,
  Newspaper,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// ─── helpers ─────────────────────────────────────────────────────────────────

function diasDoMes(mes: string): string[] {
  const [ano, m] = mes.split("-").map(Number);
  const total = new Date(ano, m, 0).getDate();
  return Array.from({ length: total }, (_, i) =>
    `${ano}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
  );
}

function diaLabel(dataStr: string): string {
  const d = new Date(dataStr + "T12:00:00");
  return `Dia ${d.getDate()}`;
}


function mesLabel(mes: string): string {
  const [ano, m] = mes.split("-").map(Number);
  return new Date(ano, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

// ─── tipos ───────────────────────────────────────────────────────────────────

interface VeiculoRow {
  nome: string;
  tipo: string;
  porDia: Record<string, number>; // data -> paginas
  total: number;
  media: number;
  diasAtivos: number;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function LevantamentoPage() {
  const { toast } = useToast();
  const [mes, setMes] = useState("2026-06");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "revista" | "jornal">("todos");
  const [vista, setVista] = useState<"tabela" | "lista">("tabela");

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery<EntradaLevantamento[]>({
    queryKey: ["levantamento", mes],
    queryFn: () => fetchLevantamento(mes),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const dias = diasDoMes(mes);

  // ── Processar dados ──────────────────────────────────────────────────────
  const veiculoRows = useMemo<VeiculoRow[]>(() => {
    const map: Record<string, VeiculoRow> = {};

    data.forEach((e) => {
      if (!map[e.veiculo]) {
        map[e.veiculo] = {
          nome: e.veiculo,
          tipo: e.tipo,
          porDia: {},
          total: 0,
          media: 0,
          diasAtivos: 0,
        };
      }
      map[e.veiculo].porDia[e.data] = e.total_paginas;
      map[e.veiculo].total += e.total_paginas;
    });

    return Object.values(map)
      .map((v) => {
        v.diasAtivos = Object.keys(v.porDia).length;
        v.media = v.diasAtivos > 0 ? Math.round(v.total / v.diasAtivos) : 0;
        return v;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [data]);

  const filtrados = useMemo(
    () =>
      filtroTipo === "todos"
        ? veiculoRows
        : veiculoRows.filter((v) => v.tipo === filtroTipo),
    [veiculoRows, filtroTipo]
  );

  // Totais por dia
  const totalPorDia = useMemo(() => {
    const t: Record<string, number> = {};
    filtrados.forEach((v) => {
      Object.entries(v.porDia).forEach(([d, pg]) => {
        t[d] = (t[d] || 0) + pg;
      });
    });
    return t;
  }, [filtrados]);

  const totalGeral = filtrados.reduce((s, v) => s + v.total, 0);
  const diasComDados = new Set(data.map((e) => e.data)).size;


  // ── Exportar CSV ─────────────────────────────────────────────────────────
  const exportarCSV = () => {
    // Separador ";" para compatibilidade com Excel BR
    const SEP = ";";

    const header = ["Veículo", "Tipo", ...dias.map(diaLabel), "Total", "Média"];
    const linhas = filtrados.map((v) => [
      v.nome,
      v.tipo === "revista" ? "Revista" : "Jornal",
      ...dias.map((d) => (v.porDia[d] ? String(v.porDia[d]) : "")),
      String(v.total),
      String(v.media),
    ]);
    const totalRow = [
      "TOTAL",
      "",
      ...dias.map((d) => (totalPorDia[d] ? String(totalPorDia[d]) : "")),
      String(totalGeral),
      "",
    ];

    const csvContent = [header, ...linhas, totalRow]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(SEP))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `levantamento_${mes}.csv`;
    // IMPORTANTE: precisa estar no DOM para o atributo download funcionar no Chrome/Edge
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ title: "Exportado!", description: `levantamento_${mes}.csv salvo na sua pasta de Downloads.` });
  };


  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-display text-lg text-foreground leading-tight">
                Levantamento de Páginas
              </h1>
              <p className="text-xs text-muted-foreground capitalize">{mesLabel(mes)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de mês */}
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {/* Filtro tipo */}
            <div className="flex rounded-md border border-border overflow-hidden">
              {(["todos", "revista", "jornal"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filtroTipo === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Vista */}
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setVista("tabela")}
                title="Vista tabela"
                className={`px-2.5 py-1.5 transition-colors ${
                  vista === "tabela" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setVista("lista")}
                title="Vista lista"
                className={`px-2.5 py-1.5 transition-colors ${
                  vista === "lista" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="click-press h-9"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button
              size="sm"
              className="click-press h-9"
              onClick={exportarCSV}
              disabled={filtrados.length === 0}
            >
              <Download className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Veículos",
              value: filtrados.length,
              sub: `${veiculoRows.filter((v) => v.tipo === "revista").length} rev · ${veiculoRows.filter((v) => v.tipo === "jornal").length} jorn`,
            },
            { label: "Dias com dados", value: diasComDados, sub: `de ${dias.length}` },
            {
              label: "Total páginas",
              value: totalGeral.toLocaleString("pt-BR"),
              sub: "no período",
            },
            {
              label: "Média por veículo/dia",
              value:
                filtrados.length > 0 && diasComDados > 0
                  ? Math.round(totalGeral / (filtrados.length * diasComDados))
                  : 0,
              sub: "páginas",
            },
          ].map((card) => (
            <div key={card.label} className="surface-elevated rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <p className="text-2xl font-bold font-mono-data text-foreground mt-1">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Estado: loading / erro ── */}
        {isLoading && (
          <div className="surface-elevated rounded-xl p-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Consultando o banco de dados...</p>
          </div>
        )}

        {isError && (
          <div className="surface-elevated rounded-xl p-12 flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-foreground">Não foi possível conectar ao backend</p>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              Verifique se o servidor Python está rodando em{" "}
              <code className="font-mono-data bg-muted px-1 rounded">http://localhost:8000</code>.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
            </Button>
          </div>
        )}

        {/* ── Vista: TABELA CRUZADA (veículo × dia) ── */}
        {!isLoading && !isError && vista === "tabela" && (
          <div className="surface-elevated rounded-xl overflow-hidden">
            {filtrados.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Nenhum dado encontrado para {mesLabel(mes)}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    {/* Linha de dias */}
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="sticky left-0 z-10 bg-muted/60 text-left px-4 py-3 font-semibold text-foreground min-w-[200px] border-r border-border">
                        Veículo
                      </th>
                      <th className="px-2 py-3 text-muted-foreground font-medium w-16 border-r border-border/50">
                        Tipo
                      </th>
                      {dias.map((d) => (
                        <th
                          key={d}
                          className="px-1 py-3 font-mono-data font-semibold text-foreground text-center w-10 border-r border-border/30"
                        >
                          {diaLabel(d)}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-right font-semibold text-foreground border-l border-border w-16">
                        Total
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-primary w-16">
                        Média
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtrados.map((v, idx) => (
                      <tr
                        key={v.nome}
                        className={`border-b border-border/40 hover:bg-secondary/40 transition-colors ${
                          idx % 2 === 0 ? "" : "bg-muted/20"
                        }`}
                      >
                        {/* Nome */}
                        <td className="sticky left-0 z-10 px-4 py-2 font-medium text-foreground border-r border-border bg-card">
                          <div className="flex items-center gap-2">
                            {v.tipo === "jornal" ? (
                              <Newspaper className="h-3 w-3 text-muted-foreground shrink-0" />
                            ) : (
                              <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate max-w-[160px]" title={v.nome}>
                              {v.nome}
                            </span>
                          </div>
                        </td>

                        {/* Tipo badge */}
                        <td className="px-2 py-2 text-center border-r border-border/50">
                          <Badge
                            variant={v.tipo === "jornal" ? "secondary" : "default"}
                            className="text-[9px] py-0 px-1.5 capitalize"
                          >
                            {v.tipo === "jornal" ? "Jorn." : "Rev."}
                          </Badge>
                        </td>

                        {/* Células de dias */}
                        {dias.map((d) => {
                          const pg = v.porDia[d];
                          return (
                            <td
                              key={d}
                              className="px-1 py-2 text-center border-r border-border/20"
                            >
                              {pg ? (
                                <span className="font-mono-data font-semibold text-primary text-[11px]">
                                  {pg}
                                </span>
                              ) : (
                                <span className="text-border">–</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total */}
                        <td className="px-3 py-2 text-right font-mono-data font-bold text-foreground border-l border-border">
                          {v.total.toLocaleString("pt-BR")}
                        </td>
                        {/* Média */}
                        <td className="px-3 py-2 text-right font-mono-data font-bold text-primary">
                          {v.media}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Linha de totais por dia */}
                  <tfoot>
                    <tr className="bg-muted/80 border-t-2 border-border font-bold">
                      <td className="sticky left-0 z-10 bg-muted/80 px-4 py-3 text-foreground border-r border-border text-xs uppercase tracking-wide">
                        Total do dia
                      </td>
                      <td className="border-r border-border/50" />
                      {dias.map((d) => (
                        <td key={d} className="px-1 py-3 text-center border-r border-border/30">
                          {totalPorDia[d] ? (
                            <span className="font-mono-data text-[11px] text-foreground">
                              {totalPorDia[d]}
                            </span>
                          ) : (
                            <span className="text-border text-[11px]">–</span>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right font-mono-data text-foreground border-l border-border">
                        {totalGeral.toLocaleString("pt-BR")}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Vista: LISTA por dia ── */}
        {!isLoading && !isError && vista === "lista" && (
          <div className="space-y-3">
            {dias
              .filter((d) => totalPorDia[d])
              .map((d) => {
                const entradas = filtrados.filter((v) => v.porDia[d]);
                const totalDia = totalPorDia[d] || 0;
                const dataObj = new Date(d + "T12:00:00");
                const dataFmt = dataObj.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                });

                return (
                  <div key={d} className="surface-elevated rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
                      <p className="text-sm font-semibold capitalize text-foreground">{dataFmt}</p>
                      <span className="text-xs text-muted-foreground">
                        {entradas.length} veículo(s) ·{" "}
                        <span className="font-bold text-primary">{totalDia.toLocaleString("pt-BR")} pág.</span>
                      </span>
                    </div>
                    <div className="divide-y divide-border/40">
                      {entradas
                        .sort((a, b) => (b.porDia[d] || 0) - (a.porDia[d] || 0))
                        .map((v) => (
                          <div key={v.nome} className="px-5 py-2.5 flex items-center gap-3">
                            {v.tipo === "jornal" ? (
                              <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className="text-sm text-foreground flex-1">{v.nome}</span>
                            <Badge
                              variant={v.tipo === "jornal" ? "secondary" : "default"}
                              className="text-[9px] py-0 px-1.5 capitalize"
                            >
                              {v.tipo}
                            </Badge>
                            <span className="font-mono-data font-bold text-primary text-sm w-12 text-right">
                              {v.porDia[d]}
                            </span>
                            <span className="text-xs text-muted-foreground">pág.</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}

            {dias.filter((d) => totalPorDia[d]).length === 0 && !isLoading && (
              <div className="surface-elevated rounded-xl p-12 text-center text-sm text-muted-foreground">
                Nenhum dado para exibir.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
