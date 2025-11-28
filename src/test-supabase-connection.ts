// Testar conexão com Supabase e verificar erros específicos
import { supabase } from './lib/supabase';

async function testConnection() {
  try {
    console.log('=== TESTE DE CONEXÃO SUPABASE ===');
    
    // Testar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Sessão:', session ? 'ATIVA' : 'NULA', sessionError);

    // Testar tabelas específicas que estão dando erro
    console.log('\n=== TESTANDO TABELAS ===');
    
    // Testar packages
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true);
    console.log('Packages:', packages?.length || 0, 'erro:', packagesError);

    // Testar procedures
    const { data: procedures, error: proceduresError } = await supabase
      .from('procedures')
      .select('*')
      .eq('active', true);
    console.log('Procedures:', procedures?.length || 0, 'erro:', proceduresError);

    // Testar store_sales
    const { data: storeSales, error: storeSalesError } = await supabase
      .from('store_sales')
      .select('client_id, status, payment_method, total_amount, discount_amount, notes');
    console.log('Store Sales:', storeSales?.length || 0, 'erro:', storeSalesError);

    // Verificar headers da requisição
    console.log('\n=== HEADERS ===');
    console.log('URL:', supabase.supabaseUrl);
    console.log('Anon Key presente:', !!supabase.supabaseKey);
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testConnection();