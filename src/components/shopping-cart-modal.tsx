import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, Minus, ShoppingCart, Scissors, Package, ShoppingBag, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { formatDateBR } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'procedimento' | 'pacote' | 'produto'
  sessions?: number
}

interface Procedure {
  id: number
  name: string
  price: string
  duration_minutes: number
  category: string
  description: string
}

interface Package {
  id: number
  name: string
  price: string
  sessions: number
  procedures: string[]
  description: string
}

interface Product {
  id: number
  name: string
  unit_price: string
  category: string
  quantity: number
  description: string
}

interface Client {
  id: number
  name: string
  phone: string
}

interface ShoppingCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCartModal = ({ isOpen, onClose }: ShoppingCartModalProps) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [observations, setObservations] = useState('')
  const [activeTab, setActiveTab] = useState('procedimento')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState('')
  
  // Estados para dados do banco
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Carregar dados do banco quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar procedimentos
      const { data: proceduresData, error: proceduresError } = await supabase
        .from('procedures')
        .select('*')
        .eq('active', true);
      
      if (proceduresError) throw proceduresError;
      setProcedures(proceduresData || []);

      // Carregar pacotes
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('active', true);
      
      if (packagesError) throw packagesError;
      setPackages(packagesData || []);

      // Carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('inventory')
        .select('*')
        .eq('active', true);
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Carregar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, phone')
        .eq('active', true);
      
      if (clientsError) throw clientsError;
      setClients(clientsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "procedimento":
        return procedures.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: parseFloat(p.price),
          category: p.category,
          description: p.description
        }));
      case "pacote":
        return packages.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: parseFloat(p.price),
          sessions: p.sessions,
          description: p.description
        }));
      case "produto":
        return products.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: parseFloat(p.unit_price),
          category: p.category,
          stock: p.quantity,
          description: p.description
        }));
      default: return [];
    }
  };

  const addToCart = () => {
    if (!selectedItemId || !price) {
      toast.error("Selecione um item e confirme o preço")
      return
    }

    const currentItems = getCurrentItems()
    const item = currentItems.find(i => i.id === selectedItemId)
    
    if (!item) return

    const itemPrice = parseFloat(price)
    const existingItem = cart.find(cartItem => cartItem.id === selectedItemId && cartItem.type === activeTab)

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === selectedItemId && cartItem.type === activeTab
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ))
    } else {
       const newItem: CartItem = {
         id: selectedItemId,
         name: item.name,
         price: itemPrice,
         quantity,
         type: activeTab as 'procedimento' | 'pacote' | 'produto',
         ...(activeTab === 'pacote' && 'sessions' in item && { sessions: item.sessions })
       }
       setCart([...cart, newItem])
     }

    // Reset form
    setSelectedItemId('')
    setQuantity(1)
    setPrice('')
    toast.success(`${item.name} adicionado ao carrinho`)
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const resetForm = () => {
    setSelectedClientId(null)
    setCart([])
    setPaymentMethod('')
    setObservations('')
    setActiveTab('procedimento')
    setSelectedItemId('')
    setQuantity(1)
    setPrice('')
  }

  const handleFinalizeSale = async () => {
    if (!selectedClientId || cart.length === 0 || !paymentMethod) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Criar uma venda para cada item do carrinho
      for (const item of cart) {
        const saleData: any = {
          client_id: selectedClientId,
          item: item.name,
          type: item.type,
          price: item.price * item.quantity,
          date: formatDateBR(new Date()),
          status: 'pago'
        };

        // Se for um pacote, incluir campos de sessões
        if (item.type === 'pacote' && item.sessions) {
          saleData.sessions = item.sessions;
          saleData.used_sessions = 0; // Iniciar com 0 sessões usadas
        }

        const { error } = await supabase
          .from('sales')
          .insert(saleData);

        if (error) throw error;

        // Se for um produto, atualizar o estoque
        if (item.type === 'produto') {
          const product = products.find(p => p.id.toString() === item.id);
          if (product) {
            const newQuantity = product.quantity - item.quantity;
            const { error: updateError } = await supabase
              .from('inventory')
              .update({ quantity: newQuantity })
              .eq('id', product.id);
            
            if (updateError) throw updateError;
          }
        }
      }

      toast.success('Venda finalizada com sucesso!');
      resetForm();
      // Recarregar dados para atualizar estoque
      loadData();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao finalizar venda');
    }
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

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select 
                value={selectedClientId?.toString() || ""}
                onValueChange={(value) => setSelectedClientId(parseInt(value))}
              >
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

            <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Adicionar Itens ao Carrinho</h3>
            <div className="flex gap-2">
              <Button type="button" variant={activeTab === "procedimento" ? "default" : "outline"} onClick={() => { setActiveTab("procedimento"); setSelectedItemId(""); setPrice(""); }} className="flex items-center gap-2"><Scissors className="w-4 h-4" />Procedimento</Button>
              <Button type="button" variant={activeTab === "pacote" ? "default" : "outline"} onClick={() => { setActiveTab("pacote"); setSelectedItemId(""); setPrice(""); }} className="flex items-center gap-2"><Package className="w-4 h-4" />Pacote</Button>
              <Button type="button" variant={activeTab === "produto" ? "default" : "outline"} onClick={() => { setActiveTab("produto"); setSelectedItemId(""); setPrice(""); }} className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Produto</Button>
            </div>

            <div className="space-y-2">
              <Label>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} *</Label>
              <Select 
                value={selectedItemId} 
                onValueChange={(value) => {
                  setSelectedItemId(value);
                  const selectedItem = getCurrentItems().find(item => item.id === value);
                  if (selectedItem) setPrice(selectedItem.price.toString());
                }}
              >
                <SelectTrigger><SelectValue placeholder={`Selecione um ${activeTab}...`} /></SelectTrigger>
                <SelectContent>
                  {getCurrentItems().map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name} - R$ {item.price.toFixed(2).replace(".", ",")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>

            <Button onClick={addToCart} className="w-full"><Plus className="w-4 h-4 mr-2" />Adicionar ao Carrinho</Button>
          </div>

          {cart.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Carrinho ({cart.length} itens)</h3>
              {cart.map((item) => (
                <Card key={item.id} className="p-4"><CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.type}</Badge>
                          {item.sessions && <Badge variant="secondary">{item.sessions} sessões</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2).replace(".", ",")} cada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    <div className="text-right mt-2"><span className="font-semibold">Subtotal: R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span></div>
                </CardContent></Card>
              ))}
              <div className="text-right"><div className="text-xl font-bold">Total: R$ {calculateTotal().toFixed(2).replace(".", ",")}</div></div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Observações sobre a venda..." rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleFinalizeSale} className="bg-gradient-primary">Finalizar Venda</Button>
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};