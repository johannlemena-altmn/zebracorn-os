const db = new Dexie('ZebracornOS');

db.version(1).stores({
  captures:      '++id, type, date, statut',
  intentions:    '++id, date',
  taskChecks:    '[key+date]',
  routineChecks: '[key+date]',
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

async function getTaskCheck(key) {
  const rec = await db.taskChecks.get([key, today()]);
  return !!rec;
}

async function toggleTaskCheck(key, fait) {
  if (fait) {
    await db.taskChecks.put({ key, date: today() });
  } else {
    await db.taskChecks.delete([key, today()]);
  }
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
