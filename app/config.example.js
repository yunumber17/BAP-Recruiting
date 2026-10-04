// Copy to config.js and fill in from Supabase → Project Settings → API.
// The anon key is safe to ship in a client (Row Level Security is enforced on every table).
// Never put the service_role key here.
window.BAP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-KEY",
};
