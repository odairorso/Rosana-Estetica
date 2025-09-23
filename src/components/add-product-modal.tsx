import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    minStock: "",
    price: "",
    supplier: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Cosméticos",
    "Aromaterapia",
    "Materiais",
    "Equipamentos",
    "Limpeza",
    "Descartáveis",
    "Outros"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aqui você pode adicionar a lógica para salvar no banco de dados
      // Por enquanto, vou simular um sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Produto adicionado com sucesso!");
      
      // Reset form
      setFormData({
        name: "",
        category: "",
        quantity: "",
        minStock: "",
        price: "",
        supplier: "",
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error("Erro ao adicionar produto. Tente novamente.");
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
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Creme Hidratante Facial"
              required
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleInputChange("minStock", e.target.value)}
                placeholder="5"
                required
              />
            </div>
          </div>

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
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleInputChange("supplier", e.target.value)}
              placeholder="Nome do fornecedor"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary">
              {isLoading ? "Adicionando..." : "Adicionar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}