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

async function addCapture(type, contenu, tag, extra) {
  // extra = { filename, dataUrl, mimeType } for file captures
  return db.captures.add({
    type,
    contenu,
    source: tag || null,
    date: new Date().toISOString(),
    statut: 'inbox',
    ...(extra || {}),
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

async function traitCapture(id, annotation) {
  return db.captures.update(id, { statut: 'traité', annotation: annotation ? annotation.trim() : null });
}

async function getInboxCount() {
  return db.captures.where('statut').equals('inbox').count();
}

async function getLater() {
  return db.captures.where('statut').equals('plus-tard').reverse().sortBy('date');
}

async function deleteCapture(id) {
  return db.captures.delete(id);
}

async function updateCaptureNotes(id, notes) {
  return db.captures.update(id, { notes: notes || null });
}

async function linkCaptures(idA, idB) {
  const [a, b] = await Promise.all([db.captures.get(idA), db.captures.get(idB)]);
  const la = a?.linkedIds || [], lb = b?.linkedIds || [];
  await Promise.all([
    la.includes(idB) ? null : db.captures.update(idA, { linkedIds: [...la, idB] }),
    lb.includes(idA) ? null : db.captures.update(idB, { linkedIds: [...lb, idA] }),
  ]);
}

async function unlinkCaptures(idA, idB) {
  const [a, b] = await Promise.all([db.captures.get(idA), db.captures.get(idB)]);
  await Promise.all([
    db.captures.update(idA, { linkedIds: (a?.linkedIds||[]).filter(x=>x!==idB) }),
    db.captures.update(idB, { linkedIds: (b?.linkedIds||[]).filter(x=>x!==idA) }),
  ]);
}

async function getStats() {
  const [caps, chans, etps, tachs] = await Promise.all([
    db.captures.toArray(),
    db.chantiers.where('statut').equals('actif').toArray(),
    db.etapes.toArray(),
    db.taches.toArray(),
  ]);
  let maxPct = 0;
  for (const ch of chans) {
    const et = etps.filter(e => e.chantierId === ch.id);
    if (et.length) {
      const pct = Math.round(et.filter(e => e.fait).length / et.length * 100);
      if (pct > maxPct) maxPct = pct;
    }
  }
  return {
    total: caps.length,
    traites: caps.filter(c => c.statut === 'traité').length,
    avecNotes: caps.filter(c => c.notes).length,
    avecLiens: caps.filter(c => c.linkedIds?.length).length,
    tachesDone: tachs.filter(t => t.fait).length,
    maxPct,
  };
}

async function getCapturesByChantier(chantierId) {
  const all = await db.captures.filter(c => c.chantierId === chantierId).toArray();
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
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

async function setTacheEcheance(id, echeance) {
  return db.taches.update(id, { echeance: echeance || null });
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

// Seed v2 — chantiers d'orientation issus de la conversation du 2026-06-08
async function seedOnce_v2() {
  if (localStorage.getItem('zebracorn_seed_v2')) return;

  const ch = async (titre, prochaine) => {
    const id = await addChantier({ titre, prio: 'vert' });
    await updateChantier(id, { prochaine });
  };
  await ch('Mémoire M2 — vision systémique', 'lire Bienvenue en 2055 · noter le fil conducteur');
  await ch('Ressourcement scientifique · SVT + physique', 'identifier 3 sources de remise à niveau');

  await addTache({ titre: 'Explorer les filières enseignement (grande école / ingé)', prio: 'bleu' });
  await addTache({ titre: 'Écrire 3 lignes sur mon positionnement Regen consultant', prio: 'bleu' });

  localStorage.setItem('zebracorn_seed_v2', 'done');
}

// v3 — AMWAP : log de victoires quotidiennes
db.version(3).stores({
  amwap: '++id, date',
});

// v4 — Questions vivantes
db.version(4).stores({
  questions: '++id, chantierId, statut',
});

// ── AMWAP (mes victoires du jour) ──────────────────────────────────────────

async function saveAmwap(v1, v2, v3) {
  const d = today();
  await db.amwap.filter(a => a.date.startsWith(d)).delete();
  return db.amwap.add({ v1: v1.trim(), v2: v2.trim(), v3: v3.trim(), date: new Date().toISOString() });
}

async function getAmwap(dateStr) {
  const rows = await db.amwap.filter(a => a.date.startsWith(dateStr)).toArray();
  return rows.length ? rows[rows.length - 1] : null;
}

// ── Export / Import (snapshot JSON — filet de sécurité offline + base sync) ──

const SYNC_TABLES = ['captures','intentions','taskChecks','routineChecks','chantiers','etapes','taches','amwap','questions'];

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

// ── Cap annuel (North Star) ────────────────────────────────────────────────

function getCap() {
  try { return JSON.parse(localStorage.getItem('zebracorn_cap') || 'null') || { intention: '', objectifs: '', nonNeg: '', objectifsMois: '' }; }
  catch { return { intention: '', objectifs: '', nonNeg: '', objectifsMois: '' }; }
}
function saveCap(cap) {
  localStorage.setItem('zebracorn_cap', JSON.stringify(cap));
}

async function toggleHorsScope(id, val) {
  return db.captures.update(id, { horsScope: val });
}

async function getHorsScopeMois() {
  const mois = new Date().toISOString().slice(0, 7);
  const traites = await db.captures.where('statut').equals('traité').toArray();
  return traites.filter(c => c.horsScope && c.date.startsWith(mois)).length;
}

// ── Questions vivantes ─────────────────────────────────────────────────────

async function addQuestion({ intitule, intention, chantierId = null }) {
  return db.questions.add({ intitule, intention, chantierId: chantierId || null, statut: 'vivante', createdAt: new Date().toISOString() });
}

async function getQuestions() {
  return db.questions.filter(q => q.statut !== 'archivee').toArray();
}

async function archiveQuestion(id) {
  return db.questions.update(id, { statut: 'archivee' });
}

async function getArchivedQuestions() {
  return db.questions.filter(q => q.statut === 'archivee').toArray();
}

async function restoreQuestion(id) {
  return db.questions.update(id, { statut: 'vivante' });
}

async function seedQuestionsOnce() {
  if (localStorage.getItem('zebracorn_seed_q1')) return;
  const existing = await getQuestions();
  if (existing.length > 0) { localStorage.setItem('zebracorn_seed_q1', 'done'); return; }
  await addQuestion({ intitule: 'Comment raconter une idée complexe sans la trahir ?', intention: 'Trouver le langage qui transmet la nuance — clé de tout ce que je produis.' });
  await addQuestion({ intitule: "Qu'est-ce qui fait qu'une ressource devient vraiment utile ?", intention: "Éviter d'accumuler sans comprendre — le filtre entre capter et agir." });
  await addQuestion({ intitule: 'Comment documenter une transformation sans perdre son élan ?', intention: "Garder la trace du chemin sans que l'outil devienne le projet lui-même." });
  localStorage.setItem('zebracorn_seed_q1', 'done');
}
