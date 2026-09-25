// assets/js/supabase.js
// NEXO — configuração pública do Supabase.
// IMPORTANTE: use apenas a chave ANON/PUBLISHABLE no frontend.
// NUNCA coloque a service_role key neste arquivo.

const SUPABASE_URL = "https://gfuhkfgcmgumsqwcqtuh.supabase.co";

// Cole aqui a ANON/PUBLISHABLE KEY do projeto Supabase.
const SUPABASE_ANON_KEY = "sb_publishable_CjnYwfuAzbxaOof-vMtPDQ_Urv2OQCU";

if (!window.supabase) {
  throw new Error("Biblioteca Supabase não carregada.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
