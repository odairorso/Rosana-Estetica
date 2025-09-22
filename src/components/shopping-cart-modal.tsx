import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, ShoppingCart, Scissors, Package, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSalon } from "@/contexts/SalonContext";

interface CartItem {
  id: string;
  name: string;
  type: "procedimento" | "pacote" | "produto";
  price: number;
  quantity: number;
  sessions?: number;
}

// Dados simulados para demonstração
const availableProcedures = [
  { id: "1", name: "Limpeza de Pele", price: 120.00 },
  { id: "2", name: "Hidratação Facial", price: 80.00 },
  { id: "3", name: "Peeling Químico", price: 200.00 },
  { id: "4", name: "Massagem Relaxante", price: 150.00 },
  { id: "5", name: "Drenagem Linfática", price: 100.00 },
];

const availablePackages = [
  { id: "1", name: "Pacote Relaxamento", price: 300.00, sessions: 5 },
  { id: "2", name: "Pacote Facial Completo", price: 450.00, sessions: 3 },
  { id: "3", name: "Pacote Corporal", price: 600.00, sessions: 8 },
  { id: "4", name: "Pacote Anti-idade", price: 800.00, sessions: 6 },
];

const availableProducts = [
  { id: "1", name: "Creme Hidratante", price: 45.00 },
  { id: "2", name: "Protetor Solar", price: 60.00 },
  { id: "3", name: "Sérum Vitamina C", price: 85.00 },
  { id: "4", name: "Tônico Facial", price: 35.00 },
  { id: "5", name: "Esfoliante Corporal", price: 55.00 },
];

interface ProcedureItem {
  id: string;
  name: string;
  price: number;
}

interface PackageItem {
  id: string;
  name: string;
  price: number;
  sessions: number;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
}

interface ShoppingCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCartModal = ({ isOpen, onClose }: ShoppingCartModalProps) => {
  const { toast } = useToast();
  const { clients, addSale } = useSalon();
  
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  
  // Abas para seleção de tipo
  const [activeTab, setActiveTab] = useState<"procedimento" | "pacote" | "produto">("procedimento");
  
  // Seleções para adicionar item
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<string>("");

  const getCurrentItems = () => {
    switch (activeTab) {
      case "procedimento":
        return availableProcedures;
      case "pacote":
        return availablePackages;
      case "produto":
        return availableProducts;
      default:
        return [];
    }
  };

  const addToCart = () => {
    const currentItems = getCurrentItems();
    const selectedItem = currentItems.find(item => item.id === selectedItemId);
    
    if (!selectedItem || !price) {
      toast({
        title: "Erro",
        description: "Selecione um item e confirme o preço",
        variant: "destructive",
      });
      return;
    }

    const item: CartItem = {
      id: Date.now().toString(),
      name: selectedItem.name,
      type: activeTab,
      price: parseFloat(price),
      quantity: quantity,
      ...(activeTab === "pacote" && 'sessions' in selectedItem && { sessions: (selectedItem as PackageItem).sessions })
    };

    setCart(prev => [...prev, item]);
    setSelectedItemId("");
    setPrice("");
    setQuantity(1);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleFinalizeSale = () => {
    if (!selectedClientId || cart.length === 0 || !paymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione cliente, adicione itens ao carrinho e escolha forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    const selectedClient = clients.find(c => c.id === selectedClientId);
    if (!selectedClient) return;

    // Criar uma venda para cada item do carrinho
    cart.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        const sale = {
          client: selectedClient.name,
          clientId: selectedClientId,
          item: item.name,
          type: item.type,
          price: `R$ ${item.price.toFixed(2).replace(".", ",")}`,
          date: "Hoje",
          status: "pago" as const,
          ...(item.type === "pacote" && {
            sessions: item.sessions || 1,
            usedSessions: 0,
          }),
        };
        addSale(sale);
      }
    });

    // Reset form
    setCart([]);
    setSelectedClientId(0);
    setPaymentMethod("");
    setObservations("");
    onClose();

    toast({
      title: "Sucesso!",
      description: `${cart.length} item(s) vendido(s) e adicionado(s) aos agendamentos`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Nova Venda - Carrinho
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={selectedClientId.toString()} onValueChange={(value) => setSelectedClientId(parseInt(value))}>
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

          {/* Adicionar Itens ao Carrinho */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Adicionar Itens ao Carrinho</h3>
            
            {/* Abas de Tipos */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={activeTab === "procedimento" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("procedimento");
                  setSelectedItemId("");
                  setPrice("");
                }}
                className="flex items-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                Procedimento
              </Button>
              <Button
                type="button"
                variant={activeTab === "pacote" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("pacote");
                  setSelectedItemId("");
                  setPrice("");
                }}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Pacote
              </Button>
              <Button
                type="button"
                variant={activeTab === "produto" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("produto");
                  setSelectedItemId("");
                  setPrice("");
                }}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Produto
              </Button>
            </div>

            {/* Seleção do Item */}
            <div className="space-y-2">
              <Label>{activeTab} *</Label>
              <Select 
                value={selectedItemId} 
                onValueChange={(value) => {
                  setSelectedItemId(value);
                  const selectedItem = getCurrentItems().find(item => item.id === value);
                  if (selectedItem) {
                    setPrice(selectedItem.price.toString());
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione um ${activeTab}...`} />
                </SelectTrigger>
                <SelectContent>
                  {getCurrentItems().map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - R$ {item.price.toFixed(2).replace(".", ",")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={addToCart} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>

          {/* Carrinho */}
          {cart.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Carrinho ({cart.length} itens)</h3>
              {cart.map((item) => (
                <Card key={item.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.type === 'pacote' ? 'Pacote' : 'Procedimento'}</Badge>
                          {item.sessions && <Badge variant="secondary">{item.sessions} sessões</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2).replace(".", ",")} cada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="font-semibold">Subtotal: R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-right">
                <div className="text-xl font-bold">Total: R$ {calculateTotal().toFixed(2).replace(".", ",")}</div>
              </div>
            </div>
          )}

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações sobre a venda..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleFinalizeSale} className="bg-gradient-primary">
              Finalizar Venda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};