import { motion } from "framer-motion";
import { BarChart3, ClipboardList, Cpu, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats, mockClips } from "@/lib/mockData";
import { SentimentBadge } from "@/components/features/StatusBadge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export default function DashboardPage() {
  const stats = dashboardStats;
  const recentClips = mockClips.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitoramento impresso em tempo real.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Clips Hoje", value: stats.clips_today, icon: ClipboardList, accent: "text-primary" },
          { label: "Clips Semana", value: stats.clips_week, icon: TrendingUp, accent: "text-success" },
          { label: "Fila Ativa", value: stats.active_queue, icon: Cpu, accent: "text-warning" },
          { label: "Clientes Ativos", value: stats.clients_active, icon: Users, accent: "text-foreground" },
        ].map((metric, i) => (
          <motion.div key={metric.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
            <Card className="surface-elevated click-press cursor-default">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.label}</p>
                    <p className={`text-3xl font-mono-data font-semibold mt-1 ${metric.accent}`}>{metric.value}</p>
                  </div>
                  <metric.icon className={`h-8 w-8 ${metric.accent} opacity-30`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart */}
        <motion.div className="lg:col-span-2" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
          <Card className="surface-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Volume Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.volume_by_day}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="clips" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment Breakdown */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
          <Card className="surface-elevated h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tom da Cobertura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Positivo", value: stats.sentiment_breakdown.positive, color: "bg-success" },
                { label: "Neutro", value: stats.sentiment_breakdown.neutral, color: "bg-muted-foreground" },
                { label: "Negativo", value: stats.sentiment_breakdown.negative, color: "bg-destructive" },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{item.label}</span>
                    <span className="font-mono-data text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Clips */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
        <Card className="surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clips Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-border">
              {recentClips.map((clip) => (
                <div key={clip.id} className="flex items-center gap-4 py-3.5 hover:bg-secondary/50 -mx-4 px-4 transition-colors rounded-md cursor-pointer">
                  <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{clip.extracted_text_snippet}</p>
                    <p className="text-xs text-muted-foreground font-mono-data mt-0.5">
                      {clip.publication} · Pág {clip.page_number} · {clip.column_cm2}cm²
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SentimentBadge sentiment={clip.sentiment} />
                    <span className="text-xs text-muted-foreground font-mono-data">{clip.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
