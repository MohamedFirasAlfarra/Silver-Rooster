import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okxbrblabltnmqxtbpap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGJyYmxhYmx0bm1xeHRicGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTU2NzcsImV4cCI6MjA1MzEzMTY3N30.Ql8vZqGxQxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
