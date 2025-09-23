import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  sale: any;
  isPackage?: boolean;
  clientName?: string;
}

export const ScheduleAppointmentModal = ({
  isOpen,
  onClose,
  onConfirm,
  sale,
  isPackage = false,
  clientName
}: ScheduleAppointmentModalProps) => {
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

  // Função para converter data de dd/mm/yyyy para yyyy-mm-dd
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
  };

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString().padStart(2, '0');
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const year = tomorrow.getFullYear();
    return `${day}/${month}/${year}`;
  });
  const [time, setTime] = useState('09:00');
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});

  const validateForm = () => {
    const newErrors: { date?: string; time?: string } = {};

    // Validar data
    const dateRegexBR = /^\d{2}\/\d{2}\/\d{4}$/;
    const dateRegexISO = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      let dateToValidate = date;
      
      // Se está no formato brasileiro, converter para ISO
      if (dateRegexBR.test(date)) {
        dateToValidate = formatDateForInput(date);
      }
      
      if (!dateRegexISO.test(dateToValidate) && !dateRegexBR.test(date)) {
        newErrors.date = 'Formato de data inválido (DD/MM/AAAA)';
      } else {
        const selectedDate = new Date(dateToValidate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.date = 'Data não pode ser no passado';
        }
      }
    }

    // Validar horário
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!time) {
      newErrors.time = 'Horário é obrigatório';
    } else if (!timeRegex.test(time)) {
      newErrors.time = 'Formato de horário inválido (HH:MM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      // Garantir que a data está no formato ISO antes de passar para onConfirm
      let dateToSend = date;
      const dateRegexBR = /^\d{2}\/\d{2}\/\d{4}$/;
      
      if (dateRegexBR.test(date)) {
        dateToSend = formatDateForInput(date);
      }
      
      onConfirm(dateToSend, time);
      onClose();
      // Reset form
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const day = tomorrow.getDate().toString().padStart(2, '0');
      const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
      const year = tomorrow.getFullYear();
      setDate(`${day}/${month}/${year}`);
      setTime('09:00');
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  const getNextSession = () => {
    if (isPackage && sale) {
      return (sale.used_sessions || 0) + 1;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            {isPackage ? 'Agendar Sessão' : 'Agendar Procedimento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do serviço */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-foreground">{sale?.item}</p>
            {clientName && (
              <p className="text-sm text-muted-foreground font-medium">{clientName}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {isPackage && sale ? 
                `Sessão ${getNextSession()}/${sale.sessions} - R$ ${(parseFloat(sale.price) / sale.sessions).toFixed(2)}` :
                `R$ ${parseFloat(sale?.price || '0').toFixed(2)}`
              }
            </p>
          </div>

          {/* Campo de data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data do Agendamento
            </Label>
            <Input
              id="date"
              type="text"
              value={formatDateForDisplay(date)}
              onChange={(e) => {
                const value = e.target.value;
                // Aplicar máscara dd/mm/yyyy
                let maskedValue = value.replace(/\D/g, '');
                if (maskedValue.length >= 2) {
                  maskedValue = maskedValue.substring(0, 2) + '/' + maskedValue.substring(2);
                }
                if (maskedValue.length >= 5) {
                  maskedValue = maskedValue.substring(0, 5) + '/' + maskedValue.substring(5, 9);
                }
                
                // Armazenar sempre no formato brasileiro para exibição
                setDate(maskedValue);
              }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Campo de horário */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={errors.time ? 'border-red-500' : ''}
            />
            {errors.time && (
              <p className="text-sm text-red-500">{errors.time}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
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