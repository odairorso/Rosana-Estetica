import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidos no arquivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectConstraints() {
    const sqlFile = path.join(__dirname, 'inspect_constraints.sql');

    try {
        const sql = fs.readFileSync(sqlFile, 'utf8');
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

        if (error) {
            console.error('Erro ao executar RPC:', error);
        } else {
            console.log('Constraints em store_sale_items:');
            console.table(data);
        }
    } catch (err) {
        console.error('Erro:', err);
    }
}

inspectConstraints();
