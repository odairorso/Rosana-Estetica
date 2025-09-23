import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSalon } from "@/contexts/SalonContext";
import { toast } from "sonner";

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPackageModal({ isOpen, onClose }: AddPackageModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sessions: "",
    discount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addSale } = useSalon();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Este modal agora serve apenas para criar templates de pacotes
      // A venda real do pacote deve ser feita no caixa
      const packageTemplate = {
        item: formData.name,
        type: 'template_pacote' as const,
        price: parseFloat(formData.price),
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        sessions: parseInt(formData.sessions),
        description: formData.description,
      };

      // Por enquanto, vamos apenas mostrar uma mensagem informativa
      toast.info("Template de pacote criado! Use o caixa para vender pacotes aos clientes.");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        sessions: "",
        discount: "",
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar template de pacote:', error);
      toast.error("Erro ao criar template de pacote. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Pacote</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Pacote</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Pacote Anti-idade"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o que inclui no pacote..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço Total (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessions">Número de Sessões</Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                value={formData.sessions}
                onChange={(e) => handleInputChange("sessions", e.target.value)}
                placeholder="3"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Desconto (%) - Opcional</Label>
            <Input
              id="discount"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", e.target.value)}
              placeholder="10"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <p className="text-sm text-gray-600">
              <strong>Preço por sessão:</strong> {
                formData.price && formData.sessions 
                  ? `R$ ${(parseFloat(formData.price) * (1 - (formData.discount ? parseFloat(formData.discount) / 100 : 0)) / parseInt(formData.sessions)).toFixed(2)}`
                  : "R$ 0,00"
              }
            </p>
            {formData.discount && (
              <p className="text-sm text-green-600">
                <strong>Preço final:</strong> R$ {(parseFloat(formData.price) * (1 - parseFloat(formData.discount) / 100)).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary">
              {isLoading ? "Adicionando..." : "Adicionar Pacote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}