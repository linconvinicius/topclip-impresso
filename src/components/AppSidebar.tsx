import { Scan, ClipboardList, BarChart3, Users, Upload, Cpu, Archive, FileText, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Clips", url: "/clips", icon: ClipboardList },
  { title: "Digitalizações", url: "/scans", icon: Upload },
  { title: "Processamento", url: "/processing", icon: Cpu },
];

const managementNav = [
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Arquivo", url: "/archive", icon: Archive },
  { title: "Relatórios", url: "/reports", icon: FileText },
];

const systemNav = [
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {!collapsed && label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeClassName="bg-primary/10 text-primary font-semibold"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="flex h-14 items-center border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Scan className="h-6 w-6 text-primary" />
            <span className="text-display text-base text-foreground">LeituraTopClip</span>
          </div>
        )}
        {collapsed && <Scan className="h-6 w-6 text-primary mx-auto" />}
      </div>
      <SidebarContent className="px-2 py-2">
        {renderGroup("Monitoramento", mainNav)}
        {renderGroup("Gestão", managementNav)}
        {renderGroup("Sistema", systemNav)}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive click-press">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
