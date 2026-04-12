import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ClientsPage from "./pages/crm/ClientsPage.tsx";
import DashboardPage from "./pages/crm/DashboardPage.tsx";
import LeadsPage from "./pages/crm/LeadsPage.tsx";
import PipelinePage from "./pages/crm/PipelinePage.tsx";
import TasksPage from "./pages/crm/TasksPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Navigate to="/crm" replace />} />
          <Route path="/crm" element={<DashboardPage />} />
          <Route path="/crm/leads" element={<LeadsPage />} />
          <Route path="/crm/pipeline" element={<PipelinePage />} />
          <Route path="/crm/clientes" element={<ClientsPage />} />
          <Route path="/crm/tareas" element={<TasksPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
