import { useState, useEffect } from "react";
import { Archive, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SentimentBadge } from "@/components/features/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { fetchClips, fetchClients } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

export default function ArchivePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["archive", debouncedSearch],
    queryFn: () => fetchClips(100, debouncedSearch),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    refetchInterval: 60000,
  });

  // Map client ID to name
  const clientsMap = (clients as any[]).reduce((acc, client) => {
    acc[client.id] = client.name;
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Arquivo</h1>
        <p className="text-sm text-muted-foreground mt-1">Repositório histórico completo de todos os clips.</p>
      </div>

      <Card className="surface-elevated">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título ou conteúdo..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Archive className="h-4 w-4" /> {isLoading ? "..." : clips.length} registros encontrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wide">Data</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Cliente</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Veículo</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Título / Trecho</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-center">Tom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground animate-pulse font-mono-data uppercase tracking-widest text-[10px]">Acessando Arquivo Central...</TableCell></TableRow>
              ) : clips.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground uppercase text-xs">Nenhum registro encontrado</TableCell></TableRow>
              ) : (clips as any[]).map((clip) => (
                <TableRow key={clip.id} className="hover:bg-secondary/50 transition-colors cursor-pointer border-border/40">
                  <TableCell className="font-mono-data text-xs text-muted-foreground whitespace-nowrap">
                    {clip.date ? new Date(clip.date).toLocaleDateString("pt-BR") : "---"}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {clientsMap[clip.client_id] || `Cliente ${clip.client_id}`}
                  </TableCell>
                  <TableCell className="text-xs font-mono-data text-muted-foreground">{clip.publication || "Impresso"}</TableCell>
                  <TableCell className="max-w-md text-xs truncate text-foreground" title={clip.title || clip.snippet}>
                    {clip.title || clip.snippet}
                  </TableCell>
                  <TableCell className="text-center"><SentimentBadge sentiment="neutral" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
