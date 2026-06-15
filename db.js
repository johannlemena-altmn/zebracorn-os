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

// Titre manuel d'une capture (fallback gracieux quand l'auto-titre échoue/est bloqué).
async function updateCaptureTitre(id, titre) {
  return db.captures.update(id, { titre: titre && titre.trim() ? titre.trim().slice(0, 140) : null });
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
  const todayStr = now.toISOString().slice(0, 10);
  // Start from Monday of current week (European week: Mon=1)
  const day = now.getDay(); // 0=Sun, 1=Mon…6=Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const count = await db.intentions.filter(x => x.date.startsWith(ds)).count();
    result.push({ date: ds, done: count > 0, isToday: ds === todayStr });
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
  arr = arr.filter(t => !t.supprime);          // soft-delete : exclu des vues actives
  if (fait !== null) arr = arr.filter(t => t.fait === fait);
  if (prio !== null) arr = arr.filter(t => t.prio === prio);
  return arr.sort((a, b) => (a.cree < b.cree ? 1 : -1));
}

async function toggleTacheDone(id, fait) {
  // Horodate la complétion → permet la rétrospective « Wrapped » par période.
  return db.taches.update(id, { fait, faitLe: fait ? new Date().toISOString() : null });
}

// Archive : tâches faites OU supprimées, plus récentes d'abord (date d'archivage).
async function getArchivedTaches() {
  const arr = await db.taches.toArray();
  const when = t => t.supprimeLe || t.faitLe || t.cree || '';
  return arr.filter(t => t.fait || t.supprime).sort((a, b) => (when(a) < when(b) ? 1 : -1));
}

// Rouvrir une tâche archivée (cochée par erreur ou supprimée) → revient en actif.
async function restoreTache(id) {
  return db.taches.update(id, { fait: false, faitLe: null, supprime: false, supprimeLe: null });
}

async function setTacheDate(id, date) {
  return db.taches.update(id, { date });
}

async function setTacheEcheance(id, echeance) {
  return db.taches.update(id, { echeance: echeance || null });
}

async function deleteTache(id) {
  // Soft-delete : la tâche reste consultable et récupérable dans l'Archive.
  return db.taches.update(id, { supprime: true, supprimeLe: new Date().toISOString() });
}

async function setTacheNotes(id, notes) {
  return db.taches.update(id, { notes: notes || null });
}

async function setTacheTitre(id, titre) {
  if (!titre || !titre.trim()) return;          // jamais de tâche sans titre
  return db.taches.update(id, { titre: titre.trim() });
}

async function setTacheObjectif(id, objectif) {
  return db.taches.update(id, { capObjectif: objectif || null });
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

async function seedChantiersEte2026() {
  if (localStorage.getItem('zebracorn_seed_ete2026')) return;
  const ch = async (titre, prochaine) => {
    const id = await addChantier({ titre, prio: 'vert' });
    await updateChantier(id, { prochaine });
  };
  await ch('Low-tech design — appart parisien', 'croquis mixeur roue de skate · noter les contraintes physiques');
  await ch('Machine à pédale Singer redesignée', 'comprendre rapport engrenages diamètre/dents/vitesse · schéma');
  await ch('7 éléments → 6 prismes Campus Environnement', 'revoir la vidéo · mapper les correspondances · 1 page de notes');
  localStorage.setItem('zebracorn_seed_ete2026', 'done');
}

// Seed Plans A/B/C (conversation du 2026-06-13) — chantiers stratégiques
// pré-remplis pour ne pas repartir de zéro : arborescence d'étapes complète +
// question vivante liée (le « pourquoi » / l'apprentissage) + prochaine action.
// Content-guardé par titre → pas de doublon quand un autre appareil se synchronise.
async function seedChantiersPlansABC_2026() {
  if (localStorage.getItem('zebracorn_seed_plansABC')) return;

  const PLANS = [
    {
      titre: 'reVu — faire revivre la vigie médiatique',
      organe: 'média · vigie',
      progression: "Décisions du grill figées (13/06). Fact-base faite : Nova plausible, mais pitcher un reVu NATIF Nova léger (pas la greffe des 17 personnes). Posture : catalyseur, pas remplaçant.",
      prochaine: "Aller au rassemblement de soutien à Vu (16 juin) — rencontrer l'écosystème",
      etapes: [
        "Rassemblement de soutien à Vu (16 juin) — rencontrer l'équipe et l'écosystème",
        "Storyboard de l'hommage 60-90 s (rythme zapping) + structure de la frise web",
        "Spécifier le pipeline de collecte (sources publiques légales : presse, INA, Arcom)",
        "Publier l'hommage + frise teaser le 30 juin (jour de la mort de Vu)",
        "Enquête complète 5-8 min + frise enrichie + onglet Méthode (mi-juillet)",
        "Envoyer le dossier à l'équipe de Vu (vérification / témoignage)",
        "Approcher Radio Nova — porte d'entrée : La Riposte (Akim Omiri)",
        "Mail Regen School — cadres alternance / stage / mécénat (avant lancement)",
      ],
      question: {
        intitule: "Comment faire revivre une idée sans trahir ceux qui l'ont portée ?",
        intention: "reVu = hommage-catalyseur, jamais remplaçant de l'équipe de Patrick Menais.",
      },
      tacheRouge: { titre: "Aller au rassemblement de soutien à Vu", echeance: '2026-06-16' },
    },
    {
      titre: 'Studio de rénovation frugale — coopétiteur de Murfy',
      organe: 'studio · circularité',
      progression: "EN CHANTIER. 80 % du business plan déjà écrit (mémo « Circularité Opératoire », mai 2026). Cadrage complet dans le Cerveau : wiki/projets/studio-renovation-frugale.",
      prochaine: "Trancher Q4 (secteur) : électroménager vs habitat/mobilier — ça débloque tout",
      etapes: [
        "Relire + fusionner les 2 docs de mai (Circularité Opératoire + étude de marché)",
        "Trancher Q4 (secteur) : la question qui débloque toutes les autres",
        "Choisir le geste : rediriger / borner / supprimer (trois gestes sur un flux)",
        "Faire 3 entretiens terrain (1 Envie, 1 Repair Café, 1 réparateur indépendant)",
        "Tester la coopétition : 1 échange concret avec Murfy ou un réparateur local",
        "Produire 1 portrait de réparateur (kit-et-média) — tester sens > épanouissement > argent",
      ],
      question: {
        intitule: "Comment revaloriser les métiers que le système déclasse ?",
        intention: "Le pari : ces profils sont excellents quand le sens les rebranche — argent < épanouissement < sens.",
      },
    },
    {
      titre: 'Refonte Reprise-Sport + nutrition',
      organe: 'corps · discipline',
      progression: "Tracker HTML gamifié existant (~/Desktop/Reprise-Sport/). Module nutrition rapatrié depuis Zebracorn OS le 11/06. Scope de la refonte à définir.",
      prochaine: "Lister ce qui marche / ce qui coince dans le tracker actuel",
      etapes: [
        "Lister ce qui marche / ce qui coince dans le tracker actuel",
        "Décider : fusionner sport + nutrition en une vue, ou garder séparé",
        "Définir le scope de la refonte (1 tranche verticale, pas tout d'un coup)",
      ],
      question: {
        intitule: "Comment rendre une discipline corporelle durable sans qu'elle devienne une corvée ?",
        intention: "L'outil doit servir l'élan, pas devenir le projet lui-même.",
      },
    },
  ];

  const existing = await db.chantiers.toArray();
  const titres = new Set(existing.map(c => (c.titre || '').trim().toLowerCase()));

  for (const p of PLANS) {
    if (titres.has(p.titre.trim().toLowerCase())) continue; // anti-doublon (sync)
    const id = await addChantier({ titre: p.titre, prio: 'vert', organe: p.organe });
    await updateChantier(id, { progression: p.progression, prochaine: p.prochaine });
    for (const t of p.etapes) await addEtape(id, t);
    if (p.question) await addQuestion({ ...p.question, chantierId: id });
    if (p.tacheRouge) await addTache({ titre: p.tacheRouge.titre, prio: 'rouge', echeance: p.tacheRouge.echeance, chantierId: id });
  }

  localStorage.setItem('zebracorn_seed_plansABC', 'done');
}

// Seed des chantiers du système de travail (CHANTIERS-actifs.md, 15/06).
// Reprise-Sport (#3) est déjà couvert par seedChantiersPlansABC → on seede les
// 4 autres. Content-guardé par titre (anti-doublon en multi-device, comme ci-dessus).
async function seedChantiersActifs_2026() {
  if (localStorage.getItem('zebracorn_seed_actifs2026')) return;

  const CHANTIERS = [
    {
      titre: 'App Zebracorn OS — capture & discipline',
      organe: 'capture · discipline',
      progression: "Clé de voûte de l'écosystème. Refonte « 7 jours d'usage » (v0.3.6) : capture de lien jamais bloquante, archive des tâches + rétro « Wrapped », confort des 4 onglets. Cf. JOURNAL.md.",
      prochaine: "Tester v0.3.6 sur iPhone (feel : swipe, clavier iOS, slide)",
      etapes: [
        "Tester v0.3.6 sur iPhone — le feel réel (vérifs preview = headless)",
        "Câbler le numéro de version des pieds de page sur une constante unique",
        "Décider la prochaine tranche (vidéo sur note ? « vider l'archive » ?)",
      ],
      question: {
        intitule: "Comment un outil de capture reste-t-il sobre quand on lui ajoute des features ?",
        intention: "La meilleure feature est souvent celle qu'on ne construit pas — frugalité d'abord.",
      },
    },
    {
      titre: 'Vidéo Hyperframes + avatar (local, sensible)',
      organe: 'récit · vidéo',
      progression: "Cadré, assets sécurisés (local-only, rien sur le cloud sans accord). Stack frugale visée : HyperFrames + SadTalker/Piper. Plan : PLAN-video-avatar.md.",
      prochaine: "Trancher l'angle éditorial avant de produire le moindre rush",
      etapes: [
        "Trancher l'angle éditorial (intention, ton, format)",
        "Rassembler les rushes + écrire la voix (script narration)",
        "Définir le branding (typo, couleurs, identité visuelle)",
        "Lancer l'agent art-director sur le pipeline complet",
      ],
      question: {
        intitule: "Comment garder la main (et les données) sur sa propre image en vidéo ?",
        intention: "Local-first sur les assets sensibles — indépendance avant confort.",
      },
    },
    {
      titre: 'Outil vidéo → images (MVP local)',
      organe: 'atelier · outil',
      progression: "Plan validé (PLAN-outil-video-frames.md). Brique réutilisable pour les autres chantiers vidéo. Rendu local, open-source-first.",
      prochaine: "Installer la stack + l'orchestrateur, tester sur 1 vidéo",
      etapes: [
        "Installer la stack (ffmpeg + extraction de frames)",
        "Écrire l'orchestrateur (sélection des frames utiles)",
        "Tester de bout en bout sur 1 vidéo réelle",
      ],
      question: {
        intitule: "Quand un petit outil maison vaut-il mieux qu'un service tout fait ?",
        intention: "Mesurer le coût réel : €, énergie, dépendance, données. Local quand c'est sobre.",
      },
    },
    {
      titre: 'Physique × archi / low-tech (méthode Feynman)',
      organe: 'langage · vulgarisation',
      progression: "Idée cadrée (15/06). Apprendre la physique du lycée en la vulgarisant (mix archi/design/low-tech, systémique), modèle Bobroff. Organe ⑤ + langage ③.",
      prochaine: "Choisir le 1er triplet : concept × objet × format",
      etapes: [
        "Choisir le 1er triplet (1 concept physique × 1 objet × 1 format de restitution)",
        "Le vulgariser façon Feynman (l'expliquer simplement = le comprendre)",
        "Le relier à un geste low-tech / archi concret",
      ],
      question: {
        intitule: "Comprend-on vraiment quelque chose si on ne sait pas l'expliquer simplement ?",
        intention: "Méthode Feynman : la vulgarisation est le test de la compréhension.",
      },
    },
  ];

  const existing = await db.chantiers.toArray();
  const titres = new Set(existing.map(c => (c.titre || '').trim().toLowerCase()));

  for (const p of CHANTIERS) {
    if (titres.has(p.titre.trim().toLowerCase())) continue; // anti-doublon (sync)
    const id = await addChantier({ titre: p.titre, prio: 'vert', organe: p.organe });
    await updateChantier(id, { progression: p.progression, prochaine: p.prochaine });
    for (const t of p.etapes) await addEtape(id, t);
    if (p.question) await addQuestion({ ...p.question, chantierId: id });
  }

  localStorage.setItem('zebracorn_seed_actifs2026', 'done');
}

// Seed « carré » de veille (conversation du 2026-06-13) — sortie de Claude
// Fable 5 / Mythos 5 chez Anthropic. Johann veut GARDER la question sous les
// yeux dans l'app et la creuser plus tard. Réemploi total de la mécanique
// chantier + question vivante : le carré = un chantier dont les étapes sont les
// scénarios prospectifs et la « question qui guide » est la question
// épistémologique. Les pistes notées (A/B/C) sont les HYPOTHÈSES de Johann, pas
// des faits — formulées comme scénarios à explorer. Content-guardé par titre.
async function seedVeilleAnthropic_2026() {
  if (localStorage.getItem('zebracorn_seed_veille_anthropic')) return;

  const titre = 'Veille — décision US sur les modèles frontière (Fable / Opus)';
  const existing = await db.chantiers.toArray();
  const titres = new Set(existing.map(c => (c.titre || '').trim().toLowerCase()));
  if (titres.has(titre.trim().toLowerCase())) {
    localStorage.setItem('zebracorn_seed_veille_anthropic', 'done');
    return;
  }

  const id = await addChantier({ titre, prio: 'vert', organe: 'vigie · adaptation' });
  await updateChantier(id, {
    progression: "Anthropic a sorti Claude Fable 5 / Mythos 5 (même modèle de fond ; " +
      "tier « Mythos » au-dessus d'Opus). Fable porte des mesures de sécurité " +
      "dual-use ; Mythos est SANS ces mesures, réservé aux organisations approuvées. " +
      "Un durcissement éventuel relève d'une décision du gouvernement US. " +
      "À analyser froidement et scénariser pour rester adaptable. " +
      "Réf. : anthropic.com/news/claude-fable-5-mythos-5.",
    prochaine: "Poser le cadre épistémologique avec Claude : faits établis vs hypothèses vs inconnues",
  });
  for (const t of [
    "Cadre épistémologique : séparer faits / hypothèses / inconnues sur la décision US",
    "Scénario A (piste J.) — Anthropic relève Opus vers le niveau de Fable, mais avec plus de garde-fous",
    "Scénario B (piste J.) — une voie d'accès pensée pour les Européens (offre/entité dédiée UE)",
    "Scénario C (piste J.) — contournement type VPN (cf. openclaw, normalement interdit en UE) : risques & limites",
    "Définir les signaux d'alerte précoces d'un durcissement",
    "Plan d'adaptation par scénario : que faire concrètement si l'un se confirme",
  ]) await addEtape(id, t);
  await addQuestion({
    intitule: "Comment se préparer objectivement à un durcissement qu'on ne contrôle pas ?",
    intention: "Analyse épistémologique + scénarios prospectifs pour garder son pouvoir d'agir si l'accès aux modèles frontière se restreint.",
    chantierId: id,
  });

  localStorage.setItem('zebracorn_seed_veille_anthropic', 'done');
}

// v3 — AMWAP : log de victoires quotidiennes
db.version(3).stores({
  amwap: '++id, date',
});

// v4 — Questions vivantes
db.version(4).stores({
  questions: '++id, chantierId, statut',
});

// v5 — Bibliothèque légère
db.version(5).stores({
  livres: '++id, statut',
});

// v6 — Settings clé/valeur (cap annuel, préférences) — syncable via Supabase
db.version(6).stores({
  settings: 'key',
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

const SYNC_TABLES = ['captures','intentions','taskChecks','routineChecks','chantiers','etapes','taches','amwap','questions','livres','settings','repas','courses','aliments_custom'];

async function exportAll() {
  const dump = { _app: 'zebracorn-os', _v: 2, _at: new Date().toISOString() };
  for (const t of SYNC_TABLES) dump[t] = await db.table(t).toArray();
  return dump;
}

// Import-merge du pont cerveau (actions_du_jour.json) : AJOUTE sans rien effacer.
// Dédoublonnage par titre contre les tâches non faites existantes.
async function importTachesMerge(dump) {
  if (dump?._de !== 'zebracorn-cerveau' || !Array.isArray(dump.taches)) {
    throw new Error('Format inattendu — fichier actions_du_jour.json du cerveau requis');
  }
  const existantes = await db.taches.filter(t => !t.fait).toArray();
  const titres = new Set(existantes.map(t => t.titre.trim().toLowerCase()));
  let added = 0, skipped = 0;
  for (const t of dump.taches) {
    if (!t.titre?.trim() || titres.has(t.titre.trim().toLowerCase())) { skipped++; continue; }
    await db.taches.add({
      titre: t.titre.trim(),
      prio: t.prio === 'bleu' ? 'bleu' : 'rouge',
      echeance: t.echeance || null,
      chantierId: t.chantierId || null,
      date: t.date || null,
      fait: false,
      cree: t.cree || new Date().toISOString(),
    });
    titres.add(t.titre.trim().toLowerCase());
    added++;
  }
  return { added, skipped };
}

async function importAll(dump) {
  _importing = true; // un import/pull ne doit pas marquer l'appareil « en avance »
  try {
    await db.transaction('rw', SYNC_TABLES.map(t => db.table(t)), async () => {
      for (const t of SYNC_TABLES) {
        if (!Array.isArray(dump[t])) continue;
        await db.table(t).clear();
        if (dump[t].length) await db.table(t).bulkPut(dump[t]);
      }
    });
    localStorage.removeItem('zc_dirty');
  } finally {
    _importing = false;
  }
}

// ── Cap annuel (North Star) ────────────────────────────────────────────────
// Stocké dans IndexedDB (settings) pour être syncé via Supabase.
// Migre automatiquement depuis localStorage si nécessaire.

const CAP_EMPTY = { intention: '', objectifs: '', nonNeg: '', objectifsMois: '' };

async function getCap() {
  try {
    const row = await db.settings.get('cap');
    if (row) return row.value;
    // Migration depuis localStorage
    const local = localStorage.getItem('zebracorn_cap');
    const val = local ? (JSON.parse(local) || CAP_EMPTY) : CAP_EMPTY;
    await db.settings.put({ key: 'cap', value: val });
    return val;
  } catch { return CAP_EMPTY; }
}

async function saveCap(cap) {
  await db.settings.put({ key: 'cap', value: cap });
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

async function linkCaptureToQuestion(captureId, questionId) {
  return db.captures.update(captureId, { questionId: questionId || null });
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

// ── Bibliothèque légère ────────────────────────────────────────────────────

async function addLivre({ titre, auteur = '', intention = '', pages = null }) {
  return db.livres.add({
    titre, auteur, intention, pages, pagesLues: 0, notes: '',
    questionId: null, statut: 'a-lire', createdAt: new Date().toISOString(),
  });
}

async function getLivres() {
  const all = await db.livres.toArray();
  const order = { 'en-cours': 0, 'a-lire': 1, 'lu': 2 };
  return all.sort((a, b) => (order[a.statut] ?? 1) - (order[b.statut] ?? 1));
}

async function getLivreEnCours() {
  const livres = await db.livres.where('statut').equals('en-cours').toArray();
  return livres[0] || null;
}

async function updateLivre(id, patch) {
  return db.livres.update(id, patch);
}

async function deleteLivre(id) {
  return db.livres.delete(id);
}

// ── v7/v8 — Nutrition (module extrait vers Reprise-Sport le 11/06/2026) ────
// Les schémas restent : les tables conservent les données existantes et
// l'export/import JSON (SYNC_TABLES) continue de les inclure.
db.version(7).stores({
  repas:   '++id, date, moment',
  courses: '++id, categorie, fait',
});
db.version(8).stores({
  aliments_custom: '++id, cat',
});

async function getCapturesByLivre(livreId) {
  const all = await db.captures.filter(c => c.livreId === livreId).toArray();
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function seedLivresOnce() {
  if (localStorage.getItem('zebracorn_seed_livres_v1')) return;
  const existing = await db.livres.count();
  if (existing > 0) { localStorage.setItem('zebracorn_seed_livres_v1', 'done'); return; }
  await addLivre({
    titre: 'Bienvenue en 2055',
    intention: 'Fil conducteur pour le mémoire M2 — vision systémique de la transition.',
  });
  localStorage.setItem('zebracorn_seed_livres_v1', 'done');
}

// ── ACTOR (analyse en 5 étapes) ───────────────────────────────────────────
async function saveActorAnalysis(id, analysis) {
  return db.captures.update(id, { actorAnalysis: analysis });
}

async function getActorCorpus() {
  const all = await db.captures.toArray();
  return all
    .filter(c => c.actorAnalysis && c.statut !== 'inbox')
    .sort((a, b) => (a.actorAnalysis.updatedAt < b.actorAnalysis.updatedAt ? 1 : -1));
}

// ── Resurfacing ───────────────────────────────────────────────────────────
// Retourne toutes les captures candidates au resurfacing :
// - capturées il y a 7+ jours
// - jamais surfacées OU surfacées il y a 7+ jours
// - triées : inbox sans ACTOR en premier (les plus "orphelines")
async function getResurfaceCandidates() {
  const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const all = await db.captures
    .filter(c =>
      c.date < cutoff &&
      (!c.lastSurfaced || c.lastSurfaced < cutoff)
    )
    .toArray();
  return all.sort((a, b) => {
    const pa = (a.statut === 'inbox' && !a.actorAnalysis) ? 0 : 1;
    const pb = (b.statut === 'inbox' && !b.actorAnalysis) ? 0 : 1;
    return pa - pb;
  });
}

async function updateCaptureLastSurfaced(id) {
  return db.captures.update(id, { lastSurfaced: new Date().toISOString() });
}

// ── Filtre IA — paramètres localStorage ──────────────────────────────────
const IA_KEY = 'zc_filtre_ia';
const IA_DEFAULTS = {
  enabled: false,
  compressModel: 'claude-haiku-4-5-20251001',
  compressTemp: '0.3',
  testModel: 'claude-sonnet-4-6',
  testTemp: '0.3',
};
function getFiltreIaSettings() {
  try { return { ...IA_DEFAULTS, ...JSON.parse(localStorage.getItem(IA_KEY) || '{}') }; } catch { return { ...IA_DEFAULTS }; }
}
function saveFiltreIaSettings(settings) {
  localStorage.setItem(IA_KEY, JSON.stringify(settings));
}

// ── Suivi des écritures locales (sync non destructive) ──────────────────────
// Toute écriture marque l'appareil « en avance » (zc_dirty). Le boot ne tire le
// cloud QUE si rien n'est en attente ; sinon il pousse. Le flag est levé par
// pushAll/pullAll (sync.js). window.zcOnDirty permet le push auto debounced.
let _importing = false;
function zcMarkDirty() {
  if (_importing) return;
  localStorage.setItem('zc_dirty', new Date().toISOString());
  if (typeof window.zcOnDirty === 'function') window.zcOnDirty();
}
db.tables.forEach(t => {
  t.hook('creating', () => { zcMarkDirty(); });
  t.hook('updating', () => { zcMarkDirty(); });
  t.hook('deleting', () => { zcMarkDirty(); });
});
