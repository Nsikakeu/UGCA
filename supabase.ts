import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://nsavgutmxvcpabxoperf.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_GZv3bKMIG7bJa7gAxMDNZA_m-n_bekA';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
