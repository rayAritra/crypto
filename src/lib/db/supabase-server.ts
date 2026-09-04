import "server-only"; import { createClient } from "@supabase/supabase-js"; import { getEnv,hasDatabase } from "@/config/env";
export function db(){if(!hasDatabase())return null;const e=getEnv();return createClient(e.SUPABASE_URL!,e.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})}
