import { useState } from "react";
import { Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    toast.success("Login realizado com sucesso");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm surface-elevated">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Scan className="h-8 w-8 text-primary" />
            <span className="text-display text-xl text-foreground">LeituraTopClip</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
                required
              />
            </div>
            <Button type="submit" className="w-full click-press">Entrar</Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-6">
            Acesso restrito a usuários autorizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
