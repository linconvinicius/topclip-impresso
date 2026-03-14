import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import ClipsPage from "@/pages/ClipsPage";
import ScansPage from "@/pages/ScansPage";
import ProcessingPage from "@/pages/ProcessingPage";
import ClientsPage from "@/pages/ClientsPage";
import ArchivePage from "@/pages/ArchivePage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/clips" element={<AppLayout><ClipsPage /></AppLayout>} />
          <Route path="/scans" element={<AppLayout><ScansPage /></AppLayout>} />
          <Route path="/processing" element={<AppLayout><ProcessingPage /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><ClientsPage /></AppLayout>} />
          <Route path="/archive" element={<AppLayout><ArchivePage /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
