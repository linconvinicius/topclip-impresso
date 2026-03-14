import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileImage, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/features/StatusBadge";
import { mockScans } from "@/lib/mockData";
import { toast } from "sonner";

export default function ScansPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

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
        <p className="text-sm text-muted-foreground mt-1">Faça upload das páginas digitalizadas para processamento.</p>
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
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, TIFF — até 50 arquivos por lote</p>
              <label className="mt-4 inline-block">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
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
                  <Upload className="h-4 w-4 mr-2" /> Enviar {uploadedFiles.length} arquivo(s)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scans List */}
      <Card className="surface-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Digitalizações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wide">Arquivo</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Enviado por</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockScans.map((scan) => (
                <TableRow key={scan.id} className="hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-mono-data text-sm">{scan.original_filename}</TableCell>
                  <TableCell><StatusBadge status={scan.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{scan.uploaded_by}</TableCell>
                  <TableCell className="font-mono-data text-sm text-muted-foreground">{scan.uploaded_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
