import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Tag, Power, PowerOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { mockClients, type Client } from "@/lib/mockData";
import { toast } from "sonner";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  const handleAddClient = () => {
    if (!newName.trim()) return;
    const client: Client = {
      id: String(Date.now()),
      name: newName.trim(),
      is_active: true,
      keywords: newKeywords.split(",").map(k => k.trim()).filter(Boolean),
      created_at: new Date().toISOString().split("T")[0],
    };
    setClients(prev => [client, ...prev]);
    setNewName("");
    setNewKeywords("");
    setDialogOpen(false);
    toast.success(`Cliente "${client.name}" adicionado`);
  };

  const toggleActive = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie empresas monitoradas e palavras-chave.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="click-press" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nome da Empresa</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Petrobras" className="mt-1.5" />
              </div>
              <div>
                <Label>Palavras-chave (separadas por vírgula)</Label>
                <Input value={newKeywords} onChange={e => setNewKeywords(e.target.value)} placeholder="Ex: petróleo, pré-sal, combustível" className="mt-1.5" />
              </div>
              <Button onClick={handleAddClient} className="w-full click-press">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`surface-elevated click-press cursor-default ${!client.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{client.name}</h3>
                  </div>
                  <button onClick={() => toggleActive(client.id)} className="click-press">
                    {client.is_active ? (
                      <Power className="h-4 w-4 text-success" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {client.keywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="text-[11px] font-mono-data">
                      <Tag className="h-2.5 w-2.5 mr-1" />{kw}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-mono-data mt-3">Desde {client.created_at}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
