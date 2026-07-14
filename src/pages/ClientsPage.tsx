import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "@/lib/api";

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    refetchInterval: 60000,
  });

  const filteredClients = (clients as any[]).filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    String(client.id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie a base de clientes e canais ativos.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou ID..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="click-press">Novo Cliente</Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">Carregando clientes ativos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="surface-elevated hover-lift click-press cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-mono-data bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                      ID: {client.id}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-4 line-clamp-1">{client.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> 
                    <span>contato@cliente.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Ativo desde Jan 2024</span>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <span className="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded font-medium">Impresso</span>
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-medium">Digital</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
