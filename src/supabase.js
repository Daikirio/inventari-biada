import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnbffhfqzydqmjfuguid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYmZmaGZxenlkcW1qZnVndWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzkzNzgsImV4cCI6MjA4OTkxNTM3OH0.O-2FWpBWplhS7HgAgp_ga7vegLkvZLHe40p3bYn-ZsM';

export const supabase = createClient(supabaseUrl, supabaseKey);