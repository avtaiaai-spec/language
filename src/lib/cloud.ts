import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
let client: SupabaseClient | null = null;
let configError = '';
if (url || key) {
  if (!url || !key)
    configError =
      'Для облака нужны оба публичных параметра Supabase. Пока доступен гостевой режим.';
  else {
    try {
      client = createClient(url, key);
    } catch {
      configError =
        'Параметры Supabase некорректны. Проверьте URL проекта и публичный ключ. Гостевой режим доступен.';
    }
  }
}
export const cloud = client;
export const cloudConfigError = configError;
