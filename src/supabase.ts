import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://crojeuxfaapkmwxxlksd.supabase.co";
const SUPABASE_KEY = "sb_publishable_jeMztOVQPIj2dUvmOPEVYg_X5J1dDxS";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
