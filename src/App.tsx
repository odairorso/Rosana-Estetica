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
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
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
                <Route path="/" element={<Index />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/agendamentos" element={<Agendamentos />} />
                <Route path="/pacotes" element={<Pacotes />} />
                <Route path="/caixa" element={<Caixa />} />
                <Route path="/procedimentos" element={<Procedimentos />} />
                <Route path="/estoque" element={<Estoque />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/financeiro/relatorio" element={<Relatorio />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
