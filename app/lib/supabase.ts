import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fheuxtgnlshaxofoniys.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZXV4dGdubHNoYXhvZm9uaXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjU4NDYsImV4cCI6MjEwNjAwMTg0Nn0.2_wt7MHlT3gxXF1L9edQl1ERkB1uyogfBT8kRLs6m5Q';

// Single global instance to prevent "Multiple GoTrueClient instances detected" warning
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Server-only client with service role (if configured) or fallback to anon key for server routes
export function getServerSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}
