
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvhrgykkoautvidvuguo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qp32Vn7qgxPrQRjgQtVXcA_uyoJSAY1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
