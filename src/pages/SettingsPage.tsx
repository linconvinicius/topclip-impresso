import { Settings, Globe, Cpu, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Parâmetros do sistema e integrações.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Motor de Processamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">OCR Automático</Label>
                <p className="text-xs text-muted-foreground">Iniciar processamento OCR ao receber scan</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">NLP Automático</Label>
                <p className="text-xs text-muted-foreground">Executar análise de tom após OCR</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">Limiar de Confiança OCR</Label>
              <Input type="number" defaultValue="85" className="mt-1.5 w-24 font-mono-data" />
              <p className="text-xs text-muted-foreground mt-1">Mínimo de confiança (%) para aceitar texto extraído</p>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">API de Scanner</Label>
                <p className="text-xs text-muted-foreground">Receber scans diretamente de scanners de rede</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Webhook de Conclusão</Label>
                <p className="text-xs text-muted-foreground">Notificar sistemas externos quando clips são gerados</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Autenticação 2FA</Label>
                <p className="text-xs text-muted-foreground">Exigir segundo fator para todos os usuários</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
