import { supabase } from './lib/supabaseClient';

async function checkPermissions() {
  console.log('Checking Supabase permissions...');
  
  try {
    // Verificar permissões para store_products
    console.log('Checking store_products permissions...');
    const { data: productsData, error: productsError } = await supabase
      .from('store_products')
      .select('id, name')
      .limit(1);
      
    console.log('Store products check:', { data: productsData, error: productsError });
    
    // Verificar permissões para esthetic_products
    console.log('Checking esthetic_products permissions...');
    const { data: estheticData, error: estheticError } = await supabase
      .from('esthetic_products')
      .select('id, name')
      .limit(1);
      
    console.log('Esthetic products check:', { data: estheticData, error: estheticError });
    
    // Verificar usuário atual
    console.log('Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', { user, error: userError });
    
    // Verificar sessão
    console.log('Checking session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session data:', { session: sessionData?.session, error: sessionError });
  } catch (error) {
    console.error('Permission check error:', error);
  }
}

checkPermissions();