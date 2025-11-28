import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Edit, Trash2, TrendingUp, TrendingDown, DollarSign as DollarSignIcon } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";
import { StoreProduct } from "@/contexts/SalonContext";
import { AddProductModal } from "@/components/add-product-modal";
import { toast } from "@/components/ui/use-toast";

export default function EstoqueLoja() {
  const { storeProducts, fetchStoreProducts, updateStoreProduct, deleteStoreProduct } = useSalon();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  useEffect(() => {
    fetchStoreProducts();
  }, [fetchStoreProducts]);

  const filteredProducts = storeProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: StoreProduct) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteStoreProduct(productId);
        toast({
          title: "Produto excluído",
          description: "Produto removido do estoque da loja",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o produto",
          variant: "destructive",
        });
      }
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { status: "sem-estoque", label: "Sem Estoque", color: "destructive" };
    if (stock <= minStock) return { status: "baixo", label: "Baixo", color: "warning" };
    return { status: "normal", label: "Normal", color: "success" };
  };

  const totalValue = filteredProducts.reduce((sum, product) => 
    sum + (product.stock * product.price), 0
  );

  const lowStockProducts = filteredProducts.filter(product => 
    product.stock <= (product.min_stock || 5) && product.stock > 0
  );

  const outOfStockProducts = filteredProducts.filter(product => 
    product.stock === 0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estoque da Loja</h1>
          <p className="text-muted-foreground">Gerencie os produtos da loja de roupas</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos com Baixo Estoque</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Sem Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Busca */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar produtos por nome, SKU ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.min_stock || 5);
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {product.category} • {product.size}
                    </CardDescription>
                    {product.sku && (
                      <CardDescription className="text-xs">SKU: {product.sku}</CardDescription>
                    )}
                  </div>
                  <Badge variant={stockStatus.color as any} className="text-xs">
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estoque:</span>
                  <span className={`font-semibold ${
                    product.stock <= 0 ? 'text-red-500' : 
                    product.stock <= (product.min_stock || 5) ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {product.stock} un
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço de Custo:</span>
                  <span className="font-semibold">R$ {(product.cost_price || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço de Venda:</span>
                  <span className="font-semibold text-green-600">R$ {product.price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Margem:</span>
                  <span className="font-semibold">
                    {product.cost_price ? (((product.price - product.cost_price) / product.price * 100).toFixed(0) + '%') : 'N/A'}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditProduct(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "Tente ajustar sua busca" : "Comece adicionando produtos à loja"}
          </p>
          {!searchTerm && (
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          )}
        </div>
      )}

      {/* Modal de Adicionar/Editar Produto */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        product={editingProduct}
        onSave={async (productData) => {
          try {
            if (editingProduct) {
              await updateStoreProduct(editingProduct.id, productData);
              toast({
                title: "Produto atualizado",
                description: "Produto atualizado com sucesso",
              });
            } else {
              // O modal já chama addStoreProduct internamente
              toast({
                title: "Produto criado",
                description: "Novo produto adicionado ao estoque da loja",
              });
            }
            setIsAddModalOpen(false);
            fetchStoreProducts();
          } catch (error) {
            toast({
              title: "Erro ao salvar",
              description: "Não foi possível salvar o produto",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}