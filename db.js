const db = new Dexie('ZebracornOS');
window.db = db; // exposé pour le module sync.js (un const top-level n'est pas sur window)

db.version(1).stores({
  captures:      '++id, type, date, statut',
  intentions:    '++id, date',
  taskChecks:    '[key+date]',
  routineChecks: '[key+date]',
});

// v2 — backlog hebdo : chantiers (long terme 🟢), tâches (one-shot 🔴/🔵)
db.version(2).stores({
  chantiers: '++id, prio, statut, echeance',
  etapes:    '++id, chantierId',
  taches:    '++id, prio, fait, date, chantierId, echeance',
});

// ── helpers ──────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function addCapture(type, contenu, tag) {
  return db.captures.add({
    type,
    contenu,
    source: tag || null,
    date: new Date().toISOString(),
    statut: 'inbox',
  });
}

async function getInbox() {
  return db.captures.where('statut').equals('inbox').reverse().sortBy('date');
}

async function getDone() {
  return db.captures.where('statut').equals('traité').reverse().sortBy('date');
}

async function updateCaptureStatut(id, statut) {
  return db.captures.update(id, { statut });
}

async function getInboxCount() {
  return db.captures.where('statut').equals('inbox').count();
}

async function saveIntention(texte) {
  const d = today();
  await db.intentions.where('date').startsWith(d).delete();
  if (texte.trim()) {
    return db.intentions.add({ texte: texte.trim(), date: new Date().toISOString() });
  }
}

async function getTodayIntention() {
  const rows = await db.intentions.filter(i => i.date.startsWith(today())).toArray();
  return rows.length ? rows[rows.length - 1].texte : '';
}

async function getWeekData() {
  const now = new Date();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const count = await db.intentions.filter(x => x.date.startsWith(ds)).count();
    result.push({ date: ds, done: count > 0, isToday: i === 0 });
  }
  return result;
}

async function getRoutineCheck(key) {
  const rec = await db.routineChecks.get([key, today()]);
  return !!rec;
}

async function toggleRoutineCheck(key, fait) {
  if (fait) {
    await db.routineChecks.put({ key, date: today() });
  } else {
    await db.routineChecks.delete([key, today()]);
  }
}

async function getStreak(key) {
  const now = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const rec = await db.routineChecks.get([key, ds]);
    if (rec) {
      streak++;
    } else if (i > 0) {
      break; // gap — stop
    }
    // i===0 (today) not done yet is OK, continue checking yesterday
  }
  return streak;
}

// ── Chantiers (🟢 long terme : progression, pas case à cocher) ──────────

async function addChantier({ titre, prio = 'vert', organe = '', echeance = null, varier = true }) {
  const now = new Date().toISOString();
  return db.chantiers.add({
    titre, prio, organe, echeance, varier,
    progression: '', prochaine: '', statut: 'actif', cree: now, maj: now,
  });
}

async function getChantiers(statut = 'actif') {
  return db.chantiers.where('statut').equals(statut).reverse().sortBy('maj');
}

async function updateChantier(id, patch) {
  return db.chantiers.update(id, { ...patch, maj: new Date().toISOString() });
}

async function deleteChantier(id) {
  await db.etapes.where('chantierId').equals(id).delete();
  return db.chantiers.delete(id);
}

// ── Étapes d'un chantier ──

async function addEtape(chantierId, titre) {
  return db.etapes.add({ chantierId, titre, fait: false, date: null });
}

async function getEtapes(chantierId) {
  return db.etapes.where('chantierId').equals(chantierId).sortBy('id');
}

async function toggleEtape(id, fait) {
  return db.etapes.update(id, { fait, date: fait ? new Date().toISOString() : null });
}

// ── Tâches one-shot (backlog 🔴 J+1 / 🔵 semaine) ──

async function addTache({ titre, prio = 'bleu', echeance = null, chantierId = null }) {
  return db.taches.add({
    titre, prio, echeance, chantierId,
    date: null, fait: false, cree: new Date().toISOString(),
  });
}

async function getTaches({ fait = null, prio = null } = {}) {
  let arr = await db.taches.toArray();
  if (fait !== null) arr = arr.filter(t => t.fait === fait);
  if (prio !== null) arr = arr.filter(t => t.prio === prio);
  return arr.sort((a, b) => (a.cree < b.cree ? 1 : -1));
}

async function toggleTacheDone(id, fait) {
  return db.taches.update(id, { fait });
}

async function setTacheDate(id, date) {
  return db.taches.update(id, { date });
}

async function deleteTache(id) {
  return db.taches.delete(id);
}

// ── Seed initial (une seule fois) : amorce la semaine de Johann ──────────
// Flag localStorage → si Johann supprime des items, ils ne reviennent pas.

async function seedOnce() {
  if (localStorage.getItem('zebracorn_seed_v1')) return;

  const R = t => addTache({ titre: t, prio: 'rouge' });
  const B = t => addTache({ titre: t, prio: 'bleu' });

  // 🔴 Échéance — d'ici demain
  await R('Répondre à Léo — projet');
  await R('Répondre à Laura — lettre');
  await R('Réviser finance — test (voir mail MS)');
  await R('Talents for the Planet — artefacts + postuler avant J');

  // 🔵 Cette semaine — avant le week-end
  await B('Liste de courses');
  await B('Caler les séances sport + cooking de la semaine');
  await B('Repérer 1 ressource pour avancer un prisme');
  await B('Acheter 1-2 livres low-tech / archi-AMO');

  // 🟢 Chantiers — long terme (avec une 1ʳᵉ étape pour démarrer)
  const ch = async (titre, prochaine) => {
    const id = await addChantier({ titre, prio: 'vert' });
    await updateChantier(id, { prochaine });
  };
  await ch('Prix hédonique', 'lister 3 questions à approfondir');
  await ch('Médiation scientifique (Julien Bobroff)', 'revoir la vidéo + noter le format');
  await ch('Format de contenu depuis un signal faible', 'rouvrir 1 vieux dossier à réactiver');

  localStorage.setItem('zebracorn_seed_v1', 'done');
}

// ── Export / Import (snapshot JSON — filet de sécurité offline + base sync) ──

const SYNC_TABLES = ['captures','intentions','taskChecks','routineChecks','chantiers','etapes','taches'];

async function exportAll() {
  const dump = { _app: 'zebracorn-os', _v: 2, _at: new Date().toISOString() };
  for (const t of SYNC_TABLES) dump[t] = await db.table(t).toArray();
  return dump;
}

async function importAll(dump) {
  await db.transaction('rw', SYNC_TABLES.map(t => db.table(t)), async () => {
    for (const t of SYNC_TABLES) {
      if (!Array.isArray(dump[t])) continue;
      await db.table(t).clear();
      if (dump[t].length) await db.table(t).bulkPut(dump[t]);
    }
  });
}
