import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSalon, Sale } from "@/contexts/SalonContext";

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const EditSaleModal = ({ isOpen, onClose, sale }: EditSaleModalProps) => {
  const { toast } = useToast();
  const { clients, editSale } = useSalon();
  
  const [formData, setFormData] = useState({
    clientId: 0,
    item: "",
    type: "procedimento" as "procedimento" | "pacote" | "produto",
    price: "",
    sessions: "",
    status: "pago" as "pago" | "pendente"
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        clientId: sale.clientId,
        item: sale.item,
        type: sale.type,
        price: sale.price.replace("R$ ", "").replace(",", "."),
        sessions: sale.sessions?.toString() || "",
        status: sale.status
      });
    }
  }, [sale]);

  const handleSave = () => {
    if (!formData.clientId || !formData.item || !formData.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!sale) return;

    const selectedClient = clients.find(c => c.id === formData.clientId);
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado",
        variant: "destructive",
      });
      return;
    }

    const updatedSale = {
      client: selectedClient.name,
      clientId: formData.clientId,
      item: formData.item,
      type: formData.type,
      price: `R$ ${formData.price}`,
      status: formData.status,
      ...(formData.type === "pacote" && {
        sessions: parseInt(formData.sessions) || 1,
      }),
    };

    editSale(sale.id, updatedSale);
    onClose();
    
    toast({
      title: "Sucesso!",
      description: "Venda atualizada com sucesso",
    });
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={formData.clientId.toString()} onValueChange={(value) => {
              setFormData({ ...formData, clientId: parseInt(value) });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name} - {client.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: "procedimento" | "pacote" | "produto") => 
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="procedimento">Procedimento</SelectItem>
                <SelectItem value="pacote">Pacote</SelectItem>
                <SelectItem value="produto">Produto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item">Item/Serviço *</Label>
            <Input
              id="item"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              placeholder="Nome do procedimento ou pacote"
            />
          </div>
          {formData.type === "pacote" && (
            <div className="grid gap-2">
              <Label htmlFor="sessions">Número de Sessões *</Label>
              <Input
                id="sessions"
                type="number"
                value={formData.sessions}
                onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                placeholder="5"
                min="1"
              />
            </div>
          )}
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
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "pago" | "pendente") => 
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};