import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSalon } from "@/contexts/SalonContext";

interface Appointment {
  id: number;
  client_id: string;
  service: string;
  date: string;
  time: string;
  type: "procedimento" | "pacote";
  status: "pendente" | "confirmado" | "concluido" | "faltou";
  price: string;
  client?: string;
}

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const EditAppointmentModal = ({ isOpen, onClose, appointment }: EditAppointmentModalProps) => {
  const { toast } = useToast();
  const { clients, updateAppointment } = useSalon();
  
  const [formData, setFormData] = useState({
    clientId: "",
    service: "",
    date: "",
    time: "",
    type: "procedimento" as "procedimento" | "pacote",
    status: "pendente" as "pendente" | "confirmado" | "concluido" | "faltou",
    price: ""
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientId: appointment.client_id,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        status: appointment.status,
        price: appointment.price.replace("R$ ", "").replace(",", ".")
      });
    }
  }, [appointment]);

  const handleSave = () => {
    if (!formData.clientId || !formData.service || !formData.date || !formData.time || !formData.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!appointment) return;

    const selectedClient = clients.find(c => c.id === formData.clientId);
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado",
        variant: "destructive",
      });
      return;
    }

    const updatedAppointment = {
      client_id: formData.clientId,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      status: formData.status,
      price: formData.price
    };

    updateAppointment(appointment.id, updatedAppointment);
    onClose();
    
    toast({
      title: "Sucesso!",
      description: "Agendamento atualizado com sucesso",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={formData.clientId} onValueChange={(value) => 
              setFormData({ ...formData, clientId: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service">Serviço *</Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="Nome do serviço"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Horário *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: "procedimento" | "pacote") => 
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="procedimento">Procedimento</SelectItem>
                <SelectItem value="pacote">Pacote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "pendente" | "confirmado" | "concluido" | "faltou") => 
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="faltou">Faltou</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Valor (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="150,00"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};