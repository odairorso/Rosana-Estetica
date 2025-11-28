import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSalon } from "@/contexts/SalonContext";

const formatBR = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

export default function Relatorio() {
  const { sales, storeSales } = useSalon();
  const [scope, setScope] = useState<"estetica" | "loja" | "tudo">("tudo");

  const dataEstetica = sales.map(s => ({ date: s.date, total: Number((s.price || "0").toString().replace("R$ ", "").replace(",", ".")) }));
  const dataLoja = (storeSales || []).map(s => ({ date: new Date(s.date).toISOString().slice(0,10), total: Number(s.total || 0) }));

  const filterByScope = () => {
    if (scope === "estetica") return dataEstetica;
    if (scope === "loja") return dataLoja;
    return [...dataEstetica, ...dataLoja];
  };

  const rows = filterByScope().sort((a, b) => a.date.localeCompare(b.date));
  const total = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Relatórios</h2>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Relatório Financeiro</h1>
                <p className="text-muted-foreground">Escolha o escopo para visualizar os totais</p>
              </div>
              <div className="w-48">
                <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escopo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tudo">Tudo</SelectItem>
                    <SelectItem value="estetica">Estética</SelectItem>
                    <SelectItem value="loja">Loja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatBR(total)}</div>
                  <p className="text-xs text-muted-foreground">Somatório de vendas no período carregado</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Estética</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatBR(dataEstetica.reduce((s, r) => s + r.total, 0))}</div>
                  <p className="text-xs text-muted-foreground">Total de vendas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Loja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatBR(dataLoja.reduce((s, r) => s + r.total, 0))}</div>
                  <p className="text-xs text-muted-foreground">Total de vendas</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle>Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rows.length === 0 ? (
                    <div className="text-muted-foreground">Sem registros</div>
                  ) : (
                    rows.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded-md">
                        <span className="text-sm text-muted-foreground">{row.date}</span>
                        <span className="font-medium">{formatBR(row.total)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
