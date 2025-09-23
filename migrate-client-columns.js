import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function migrateClientColumns() {
  console.log('🔧 Tentando adicionar colunas via diferentes métodos...\n');

  try {
    // Método 1: Tentar inserir um cliente com as novas colunas para forçar a criação
    console.log('📝 Método 1: Tentando inserir cliente com colunas de endereço...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert([
        {
          name: 'Teste Endereço',
          phone: '11999999999',
          email: 'teste.endereco@teste.com',
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Bairro Teste',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }
      ])
      .select();

    if (insertError) {
      console.log('❌ Erro ao inserir com colunas de endereço:', insertError.message);
      
      // Se falhou, as colunas não existem. Vamos tentar outro método.
      console.log('\n📝 Método 2: Verificando se podemos usar upsert...');
      
      const { data: upsertData, error: upsertError } = await supabase
        .from('clients')
        .upsert([
          {
            id: 999999, // ID alto para não conflitar
            name: 'Teste Upsert',
            phone: '11888888888',
            email: 'teste.upsert@teste.com'
          }
        ])
        .select();

      if (upsertError) {
        console.log('❌ Erro no upsert:', upsertError.message);
      } else {
        console.log('✅ Upsert funcionou:', upsertData);
        
        // Agora tentar atualizar com as colunas de endereço
        console.log('\n📝 Tentando atualizar com colunas de endereço...');
        
        const { data: updateData, error: updateError } = await supabase
          .from('clients')
          .update({
            rua: 'Rua Atualizada',
            numero: '456',
            bairro: 'Bairro Atualizado',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            cep: '20000-000'
          })
          .eq('id', 999999)
          .select();

        if (updateError) {
          console.log('❌ Erro ao atualizar com endereço:', updateError.message);
        } else {
          console.log('✅ Atualização com endereço funcionou!', updateData);
        }
      }
      
    } else {
      console.log('✅ Inserção com colunas de endereço funcionou!', insertData);
    }

    // Método 3: Verificar a estrutura atual
    console.log('\n📝 Método 3: Verificando estrutura atual...');
    
    const { data: currentData, error: currentError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (currentError) {
      console.log('❌ Erro ao verificar estrutura:', currentError.message);
    } else if (currentData && currentData.length > 0) {
      console.log('✅ Estrutura atual da tabela:');
      const columns = Object.keys(currentData[0]);
      columns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      
      // Verificar se as colunas de endereço existem
      const addressColumns = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
      const missingColumns = addressColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('🎉 Todas as colunas de endereço existem!');
      } else {
        console.log('❌ Colunas faltantes:', missingColumns);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  // Instruções finais
  console.log('\n📋 INSTRUÇÕES PARA RESOLVER MANUALMENTE:');
  console.log('');
  console.log('1. Acesse: https://supabase.com/dashboard');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá para "SQL Editor" no menu lateral');
  console.log('4. Execute o seguinte SQL:');
  console.log('');
  console.log('   ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rua text;');
  console.log('   ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS numero text;');
  console.log('   ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bairro text;');
  console.log('   ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cidade text;');
  console.log('   ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS estado text;');
  console.log('   ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cep text;');
  console.log('');
  console.log('5. Clique em "Run" para executar');
  console.log('6. Depois execute este script novamente para verificar');
}

migrateClientColumns().catch(console.error);