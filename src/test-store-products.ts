import { supabase } from './lib/supabaseClient';

async function testStoreProducts() {
  console.log('Testing store products access...');
  
  try {
    // Testar leitura dos produtos da loja
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('Error fetching store products:', error);
      return;
    }
    
    console.log('Store products fetched successfully:', data);
    
    // Testar inserção de um produto de teste
    const testProduct = {
      name: 'Produto de Teste',
      category: 'Teste',
      sale_price: 10.00,
      cost_price: 5.00,
      stock_quantity: 10
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('store_products')
      .insert([testProduct])
      .select();
      
    if (insertError) {
      console.error('Error inserting test product:', insertError);
    } else {
      console.log('Test product inserted successfully:', insertData);
      
      // Deletar o produto de teste
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('store_products')
          .delete()
          .eq('id', insertData[0].id);
          
        if (deleteError) {
          console.error('Error deleting test product:', deleteError);
        } else {
          console.log('Test product deleted successfully');
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testStoreProducts();