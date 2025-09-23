const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAppointmentsTable() {
  console.log('🔧 Adicionando coluna sale_id na tabela appointments...');
  
  try {
    // Tentar adicionar a coluna sale_id diretamente
    console.log('➕ Executando ALTER TABLE...');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela appointments:', error);
      return;
    }
    
    console.log('✅ Tabela appointments acessível');
    
    // Tentar inserir um registro de teste para ver se sale_id existe
    const testRecord = {
      client_id: null,
      service: 'teste',
      time: '10:00',
      date: '2025-01-01',
      status: 'teste',
      price: 0,
      type: 'teste',
      sale_id: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('appointments')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      if (insertError.message.includes('sale_id')) {
        console.log('❌ Coluna sale_id não existe. Tentando criar...');
        
        // Usar uma query SQL direta
        const { error: sqlError } = await supabase
          .from('appointments')
          .select('*, sale_id')
          .limit(1);
          
        if (sqlError && sqlError.message.includes('sale_id')) {
          console.log('🔧 Coluna sale_id realmente não existe');
          console.log('⚠️  Você precisa executar este SQL no painel do Supabase:');
          console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;');
        }
      } else {
        console.error('❌ Erro ao inserir registro de teste:', insertError);
      }
    } else {
      console.log('✅ Coluna sale_id já existe!');
      // Deletar o registro de teste
      if (insertData && insertData[0]) {
        await supabase
          .from('appointments')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Registro de teste removido');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixAppointmentsTable();