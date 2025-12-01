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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRelationships() {
    const sqlFile = path.join(__dirname, 'inspect_relationships.sql');

    try {
        const sql = fs.readFileSync(sqlFile, 'utf8');
        // Using a direct query if possible or just logging instructions if RPC fails
        // But since we know RPC might fail, let's just ask user to run it if we can't.
        // Actually, I'll try to run it.
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

        if (error) {
            console.log('RPC failed. Please run the SQL manually.');
        } else {
            console.table(data);
        }
    } catch (err) {
        console.error(err);
    }
}

inspectRelationships();
