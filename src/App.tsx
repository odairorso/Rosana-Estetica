import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SalonProvider } from "./contexts/SalonContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Clientes from "./pages/Clientes";
import Agendamentos from "./pages/Agendamentos";
import Pacotes from "./pages/Pacotes";
import Caixa from "./pages/Caixa";
import Procedimentos from "./pages/Procedimentos";
import Estoque from "./pages/Estoque";
import EstoqueLoja from "./pages/EstoqueLoja";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import Relatorio from "./pages/Relatorio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="salon-theme"
      forcedTheme={undefined}
    >
      <AuthProvider>
        <SalonProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/clientes" element={<RequireAuth><Clientes /></RequireAuth>} />
                <Route path="/agendamentos" element={<RequireAuth><Agendamentos /></RequireAuth>} />
                <Route path="/pacotes" element={<RequireAuth><Pacotes /></RequireAuth>} />
                <Route path="/caixa" element={<RequireAuth><Caixa /></RequireAuth>} />
                <Route path="/procedimentos" element={<RequireAuth><Procedimentos /></RequireAuth>} />
                <Route path="/estoque" element={<RequireAuth><Estoque /></RequireAuth>} />
                <Route path="/estoque-loja" element={<RequireAuth><EstoqueLoja /></RequireAuth>} />
                <Route path="/financeiro" element={<RequireAuth><Financeiro /></RequireAuth>} />
                <Route path="/financeiro/relatorio" element={<RequireAuth><Relatorio /></RequireAuth>} />
                <Route path="/configuracoes" element={<RequireAuth><Configuracoes /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SalonProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Carregando...</div>
    </div>
  );
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
