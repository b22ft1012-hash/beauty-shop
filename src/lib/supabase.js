import { createClient } from '@supabase/supabase-js'

// Түлхүүрүүдийг .env файлаас уншина (service_role хэзээ ч энд байхгүй)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
