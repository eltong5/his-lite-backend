import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import AuthWelcomePage from "./pages/AuthWelcomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import AgencyPage from "./pages/crm/AgencyPage.tsx";
import AdvisorsPage from "./pages/crm/AdvisorsPage.tsx";
import ClientsPage from "./pages/crm/ClientsPage.tsx";
import DashboardPage from "./pages/crm/DashboardPage.tsx";
import LeadsPage from "./pages/crm/LeadsPage.tsx";
import PipelinePage from "./pages/crm/PipelinePage.tsx";
import TasksPage from "./pages/crm/TasksPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/bienvenida" element={<AuthWelcomePage />} />
    <Route path="/dashboard" element={<Navigate to="/crm" replace />} />
    <Route path="/crm" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/crm/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
    <Route path="/crm/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
    <Route path="/crm/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
    <Route path="/crm/tareas" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
    <Route path="/crm/asesores" element={<ProtectedRoute><AdvisorsPage /></ProtectedRoute>} />
    <Route path="/crm/agencia" element={<ProtectedRoute><AgencyPage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
