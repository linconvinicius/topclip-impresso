import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  ocr_processing: { label: "OCR", variant: "secondary" },
  nlp_processing: { label: "NLP", variant: "default" },
  completed: { label: "Concluído", variant: "default" },
  error: { label: "Erro", variant: "destructive" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "font-mono-data text-[11px] font-medium",
        status === "completed" && "bg-success text-success-foreground",
        status === "ocr_processing" && "bg-primary/15 text-primary border border-primary/30",
        status === "nlp_processing" && "bg-accent/15 text-accent border border-accent/30",
        status === "pending" && "border-border text-muted-foreground",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  className?: string;
}

const sentimentConfig = {
  positive: { label: "Positivo", className: "bg-success/15 text-success border-success/30" },
  neutral: { label: "Neutro", className: "bg-muted text-muted-foreground border-border" },
  negative: { label: "Negativo", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium border", config.className, className)}>
      {config.label}
    </Badge>
  );
}
