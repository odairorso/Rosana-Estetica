import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, ShoppingBag, Calendar } from "lucide-react";

export function WelcomeHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <span>Bem-vinda, equipe!</span>
            <Sparkles className="w-8 h-8 ml-3 text-primary animate-pulse" />
          </h1>
          <div className="text-muted-foreground flex items-center">
            <span>Aqui está um resumo rápido do seu dia</span>
            <Badge variant="outline" className="ml-2 bg-success-muted text-success border-success/20">
              Dados Atualizados!
            </Badge>
          </div>
        </div>
        <div className="hidden md:flex space-x-3">
          <Button variant="outline" size="sm" className="bg-gradient-card">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Nova Venda de Pacote
          </Button>
          <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>
    </div>
  );
}