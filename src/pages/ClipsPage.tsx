import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ClipboardList, CheckCircle2, FileImage } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SentimentBadge } from "@/components/features/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { useQuery } from "@tanstack/react-query";
import { fetchClips, fetchClients } from "@/lib/api";

export default function ClipsPage() {
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: clips = [], isLoading, error } = useQuery({
    queryKey: ["clips"],
    queryFn: () => fetchClips(50),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    refetchInterval: 60000,
  });

  // Create a mapping of client ID to client name
  const clientsMap = (clients as any[]).reduce((acc, client) => {
    acc[client.id] = client.name;
    return acc;
  }, {} as Record<number, string>);

  const filteredClips = (clips as any[]).filter((clip) => {
    const clientName = clientsMap[clip.client_id] || `Cliente ${clip.client_id}`;
    const textToSearch = (clip.snippet || clip.title || clip.publication || "").toLowerCase() + " " + clientName.toLowerCase();
    const matchesSearch = textToSearch.includes(search.toLowerCase()) ||
      String(clip.client_id).includes(search);
    
    // For now, API doesn't have sentiment, so we ignore sentiment filter or use defaults
    const matchesSentiment = sentimentFilter === "all"; 
    return matchesSearch && matchesSentiment;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Clips</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie e pesquise todos os clips gerados.</p>
      </div>

      {/* Filters */}
      <Card className="surface-elevated">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por texto, cliente ou veículo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Tom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="positive">Positivo</SelectItem>
                <SelectItem value="neutral">Neutro</SelectItem>
                <SelectItem value="negative">Negativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clips Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Card className="surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {filteredClips.length} clips encontrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wide">Cliente</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide">Trecho</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide">Veículo</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-center">Pág</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-center">cm²</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-center">Tom</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-center">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground animate-pulse">Carregando clips...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-destructive">Erro ao carregar dados da API.</TableCell></TableRow>
                ) : filteredClips.map((clip) => (
                  <TableRow 
                    key={clip.id} 
                    className="cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => {
                      setSelectedClip(clip);
                      setIsDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium text-sm">
                      {clientsMap[clip.client_id] || `Cliente ${clip.client_id}`}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-foreground truncate" title={clip.title}>{clip.title || clip.snippet}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono-data">{clip.publication}</TableCell>
                    <TableCell className="text-center font-mono-data text-sm text-muted-foreground">{clip.page}</TableCell>
                    <TableCell className="text-center font-mono-data text-sm text-muted-foreground">0</TableCell>
                    <TableCell className="text-center"><SentimentBadge sentiment="neutral" /></TableCell>
                    <TableCell className="text-center">
                      {clip.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-7 click-press"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Logic to verify...
                          }}
                        >
                          Verificar
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-mono-data text-sm text-muted-foreground">
                      {clip.date ? new Date(clip.date).toLocaleDateString("pt-BR") : "---"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedClip && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {selectedClip.title || "Clip de Imprensa"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono-data mt-1">
                  ID: {selectedClip.id} · {selectedClip.publication} · Pág. {selectedClip.page}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Left Column: Metadata & Snippet */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</p>
                    <p className="text-sm font-medium text-foreground">
                      {clientsMap[selectedClip.client_id] || `Cliente ${selectedClip.client_id}`}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data de Publicação</p>
                    <p className="text-sm font-mono-data text-foreground">
                      {selectedClip.date ? new Date(selectedClip.date).toLocaleDateString("pt-BR") : "---"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trecho / Resumo</p>
                    <div className="p-3 rounded-md bg-secondary text-sm text-foreground max-h-[220px] overflow-y-auto whitespace-pre-wrap font-sans border border-border">
                      {selectedClip.snippet || "Sem resumo disponível."}
                    </div>
                  </div>
                </div>

                {/* Right Column: Scanned Page Image */}
                <div className="space-y-2 flex flex-col">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Imagem da Página Escaneada</p>
                  <div className="flex-1 border border-border rounded-md bg-secondary/30 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[400px] relative">
                    {selectedClip.page_id ? (
                      <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                        <img 
                          src={`http://localhost:8001/api/images/page/${selectedClip.page_id}`}
                          alt={`Página ${selectedClip.page}`}
                          className="max-w-full h-auto object-contain cursor-zoom-in hover:scale-[1.05] transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-2 text-muted-foreground">
                        <FileImage className="h-12 w-12 mx-auto opacity-40" />
                        <p className="text-xs font-medium">Foto da página não disponível</p>
                        <p className="text-[10px] opacity-75">Este clip não possui mapeamento de página escaneada.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
