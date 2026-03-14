import { Archive, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SentimentBadge } from "@/components/features/StatusBadge";
import { mockClips } from "@/lib/mockData";

export default function ArchivePage() {
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
            <Input placeholder="Buscar no arquivo..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Archive className="h-4 w-4" /> {mockClips.length} registros no arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wide">Data</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Cliente</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Veículo</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Trecho</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-center">Tom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClips.map((clip) => (
                <TableRow key={clip.id} className="hover:bg-secondary/50 transition-colors cursor-pointer">
                  <TableCell className="font-mono-data text-sm text-muted-foreground">{clip.date}</TableCell>
                  <TableCell className="text-sm font-medium">{clip.client_name}</TableCell>
                  <TableCell className="text-sm font-mono-data text-muted-foreground">{clip.publication}</TableCell>
                  <TableCell className="max-w-xs text-sm truncate">{clip.extracted_text_snippet}</TableCell>
                  <TableCell className="text-center"><SentimentBadge sentiment={clip.sentiment} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
