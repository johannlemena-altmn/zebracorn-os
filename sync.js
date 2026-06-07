// Sync cloud — Supabase côté client (compatible Vercel statique, pas de backend).
// Modèle v1 : 1 ligne par table, last-write-wins, identifiée par un "space_id"
// (= ta clé privée). Sync EXPLICITE (boutons Pousser/Tirer) pour éviter tout
// écrasement silencieux tant que la confiance n'est pas établie.
//
// Le SDK Supabase n'est chargé QUE si la sync est configurée (lazy import) →
// l'app reste légère par défaut.

const TABLES = ['captures','intentions','taskChecks','routineChecks','chantiers','etapes','taches'];
const ROW = 'zebracorn_sync';

let _createClient = null;
let _sbc = null;
let _space = null;

const ls = k => localStorage.getItem(k) || '';

export function getSyncConfig() {
  return { url: ls('zc_sb_url'), key: ls('zc_sb_key'), space: ls('zc_sb_space') };
}

export function saveSyncConfig(url, key, space) {
  localStorage.setItem('zc_sb_url', url);
  localStorage.setItem('zc_sb_key', key);
  localStorage.setItem('zc_sb_space', space);
  _sbc = null; // force recréation au prochain appel
}

export function syncConfigured() {
  const c = getSyncConfig();
  return !!(c.url && c.key && c.space);
}

export function lastSync() {
  return { push: localStorage.getItem('zc_last_push'), pull: localStorage.getItem('zc_last_pull') };
}

async function client() {
  const c = getSyncConfig();
  if (!c.url || !c.key || !c.space) throw new Error('Sync non configurée');
  if (!_createClient) {
    _createClient = (await import('https://esm.sh/@supabase/supabase-js@2')).createClient;
  }
  if (!_sbc) _sbc = _createClient(c.url, c.key);
  _space = c.space;
  return _sbc;
}

// Envoie tout l'état local vers le cloud (écrase la version cloud).
export async function pushAll() {
  const sbc = await client();
  const dump = await exportAll(); // global (db.js)
  const rows = TABLES.map(t => ({
    space_id: _space,
    table_name: t,
    payload: dump[t] || [],
    updated_at: new Date().toISOString(),
  }));
  const { error } = await sbc.from(ROW).upsert(rows, { onConflict: 'space_id,table_name' });
  if (error) throw new Error(error.message);
  localStorage.setItem('zc_last_push', new Date().toISOString());
}

// Récupère le cloud et écrase l'état local (puis l'app se recharge).
export async function pullAll() {
  const sbc = await client();
  const { data, error } = await sbc.from(ROW).select('table_name,payload').eq('space_id', _space);
  if (error) throw new Error(error.message);
  if (!data || !data.length) throw new Error('Aucune donnée cloud pour cet espace');
  const dump = {};
  for (const r of data) dump[r.table_name] = r.payload;
  await importAll(dump); // global (db.js)
  localStorage.setItem('zc_last_pull', new Date().toISOString());
}
