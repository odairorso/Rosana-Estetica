import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSalon } from "@/contexts/SalonContext";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSave?: (productData: any) => Promise<void>;
}

export function AddProductModal({ isOpen, onClose, product, onSave }: AddProductModalProps) {
  const { addStoreProduct } = useSalon();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    size: product?.size || "",
    color: product?.color || "",
    category: product?.category || "",
    stock: product?.stock?.toString() || "",
    price: product?.price?.toString() || "",
    cost_price: product?.cost_price?.toString() || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Camisetas",
    "Calças",
    "Vestidos",
    "Saias",
    "Blusas",
    "Jaquetas",
    "Acessórios",
    "Calçados",
    "Outros"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        sku: formData.sku || undefined,
        size: formData.size || undefined,
        color: formData.color || undefined,
        category: formData.category || undefined,
        price: Number(formData.price || 0),
        cost_price: formData.cost_price ? Number(formData.cost_price) : undefined,
        stock: formData.stock ? parseInt(formData.stock, 10) : 0,
        active: true,
      };

      if (onSave) {
        await onSave(productData);
      } else {
        await addStoreProduct(productData);
      }

      toast.success("Produto adicionado com sucesso!");
      
      // Reset form
      setFormData({
        name: "",
        sku: "",
        size: "",
        color: "",
        category: "",
        stock: "",
        price: "",
        cost_price: "",
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
          <DialogTitle>{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Camiseta Básica"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={formData.sku} onChange={(e) => handleInputChange("sku", e.target.value)} placeholder="Código do produto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Input id="size" value={formData.size} onChange={(e) => handleInputChange("size", e.target.value)} placeholder="Ex: P, M, G" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" value={formData.color} onChange={(e) => handleInputChange("color", e.target.value)} placeholder="Ex: Azul" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-select">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger id="category-select">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Inicial</Label>
              <Input id="stock" type="number" min="0" value={formData.stock} onChange={(e) => handleInputChange("stock", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_price">Custo (R$)</Label>
              <Input id="cost_price" type="number" step="0.01" min="0" value={formData.cost_price} onChange={(e) => handleInputChange("cost_price", e.target.value)} placeholder="0,00" />
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary">
              {isLoading ? "Salvando..." : (product ? "Salvar Alterações" : "Adicionar Produto")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}