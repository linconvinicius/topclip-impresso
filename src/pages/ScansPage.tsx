import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileImage, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/features/StatusBadge";
import { fetchQueue } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ScansPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: fetchQueue,
    refetchInterval: 5000,
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).map(f => f.name);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} arquivo(s) adicionado(s) à fila`);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(f => f.name);
      setUploadedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} arquivo(s) adicionado(s) à fila`);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Digitalizações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie arquivos na fila de processamento central.</p>
      </div>

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="surface-elevated">
          <CardContent className="p-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
              }`}
            >
              <Upload className={`h-10 w-10 mx-auto mb-4 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground">Arraste arquivos de digitalização aqui</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, TIFF ou PDF</p>
              <label className="mt-4 inline-block">
                <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                <Button variant="outline" size="sm" className="click-press" asChild>
                  <span>Selecionar Arquivos</span>
                </Button>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fila de Upload</p>
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-md bg-secondary">
                    <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono-data text-foreground flex-1 truncate">{file}</span>
                    <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
                <Button className="mt-2 click-press" size="sm">
                  <Upload className="h-4 w-4 mr-2" /> Enviar para Processamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scans List */}
      <Card className="surface-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Digitalizações em Fila</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wide">Arquivo / ID</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Data Envio</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Progresso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Consultando fila central...</TableCell></TableRow>
              ) : scans.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Fila de digitalização vazia</TableCell></TableRow>
              ) : (scans as any[]).map((scan) => (
                <TableRow key={scan.id} className="hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-mono-data text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{scan.original_filename || "N/A"}</span>
                      <span className="text-[10px] text-muted-foreground">ID: {scan.id}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={scan.status} /></TableCell>
                  <TableCell className="font-mono-data text-xs text-muted-foreground">
                    {scan.uploaded_at || "Recém chegado"}
                  </TableCell>
                  <TableCell>
                    <div className="h-1 w-24 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary shimmer" 
                        style={{ width: scan.status === 'ocr_processing' ? '40%' : scan.status === 'completed' ? '100%' : '10%' }} 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
