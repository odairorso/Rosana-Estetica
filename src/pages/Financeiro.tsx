import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon, Search, Filter, Trash2 } from "lucide-react";
import { useSalon, FinancialTransaction } from "@/contexts/SalonContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isSameMonth, isSameYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Financeiro = () => {
  const { financialTransactions, addFinancialTransaction, deleteFinancialTransaction, isLoadingFinancialTransactions } = useSalon();
  const { toast } = useToast();
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "receita" | "despesa">("all");

  // Form State
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({
    transaction_type: "despesa",
    scope: "estetica",
    category: "Outros",
    payment_method: "dinheiro",
    payment_status: "paid",
    amount: 0,
    description: "",
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter(t => {
      const transactionDate = parseISO(t.transaction_date || t.created_at);
      const [year, month] = selectedMonth.split('-');
      const filterDate = new Date(parseInt(year), parseInt(month) - 1);

      const matchesMonth = isSameMonth(transactionDate, filterDate) && isSameYear(transactionDate, filterDate);
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = transactionTypeFilter === "all" || t.transaction_type === transactionTypeFilter;

      return matchesMonth && matchesSearch && matchesType;
    });
  }, [financialTransactions, selectedMonth, searchTerm, transactionTypeFilter]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach(t => {
      if (t.transaction_type === 'receita') {
        income += Number(t.amount);
      } else {
        expense += Number(t.amount);
      }
    });

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.description || !newTransaction.amount) {
        toast({
          title: "Erro",
          description: "Preencha a descrição e o valor.",
          variant: "destructive"
        });
        return;
      }

      await addFinancialTransaction({
        ...newTransaction as any, // Casting to any to avoid strict type checking for now
        amount: Number(newTransaction.amount)
      });

      toast({
        title: "Sucesso",
        description: "Lançamento adicionado com sucesso."
      });
      setIsNewTransactionModalOpen(false);
      setNewTransaction({
        transaction_type: "despesa",
        scope: "estetica",
        category: "Outros",
        payment_method: "dinheiro",
        payment_status: "paid",
        amount: 0,
        description: "",
        transaction_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar lançamento.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      try {
        await deleteFinancialTransaction(id);
        toast({
          title: "Sucesso",
          description: "Lançamento excluído com sucesso."
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Erro ao excluir lançamento.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Financeiro</h2>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-6 overflow-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fluxo de Caixa</h1>
                <p className="text-muted-foreground">Gerencie as entradas e saídas do salão</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-[160px]"
                />
                <Button 
                  className="bg-gradient-primary text-primary-foreground flex-1 md:flex-none"
                  onClick={() => setIsNewTransactionModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Lançamento
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Entradas
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {summary.income.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Receitas do mês
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Saídas
                  </CardTitle>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {summary.expense.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Despesas do mês
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Saldo
                  </CardTitle>
                  <Wallet className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    summary.balance >= 0 ? "text-blue-600" : "text-red-600"
                  )}>
                    R$ {summary.balance.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Resultado do período
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 p-4 rounded-lg border border-border/50">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar lançamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  variant={transactionTypeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransactionTypeFilter("all")}
                  className="flex-1"
                >
                  Todos
                </Button>
                <Button 
                  variant={transactionTypeFilter === "receita" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransactionTypeFilter("receita")}
                  className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                >
                  Receitas
                </Button>
                <Button 
                  variant={transactionTypeFilter === "despesa" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransactionTypeFilter("despesa")}
                  className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                >
                  Despesas
                </Button>
              </div>
            </div>

            {/* Transactions List */}
            <Card className="border-0 shadow-md bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Forma Pagto</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingFinancialTransactions ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum lançamento encontrado neste período.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            {format(parseISO(t.transaction_date || t.created_at), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{t.description}</span>
                              {t.reference_type && (
                                <span className="text-xs text-muted-foreground capitalize">
                                  Ref: {t.reference_type.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{t.category}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{t.payment_method}</TableCell>
                          <TableCell className={cn(
                            "text-right font-bold",
                            t.transaction_type === 'receita' ? "text-green-600" : "text-red-600"
                          )}>
                            {t.transaction_type === 'receita' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteTransaction(t.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* New Transaction Modal */}
        <Dialog open={isNewTransactionModalOpen} onOpenChange={setIsNewTransactionModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Lançamento</DialogTitle>
              <DialogDescription>
                Adicione uma receita ou despesa manualmente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={newTransaction.transaction_type} 
                    onValueChange={(val: any) => setNewTransaction({...newTransaction, transaction_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Área</Label>
                  <Select 
                    value={newTransaction.scope} 
                    onValueChange={(val: any) => setNewTransaction({...newTransaction, scope: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estetica">Estética</SelectItem>
                      <SelectItem value="loja">Loja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Input 
                  type="date" 
                  value={newTransaction.transaction_date} 
                  onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input 
                  placeholder="Ex: Conta de Luz" 
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(val) => setNewTransaction({...newTransaction, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venda de Produtos">Venda de Produtos</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Contas de Consumo">Contas de Consumo</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select 
                  value={newTransaction.payment_method} 
                  onValueChange={(val) => setNewTransaction({...newTransaction, payment_method: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTransactionModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddTransaction}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </SidebarProvider>
  );
};

export default Financeiro;
