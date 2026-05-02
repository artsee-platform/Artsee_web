const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '') || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function selectFromSupabase<T>(
  table: string,
  options: { select?: string; order?: string } = {}
): Promise<T[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set('select', options.select || '*');
  if (options.order) {
    url.searchParams.set('order', options.order);
  }

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${message}`);
  }

  return response.json();
}
