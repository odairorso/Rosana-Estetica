## Diagnóstico Rápido
- A rota existe e está protegida: `src/App.tsx:54` usa `RequireAuth` para `/estoque-loja`.
- O guard `RequireAuth` (src/App.tsx:70–75) redireciona para `/login` quando `session` é `null` e retorna `null` enquanto `loading` é `true`.
- Você está vendo a tela de login (o `div` selecionado é de `src/pages/Login.tsx:63`), indicando que a sessão não foi considerada válida na navegação.
- O cliente do Supabase lança erro se variáveis faltarem (`src/lib/supabaseClient.ts:6–8`). Sessão não carrega se `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` estiverem ausentes/erradas.

## Plano de Correção
1. Pós-login com redirecionamento automático
- Atualizar `src/pages/Login.tsx` para redirecionar ao destino original (ou `/`) após `signInWithPassword` bem-sucedido usando `useNavigate` e `useLocation`.
- Lógica: ler `location.state?.from?.pathname` definido por `RequireAuth` e chamar `navigate(from || "/", { replace: true })`.

2. Feedback de carregamento no guard
- Em `RequireAuth` (src/App.tsx:70–75), mostrar um spinner/lembrete enquanto `loading` em vez de `null`, evitando impressão de "não abre".

3. Verificar variáveis de ambiente do Supabase
- Confirmar `.env` (dev) e variáveis no deploy: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` obrigatórias.
- Conferir `VITE_AUTH_REDIRECT_URL` para flui de `signup/reset` (mesmo origin do app).

4. Validar sessão e navegação
- Após login, garantir que `useAuth().session` atualiza pelo listener (`src/contexts/AuthContext.tsx:24–26`).
- Testar: login → navegação automática para `/estoque-loja` se havia `state.from` ou clique no menu (src/components/salon-sidebar.tsx:44).

5. Conferências opcionais (conteúdo da página)
- RLS de `store_products`: permitir `select` para usuários autenticados; sem isso, a lista pode aparecer vazia.
- Tipos já corrigidos para `uuid` (id como `string`) no contexto/página; validar chamadas.

## Resultado Esperado
- Após login, você é redirecionado automaticamente ao destino solicitado (ex.: `/estoque-loja`).
- Enquanto a sessão é carregada, um indicador aparece em vez de tela em branco.
- Com variáveis corretas, o guard libera a página e ela renderiza normalmente.

## Testes
- Tentar acessar `/estoque-loja` não logado: ver `/login`. Após login, redireciona para `/estoque-loja`.
- Em refresh autenticado, ver spinner curto e depois conteúdo de Estoque Loja.
- Verificar que produtos carregam sem erros de permissão.

Confirma que posso aplicar estas alterações agora?