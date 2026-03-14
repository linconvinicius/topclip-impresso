import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ClipboardList, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SentimentBadge } from "@/components/features/StatusBadge";
import { mockClips } from "@/lib/mockData";

export default function ClipsPage() {
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const filteredClips = mockClips.filter((clip) => {
    const matchesSearch = clip.extracted_text_snippet.toLowerCase().includes(search.toLowerCase()) ||
      clip.client_name.toLowerCase().includes(search.toLowerCase()) ||
      clip.publication.toLowerCase().includes(search.toLowerCase());
    const matchesSentiment = sentimentFilter === "all" || clip.sentiment === sentimentFilter;
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
                {filteredClips.map((clip) => (
                  <TableRow key={clip.id} className="cursor-pointer hover:bg-secondary/50 transition-colors">
                    <TableCell className="font-medium text-sm">{clip.client_name}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-foreground truncate">{clip.extracted_text_snippet}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono-data">{clip.publication}</TableCell>
                    <TableCell className="text-center font-mono-data text-sm text-muted-foreground">{clip.page_number}</TableCell>
                    <TableCell className="text-center font-mono-data text-sm text-muted-foreground">{clip.column_cm2}</TableCell>
                    <TableCell className="text-center"><SentimentBadge sentiment={clip.sentiment} /></TableCell>
                    <TableCell className="text-center">
                      {clip.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs h-7 click-press">Verificar</Button>
                      )}
                    </TableCell>
                    <TableCell className="font-mono-data text-sm text-muted-foreground">{clip.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
