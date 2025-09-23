import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Edit, Calendar, Sparkles } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";
import { ScheduleProcedureModal } from "@/components/schedule-procedure-modal";

export default function Procedimentos() {
  const { procedures, isLoadingProcedures } = useSalon();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);

  // Mostrar todos os procedimentos ativos (sem filtrar por vendas/agendamentos)
  const availableProcedures = procedures || [];

  if (isLoadingProcedures) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando procedimentos...</div>
        </div>
      </div>
    );
  }

  const handleSchedule = (procedure: any) => {
    setSelectedProcedure(procedure);
    setIsScheduleModalOpen(true);
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procedimentos</h1>
          <p className="text-gray-600 mt-1">Gerencie os procedimentos disponíveis</p>
        </div>
        <Button className="bg-pink-500 hover:bg-pink-600 text-white">
          <Sparkles className="w-4 h-4 mr-2" />
          Novo Procedimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableProcedures.map((procedure) => (
          <Card key={procedure.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{procedure.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {procedure.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {procedure.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {procedure.duration_minutes} min
                  </div>
                  <div className="flex items-center font-semibold text-green-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    R$ {procedure.price.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => handleSchedule(procedure)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Agendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableProcedures.length === 0 && procedures.length > 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Todos os procedimentos foram agendados</h3>
          <p className="text-gray-600">Todos os procedimentos disponíveis já foram vendidos ou agendados.</p>
        </div>
      )}

      {procedures.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum procedimento encontrado</h3>
          <p className="text-gray-600">Adicione procedimentos para começar a agendar.</p>
        </div>
      )}

      <ScheduleProcedureModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedProcedure(null);
        }}
        procedure={selectedProcedure}
      />
    </div>
  );
}