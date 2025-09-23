import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProcedureModal({ isOpen, onClose }: AddProcedureModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const categories = [
    "Facial",
    "Corporal",
    "Estética",
    "Relaxamento",
    "Anti-idade",
    "Limpeza",
    "Hidratação",
    "Outros"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('procedures')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes),
          category: formData.category,
          active: true
        }]);

      if (error) throw error;

      toast.success("Procedimento adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
        category: "",
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar procedimento:', error);
      toast.error("Erro ao adicionar procedimento. Tente novamente.");
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
          <DialogTitle>Adicionar Novo Procedimento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Procedimento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Limpeza de Pele"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o procedimento..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
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
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange("duration_minutes", e.target.value)}
                placeholder="60"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-pink-500 hover:bg-pink-600">
              {isLoading ? "Adicionando..." : "Adicionar Procedimento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}