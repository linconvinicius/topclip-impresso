import { motion } from "framer-motion";
import { Cpu, CheckCircle2, AlertCircle, Clock, Scan } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/features/StatusBadge";
import { mockScans } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";

const statusOrder = ['ocr_processing', 'nlp_processing', 'pending', 'completed', 'error'];

export default function ProcessingPage() {
  const sorted = [...mockScans].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  const active = sorted.filter(s => s.status === 'ocr_processing' || s.status === 'nlp_processing');
  const pending = sorted.filter(s => s.status === 'pending');
  const completed = sorted.filter(s => s.status === 'completed');
  const errors = sorted.filter(s => s.status === 'error');

  const statsCards = [
    { label: "Processando", value: active.length, icon: Cpu, color: "text-primary" },
    { label: "Pendentes", value: pending.length, icon: Clock, color: "text-warning" },
    { label: "Concluídos", value: completed.length, icon: CheckCircle2, color: "text-success" },
    { label: "Erros", value: errors.length, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Processamento</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe a fila de OCR e NLP em tempo real.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="surface-elevated">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-2xl font-mono-data font-semibold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Processing */}
      {active.length > 0 && (
        <Card className="surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 animate-pulse" /> Em Processamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {active.map((scan) => (
              <div key={scan.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                <Scan className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono-data text-foreground truncate">{scan.original_filename}</p>
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden bg-border">
                      <div className="h-full shimmer rounded-full" style={{ width: scan.status === 'ocr_processing' ? '40%' : '75%' }} />
                    </div>
                  </div>
                </div>
                <StatusBadge status={scan.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Queue */}
      <Card className="surface-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Fila Completa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {sorted.map((scan) => (
            <div key={scan.id} className="flex items-center gap-4 py-3 px-3 rounded-md hover:bg-secondary/50 transition-colors">
              <span className="text-sm font-mono-data text-foreground flex-1 truncate">{scan.original_filename}</span>
              <StatusBadge status={scan.status} />
              <span className="text-xs font-mono-data text-muted-foreground shrink-0">{scan.uploaded_at}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
