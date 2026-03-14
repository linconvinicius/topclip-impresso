import { FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dashboardStats } from "@/lib/mockData";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

const sentimentData = [
  { name: "Positivo", value: 45, color: "hsl(160, 84%, 39%)" },
  { name: "Neutro", value: 35, color: "hsl(215, 16%, 47%)" },
  { name: "Negativo", value: 20, color: "hsl(0, 84%, 60%)" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere e exporte relatórios consolidados.</p>
        </div>
        <Button variant="outline" className="click-press" size="sm">
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <Card className="surface-elevated">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <Select defaultValue="week">
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              <SelectItem value="petrobras">Petrobras</SelectItem>
              <SelectItem value="bb">Banco do Brasil</SelectItem>
              <SelectItem value="embraer">Embraer</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Volume por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dashboardStats.volume_by_day}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="clips" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Distribuição por Tom</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sentimentData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sentimentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-elevated">
        <CardContent className="p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Relatório pronto para exportação</p>
          <p className="text-xs text-muted-foreground mt-1">Selecione período e cliente, depois clique em "Exportar PDF"</p>
        </CardContent>
      </Card>
    </div>
  );
}
