import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestSale() {
    console.log('Checking latest sale...');

    // 1. Get the latest sale
    const { data: sales, error: saleError } = await supabase
        .from('store_sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (saleError) {
        console.error('Error fetching sale:', saleError);
        return;
    }

    if (!sales || sales.length === 0) {
        console.log('No sales found.');
        return;
    }

    const sale = sales[0];
    console.log('Latest Sale:', {
        id: sale.id,
        sale_number: sale.sale_number,
        created_at: sale.created_at,
        total: sale.total_amount
    });

    // 2. Get items for this sale directly
    const { data: items, error: itemsError } = await supabase
        .from('store_sale_items')
        .select('*')
        .eq('sale_id', sale.id);

    if (itemsError) {
        console.error('Error fetching items:', itemsError);
        return;
    }

    console.log(`Found ${items.length} items for this sale.`);
    if (items.length > 0) {
        console.table(items);
    } else {
        console.log('WARNING: No items found for this sale!');
    }

    // 3. Test the join query used in the app
    const { data: joinData, error: joinError } = await supabase
        .from('store_sales')
        .select(`
        id,
        store_sale_items (
            quantity,
            unit_price
        )
    `)
        .eq('id', sale.id)
        .single();

    if (joinError) {
        console.error('Error testing join query:', joinError);
    } else {
        console.log('Join Query Result:', JSON.stringify(joinData, null, 2));
    }
}

checkLatestSale();
