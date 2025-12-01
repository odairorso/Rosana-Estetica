# Documento de Requisitos do Produto (PRD)
## Sistema de Gestão - Clínica Estética Rosana

**Versão:** 1.0
**Data:** 01/12/2025
**Status:** Em Desenvolvimento

---

## 1. Introdução

### 1.1 Objetivo
Desenvolver um sistema web integrado para gestão completa da "Clínica Estética Rosana", centralizando o controle de agendamentos, clientes, vendas (serviços e produtos), estoque e finanças. O objetivo é otimizar a operação diária, reduzir erros manuais e fornecer insights para a tomada de decisão.

### 1.2 Escopo
O sistema abrange desde o agendamento de clientes e execução de serviços até a venda de produtos de home care (loja), controle de estoque (consumo interno e revenda) e fluxo de caixa.

---

## 2. Perfis de Usuário

*   **Administrador/Gestor:** Acesso total a todas as funcionalidades, incluindo configurações sensíveis, relatórios financeiros completos e gestão de usuários.
*   **Recepcionista/Vendedor:** Foco em agendamento, cadastro de clientes, vendas (Caixa) e consulta de preços.
*   **Profissional de Estética:** Visualização de agenda, registro de evolução de tratamentos e consumo de materiais (Estoque Interno).

*(Nota: Atualmente o sistema implementa autenticação via Supabase, com permissões gerenciadas via RLS - Row Level Security).*

---

## 3. Requisitos Funcionais

### 3.1 Autenticação e Segurança
*   **Login:** Acesso via e-mail e senha.
*   **Recuperação de Senha:** Fluxo de "Esqueci minha senha" via e-mail.
*   **Logout:** Encerrar sessão segura.
*   **Segurança de Dados:** Isolamento de dados via RLS no banco de dados.

### 3.2 Dashboard (Visão Geral)
*   **KPIs:** Exibição de métricas chave (Vendas do dia, Agendamentos, Faturamento mensal).
*   **Agenda do Dia:** Visualização rápida dos próximos compromissos.
*   **Metas:** Acompanhamento visual de metas mensais.
*   **Ações Rápidas:** Atalhos para Nova Venda, Novo Agendamento, Novo Cliente.
*   **Alertas:** Notificações de estoque baixo ou contas a pagar.

### 3.3 Gestão de Clientes (CRM)
*   **Cadastro:** Inserir novos clientes com dados pessoais (Nome, Telefone, E-mail, Endereço, CPF).
*   **Histórico:** Visualizar histórico de agendamentos e compras de cada cliente.
*   **Edição/Exclusão:** Atualizar dados ou remover registros.

### 3.4 Agendamentos
*   **Calendário:** Visualização de horários disponíveis e ocupados.
*   **Agendar Serviço:** Vincular Cliente + Procedimento + Profissional + Data/Hora.
*   **Status:** Gerenciar estados do agendamento (Confirmado, Pendente, Concluído, Cancelado/Faltou).
*   **Pacotes:** Controle de sessões utilizadas em pacotes contratados.

### 3.5 Caixa (Ponto de Venda - PDV)
*   **Venda de Serviços:** Lançamento de procedimentos realizados avulsos.
*   **Venda de Pacotes:** Venda de combos de serviços com controle de sessões.
*   **Venda de Produtos (Loja):** Venda de itens de revenda (home care).
*   **Carrinho:** Adição de múltiplos itens na mesma venda.
*   **Pagamento:** Registro de formas de pagamento (Dinheiro, Cartão de Crédito, Débito, PIX).
*   **Histórico de Vendas:** Listagem de vendas realizadas com opção de **Exclusão** (estorno) e detalhes.

### 3.6 Gestão de Catálogo
*   **Procedimentos:** Cadastro de serviços com Nome, Preço, Duração e Categoria.
*   **Pacotes:** Criação de pacotes promocionais (Quantidade de sessões, Validade).

### 3.7 Estoque
O sistema possui dois módulos distintos de estoque:
1.  **Estoque de Uso Interno (Profissional):**
    *   Controle de insumos usados nos procedimentos (cremes, descartáveis, etc.).
    *   Cadastro de produtos com custo, fornecedor e validade.
    *   Baixa manual ou automática por procedimento (futuro).
2.  **Estoque Loja (Revenda):**
    *   Produtos destinados à venda final para o cliente.
    *   Controle de preço de custo vs. preço de venda (margem).
    *   Baixa automática ao realizar venda no Caixa.

### 3.8 Financeiro
*   **Fluxo de Caixa:** Registro de todas as entradas (vendas) e saídas (despesas).
*   **Contas a Pagar/Receber:** Gestão de lançamentos futuros.
*   **Relatórios:** DRE simplificado, faturamento por período.

---

## 4. Requisitos Não-Funcionais

*   **Interface (UI/UX):** Design moderno, responsivo e intuitivo, utilizando componentes Shadcn/UI e ícones Lucide.
*   **Desempenho:** Carregamento rápido das páginas (SPA) e consultas otimizadas ao banco de dados.
*   **Confiabilidade:** O sistema deve garantir a integridade das transações financeiras e de estoque (uso de transações atômicas onde possível).
*   **Disponibilidade:** Sistema web acessível 24/7.

---

## 5. Arquitetura e Tecnologias

### 5.1 Frontend
*   **Framework:** React (com Vite).
*   **Linguagem:** TypeScript.
*   **Estilização:** Tailwind CSS.
*   **Componentes:** Shadcn/UI (baseado em Radix UI).
*   **Gerenciamento de Estado/Data Fetching:** React Query (TanStack Query) + Context API.
*   **Roteamento:** React Router.

### 5.2 Backend & Banco de Dados
*   **Plataforma:** Supabase (BaaS).
*   **Banco de Dados:** PostgreSQL.
*   **Autenticação:** Supabase Auth.
*   **API:** Supabase JS Client (REST/Realtime).

### 5.3 Modelo de Dados (Principais Entidades)
*   `clients`: Dados dos clientes.
*   `sales`: Vendas de serviços e pacotes.
*   `appointments`: Agendamentos.
*   `procedures`: Catálogo de serviços.
*   `packages`: Catálogo de pacotes.
*   `store_products`: Catálogo e estoque de produtos para revenda.
*   `store_sales`: Cabeçalho das vendas de produtos.
*   `store_sale_items`: Itens das vendas de produtos.
*   `esthetic_products`: Estoque de uso interno.
*   `financial_transactions`: Registro unificado de movimentações financeiras.

---

## 6. Roadmap e Melhorias Futuras

*   **Relatórios Avançados:** Gráficos de desempenho por profissional e sazonalidade.
*   **Comissões:** Cálculo automático de comissão para profissionais.
*   **Integração WhatsApp:** Lembretes automáticos de agendamento.
*   **Nota Fiscal:** Integração para emissão de NF-e/NFC-e.
