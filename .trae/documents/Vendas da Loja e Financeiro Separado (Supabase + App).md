## Objetivos
- Adicionar vendas de roupas na aba `Caixa`, usando os mesmos clientes.
- Separar financeiro da Estética e da Loja sem misturar dados.
- Completar o app com Estoque, Venda, Financeiro e Relatórios para ambos os escopos.

## Modelo de Dados (Supabase)
### Tabelas da Loja
- `store_products`: id, name, sku, size, color, category, price, cost_price, stock, active, created_at.
- `store_inventory_movements`: id, product_id → `store_products.id`, type ('entrada'|'saida'|'ajuste'), quantity, unit_cost, note, created_at, created_by.
- `store_sales`: id, client_id → `clients.id`, date, status ('aberta'|'paga'|'cancelada'), payment_method, total, discount, note, created_at.
- `store_sale_items`: id, sale_id → `store_sales.id`, product_id → `store_products.id`, quantity, unit_price, subtotal.

### Financeiro Unificado com Escopo
- `financial_transactions`: id, scope ('estetica'|'loja'), source ('sale'|'appointment'|'other'), source_id, type ('receita'|'despesa'), method ('pix'|'cartao'|'dinheiro'|'boleto'|... ), amount, status ('pendente'|'pago'|'cancelado'), due_date, paid_at, created_at, note.
- Índices por `scope`, `status`, `created_at`; FKs opcionais para `store_sales` e `sales` (estética) via `source_id` + `scope`.

### Views de Apoio (opcional)
- `v_store_revenue_monthly` e `v_estetica_revenue_monthly`: agregações mensais por escopo.
- `v_inventory_balance`: saldo por produto a partir de `store_inventory_movements`.

## Segurança (RLS)
- Políticas permissivas para usuários autenticados: SELECT/INSERT/UPDATE/DELETE em `store_*` e leitura/lançamento em `financial_transactions`.
- Restringir DELETE em vendas para evitar perda acidental: permitir cancelamento via `status`.
- Log de movimentos de estoque imutável (sem UPDATE), apenas INSERT; correções via `ajuste`.

## Integração no App (Frontend)
### Caixa
- Alternador de escopo: "Estética" x "Loja".
- Carrinho multi-item:
  - Estética: itens já existentes (procedimentos/pacotes/produto de estética).
  - Loja: itens de `store_products` com preço e variações (tamanho/cor).
- Seleção de cliente a partir de `clients`.
- Finalização:
  - Persistir no Supabase: `store_sales` + `store_sale_items` (escopo Loja) ou `sales` (Estética).
  - Lançar `financial_transactions` com `scope` correspondente.
  - Movimentar estoque: `store_inventory_movements` (tipo `saida`).

### Estoque (Loja)
- CRUD `store_products`.
- Lançar entrada/saída/ajuste em `store_inventory_movements`.
- Exibir saldo por produto e histórico.

### Financeiro
- Filtros por `scope` (Loja/Estética), período e método de pagamento.
- Resumo (Receita, A Receber, Despesas, Lucro) por escopo.
- Exportação CSV e detalhamento por origem (vendas/atendimentos).

### Dashboard
- Cartões separados por escopo e consolidados.
- Gráfico mensal (linhas/colunas) para receita Loja e Estética.
- "Top produtos" (Loja) e "Top procedimentos" (Estética).

## Fluxos Principais
- Venda Loja: selecionar cliente → adicionar produtos → aplicar desconto → método de pagamento → salvar venda → gerar `financial_transactions` → movimentar estoque.
- Ajuste Estoque: entrada (compra/fornecedor), saída (extravio/doação), ajuste (correção)
- Relatórios: por escopo, período e categoria; impressão/CSV.

## Implementação (Passos)
1. Supabase
   - Criar tabelas `store_products`, `store_inventory_movements`, `store_sales`, `store_sale_items`, `financial_transactions`.
   - FKs e índices, RLS políticas para autenticados.
2. Backend Client/Contexto (React Query)
   - Adicionar no `SalonContext` queries/mutations para produtos, movimentos, vendas da loja, transações financeiras.
   - Remover dados mockados do carrinho e integrar com `store_products`.
3. UI/Pages
   - Caixa: alternador de escopo, carrinho unificado, finalização com persistência.
   - Estoque: lista, criação/edição, lançamentos, saldo.
   - Financeiro: filtros, cards, tabela, export.
   - Dashboard: cartões e gráficos por escopo.
4. Testes
   - Fluxos de venda e atualização de estoque.
   - Relatórios e filtros por escopo.
   - RLS acesso apenas autenticado.

## Padrões e Decisões
- `scope` controla separação total de financeiro.
- `store_inventory_movements` é fonte da verdade do estoque (não atualizar `stock` diretamente; manter coluna de conveniência e recalcular via view).
- Cancelamento de venda altera `status` e estorna movimento de estoque com novo lançamento (`entrada`).

## Próximos Passos Após Aprovação
- Criar as tabelas e políticas no Supabase.
- Implementar contexto e UI nas páginas `Caixa`, `Estoque`, `Financeiro`, `Dashboard`.
- Popular alguns produtos de exemplo para validação.

Confirma que posso executar a criação das tabelas no Supabase e seguir para as integrações no app?