import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";
import { useQueryClient } from "@tanstack/react-query";

interface ScheduleProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure: any;
}

export const ScheduleProcedureModal = ({
  isOpen,
  onClose,
  procedure
}: ScheduleProcedureModalProps) => {
  const { clients, addSale, addAppointment } = useSalon();
  const queryClient = useQueryClient();
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Função para converter data de yyyy-mm-dd para dd/mm/yyyy
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato dd/mm/yyyy, retorna como está
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Se está no formato yyyy-mm-dd, converte para dd/mm/yyyy
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedClientId) {
      newErrors.client = "Selecione um cliente";
    }
    
    if (!date) {
      newErrors.date = "Selecione uma data";
    }
    
    if (!time) {
      newErrors.time = "Selecione um horário";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm() || !procedure) return;

    try {
      // 1. Primeiro criar a venda do procedimento
      const saleData = {
        client_id: parseInt(selectedClientId),
        item: procedure.name,
        type: 'procedimento' as const,
        price: procedure.price.toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'pago' as const
      };

      console.log('Criando venda:', saleData);
      await addSale(saleData);

      // 2. Depois criar o agendamento
      const appointmentData = {
        client_id: parseInt(selectedClientId),
        service: procedure.name,
        date: date,
        time: time,
        status: 'confirmado' as const,
        type: 'procedimento' as const,
        price: procedure.price.toString()
      };

      console.log('Criando agendamento:', appointmentData);
      await addAppointment(appointmentData);
      
      // Forçar atualização de todas as queries relevantes
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['procedures'] });
      
      alert('Procedimento agendado com sucesso!');
      
      // Pequeno delay para garantir que as queries sejam atualizadas
      setTimeout(() => {
        handleClose();
      }, 100);
      
    } catch (error) {
      console.error('Erro ao agendar procedimento:', error);
      alert('Erro ao agendar procedimento. Tente novamente.');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedClientId("");
    setDate("");
    setTime("");
    setErrors({});
  };

  if (!procedure) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendar Procedimento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Informações do Procedimento */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium text-foreground">{procedure.name}</h3>
            <p className="text-sm text-muted-foreground">{procedure.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {procedure.duration_minutes} min
              </span>
              <span className="font-medium text-green-600">
                R$ {procedure.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client && <p className="text-sm text-red-500">{errors.client}</p>}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="time">Horário *</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};