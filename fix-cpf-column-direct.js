import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais fornecidas
const supabaseUrl = 'https://rsbssxvnxpewijvpzlsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYnNzeHZueHBld2lqdnB6bHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Njc0MzcsImV4cCI6MjA3NDE0MzQzN30.PgeSUttsRUmmdYx_5Tv2RrliaRh3Iwo4GeThbkaoVSI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCpfColumn() {
  console.log('🔧 Iniciando correção da coluna CPF...\n');

  try {
    // 1. Verificar se a coluna cpf já existe
    console.log('1. Verificando se a coluna CPF já existe...');
    
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('cpf')
      .limit(1);

    if (!testError) {
      console.log('✅ A coluna CPF já existe na tabela clients!');
      console.log('Testando inserção de um cliente com CPF...\n');
      
      // Testar inserção com CPF
      const testClient = {
        nome: 'Teste CPF',
        telefone: '11999999999',
        email: 'teste@teste.com',
        cpf: '123.456.789-00',
        rua: 'Rua Teste',
        numero: '123',
        bairro: 'Bairro Teste',
        cidade: 'Cidade Teste',
        estado: 'SP',
        cep: '12345-678'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('clients')
        .insert([testClient])
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir cliente de teste:', insertError);
      } else {
        console.log('✅ Cliente de teste inserido com sucesso!');
        console.log('Dados inseridos:', insertData);
        
        // Limpar o cliente de teste
        if (insertData && insertData[0]) {
          await supabase
            .from('clients')
            .delete()
            .eq('id', insertData[0].id);
          console.log('🧹 Cliente de teste removido.');
        }
      }
      return;
    }

    // 2. Se chegou aqui, a coluna não existe
    console.log('❌ A coluna CPF não existe. Tentando adicionar...\n');

    // 3. Tentar usar RPC para executar SQL
    console.log('2. Tentando adicionar coluna via RPC...');
    
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cpf TEXT;' 
      });

    if (!rpcError) {
      console.log('✅ Coluna CPF adicionada via RPC!');
    } else {
      console.log('❌ RPC não disponível:', rpcError.message);
      
      // 4. Tentar usar a função sql diretamente
      console.log('3. Tentando usar função sql...');
      
      const { data: sqlData, error: sqlError } = await supabase
        .from('_sql')
        .insert([{
          query: 'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cpf TEXT;'
        }]);

      if (!sqlError) {
        console.log('✅ Coluna CPF adicionada via função sql!');
      } else {
        console.log('❌ Função sql não disponível:', sqlError.message);
        
        // 5. Instruções manuais
        console.log('\n📋 INSTRUÇÕES PARA ADICIONAR A COLUNA MANUALMENTE:');
        console.log('═══════════════════════════════════════════════════');
        console.log('1. Acesse o Supabase Dashboard:');
        console.log('   https://supabase.com/dashboard/project/rsbssxvnxpewijvpzlsg');
        console.log('');
        console.log('2. Vá para "SQL Editor" no menu lateral');
        console.log('');
        console.log('3. Execute o seguinte comando SQL:');
        console.log('   ALTER TABLE public.clients ADD COLUMN cpf TEXT;');
        console.log('');
        console.log('4. Clique em "Run" para executar');
        console.log('');
        console.log('5. Execute este script novamente para verificar');
        console.log('═══════════════════════════════════════════════════');
      }
    }

    // 6. Verificar novamente se a coluna foi adicionada
    console.log('\n4. Verificando se a coluna foi adicionada...');
    
    const { data: finalTestData, error: finalTestError } = await supabase
      .from('clients')
      .select('cpf')
      .limit(1);

    if (!finalTestError) {
      console.log('✅ Sucesso! A coluna CPF foi adicionada à tabela clients!');
      
      // Testar inserção
      console.log('\n5. Testando inserção de cliente com CPF...');
      const testClient = {
        nome: 'Teste Final CPF',
        telefone: '11888888888',
        email: 'teste.final@teste.com',
        cpf: '987.654.321-00',
        rua: 'Rua Final',
        numero: '456',
        bairro: 'Bairro Final',
        cidade: 'Cidade Final',
        estado: 'RJ',
        cep: '87654-321'
      };

      const { data: finalInsertData, error: finalInsertError } = await supabase
        .from('clients')
        .insert([testClient])
        .select();

      if (finalInsertError) {
        console.error('❌ Erro ao inserir cliente final:', finalInsertError);
      } else {
        console.log('✅ Cliente final inserido com sucesso!');
        console.log('Dados inseridos:', finalInsertData);
        
        // Limpar o cliente de teste
        if (finalInsertData && finalInsertData[0]) {
          await supabase
            .from('clients')
            .delete()
            .eq('id', finalInsertData[0].id);
          console.log('🧹 Cliente de teste final removido.');
        }
      }
    } else {
      console.log('❌ A coluna CPF ainda não existe. Execute as instruções manuais acima.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a correção
fixCpfColumn();