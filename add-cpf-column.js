import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCpfColumn() {
  try {
    console.log('🔧 Adicionando coluna CPF na tabela clients...\n');

    // SQL para adicionar a coluna CPF
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cpf TEXT;`
    });

    if (error) {
      console.error('❌ Erro ao adicionar coluna CPF:', error);
      console.log('📝 Detalhes do erro:', JSON.stringify(error, null, 2));
      
      // Tentar uma abordagem alternativa usando uma função personalizada
      console.log('\n🔄 Tentando abordagem alternativa...');
      
      // Vamos tentar usar uma query direta (isso pode não funcionar dependendo das permissões)
      const { data: altData, error: altError } = await supabase
        .from('clients')
        .select('cpf')
        .limit(1);

      if (altError && altError.message.includes('cpf')) {
        console.log('✅ Confirmado: coluna CPF não existe');
        console.log('📋 Você precisa adicionar a coluna CPF manualmente no Supabase Dashboard');
        console.log('🔗 SQL para executar no SQL Editor do Supabase:');
        console.log('   ALTER TABLE public.clients ADD COLUMN cpf TEXT;');
      } else {
        console.log('✅ Coluna CPF já existe ou foi adicionada com sucesso!');
      }
    } else {
      console.log('✅ Coluna CPF adicionada com sucesso!');
      console.log('📋 Resultado:', data);
    }

    // Testar se a coluna foi adicionada
    console.log('\n🧪 Testando se a coluna CPF foi adicionada...');
    
    const testClient = {
      name: 'Teste CPF',
      phone: '(11) 99999-9999',
      email: 'teste.cpf@email.com',
      cpf: '123.456.789-00'
    };

    const { data: insertedClient, error: insertError } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Ainda há erro ao inserir com CPF:', insertError);
      console.log('\n📋 INSTRUÇÕES PARA RESOLVER:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá para o SQL Editor');
      console.log('3. Execute o comando: ALTER TABLE public.clients ADD COLUMN cpf TEXT;');
      console.log('4. Depois execute este script novamente para testar');
    } else {
      console.log('✅ Teste com CPF funcionou! Coluna adicionada com sucesso!');
      console.log('📋 Dados inseridos:', JSON.stringify(insertedClient, null, 2));

      // Remover cliente de teste
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', insertedClient.id);

      if (!deleteError) {
        console.log('🗑️ Cliente de teste removido');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

addCpfColumn();