import { h } from 'https://esm.sh/preact@10';
import { useState, useEffect, useCallback } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';
const html = htm.bind(h);

/* ── Base alimentaire locale (~30 aliments, flexitarien) ── */
export const ALIMENTS = [
  // Protéines animales
  { nom: 'Poulet émincé (100g)', kcal: 165, prot: 31, gluc: 0,  lip: 3.6, cat: 'proteines', prixUnit: 0.9,  emoji: '🍗' },
  { nom: 'Œufs (x2)',            kcal: 144, prot: 12, gluc: 1,  lip: 10,  cat: 'proteines', prixUnit: 0.4,  emoji: '🥚' },
  { nom: 'Thon boîte (140g)',    kcal: 132, prot: 29, gluc: 0,  lip: 1,   cat: 'proteines', prixUnit: 1.2,  emoji: '🐟' },
  { nom: 'Yaourt grec (200g)',   kcal: 190, prot: 17, gluc: 6,  lip: 10,  cat: 'proteines', prixUnit: 0.7,  emoji: '🥛' },
  { nom: 'Fromage blanc (200g)', kcal: 130, prot: 14, gluc: 6,  lip: 4,   cat: 'proteines', prixUnit: 0.5,  emoji: '🧀' },
  { nom: 'Saumon (130g)',        kcal: 251, prot: 25, gluc: 0,  lip: 16,  cat: 'proteines', prixUnit: 2.5,  emoji: '🐟' },
  // Protéines végétales
  { nom: 'Lentilles cuites (200g)', kcal: 230, prot: 18, gluc: 40, lip: 0.8, cat: 'proteines', prixUnit: 0.3, emoji: '🫘' },
  { nom: 'Tofu ferme (150g)',    kcal: 120, prot: 13, gluc: 3,  lip: 7,   cat: 'proteines', prixUnit: 0.8,  emoji: '🧱' },
  { nom: 'Haricots rouges (200g)', kcal: 210, prot: 14, gluc: 38, lip: 0.5, cat: 'proteines', prixUnit: 0.3, emoji: '🫘' },
  { nom: 'Pois chiches (200g)', kcal: 240, prot: 15, gluc: 40, lip: 4,   cat: 'proteines', prixUnit: 0.4,  emoji: '🫘' },
  // Féculents
  { nom: 'Pâtes (80g sec)',      kcal: 287, prot: 10, gluc: 58, lip: 1.4, cat: 'feculent', prixUnit: 0.15,  emoji: '🍝' },
  { nom: 'Riz (80g sec)',        kcal: 288, prot: 6,  gluc: 64, lip: 0.6, cat: 'feculent', prixUnit: 0.12,  emoji: '🍚' },
  { nom: 'Flocons d\'avoine (80g)', kcal: 302, prot: 11, gluc: 55, lip: 5, cat: 'feculent', prixUnit: 0.2, emoji: '🥣' },
  { nom: 'Pain complet (100g)',  kcal: 247, prot: 9,  gluc: 45, lip: 3,   cat: 'feculent', prixUnit: 0.25,  emoji: '🍞' },
  { nom: 'Pommes de terre (200g)', kcal: 154, prot: 4, gluc: 34, lip: 0.2, cat: 'feculent', prixUnit: 0.2, emoji: '🥔' },
  { nom: 'Quinoa (80g sec)',     kcal: 288, prot: 11, gluc: 53, lip: 4,   cat: 'feculent', prixUnit: 0.6,   emoji: '🌾' },
  // Légumes
  { nom: 'Épinards (150g)',      kcal: 35,  prot: 4,  gluc: 1,  lip: 0.5, cat: 'legumes', prixUnit: 0.5,   emoji: '🥬' },
  { nom: 'Courgettes (200g)',    kcal: 34,  prot: 2.5,gluc: 4,  lip: 0.3, cat: 'legumes', prixUnit: 0.4,   emoji: '🥒' },
  { nom: 'Carottes (150g)',      kcal: 62,  prot: 1.5,gluc: 13, lip: 0.3, cat: 'legumes', prixUnit: 0.2,   emoji: '🥕' },
  { nom: 'Champignons (150g)',   kcal: 33,  prot: 4.5,gluc: 3,  lip: 0.3, cat: 'legumes', prixUnit: 0.6,   emoji: '🍄' },
  { nom: 'Brocoli (200g)',       kcal: 68,  prot: 6,  gluc: 8,  lip: 0.6, cat: 'legumes', prixUnit: 0.5,   emoji: '🥦' },
  { nom: 'Tomates (200g)',       kcal: 36,  prot: 2,  gluc: 6,  lip: 0.4, cat: 'legumes', prixUnit: 0.4,   emoji: '🍅' },
  // Fruits
  { nom: 'Banane',               kcal: 107, prot: 1.3,gluc: 27, lip: 0.3, cat: 'fruits',  prixUnit: 0.25,  emoji: '🍌' },
  { nom: 'Pomme',                kcal: 78,  prot: 0.4,gluc: 20, lip: 0.2, cat: 'fruits',  prixUnit: 0.3,   emoji: '🍎' },
  { nom: 'Orange',               kcal: 84,  prot: 1.7,gluc: 19, lip: 0.2, cat: 'fruits',  prixUnit: 0.4,   emoji: '🍊' },
  // Autres
  { nom: 'Huile d\'olive (1 CS)',kcal: 119, prot: 0,  gluc: 0,  lip: 14,  cat: 'autres',  prixUnit: 0.15,  emoji: '🫒' },
  { nom: 'Lait (250ml)',         kcal: 115, prot: 8,  gluc: 12, lip: 5,   cat: 'autres',  prixUnit: 0.3,   emoji: '🥛' },
  { nom: 'Noix (30g)',           kcal: 196, prot: 4.5,gluc: 4,  lip: 19,  cat: 'autres',  prixUnit: 0.5,   emoji: '🥜' },
  { nom: 'Chocolat noir (30g)',  kcal: 174, prot: 2.5,gluc: 13, lip: 13,  cat: 'autres',  prixUnit: 0.4,   emoji: '🍫' },
  { nom: 'Parmesan (30g)',       kcal: 117, prot: 10, gluc: 0,  lip: 8,   cat: 'autres',  prixUnit: 0.6,   emoji: '🧀' },
  // Aliments doux pour l'intestin
  { nom: 'Lentilles corail (150g cuit)', kcal: 170, prot: 13, gluc: 30, lip: 0.5, cat: 'proteines', prixUnit: 0.25, emoji: '🫘' },
  { nom: 'Kéfir (200ml)',        kcal: 92,  prot: 6,  gluc: 10, lip: 3,   cat: 'proteines', prixUnit: 0.6,  emoji: '🥛' },
  { nom: 'Graines de lin (1 CS)',kcal: 55,  prot: 1.9,gluc: 3,  lip: 4.3, cat: 'autres',  prixUnit: 0.2,   emoji: '🌱' },
  { nom: 'Gingembre frais',      kcal: 10,  prot: 0.2,gluc: 2,  lip: 0.1, cat: 'autres',  prixUnit: 0.3,   emoji: '🫚' },
  { nom: 'Patate douce (200g)',  kcal: 172, prot: 3.2,gluc: 40, lip: 0.2, cat: 'feculent', prixUnit: 0.6,  emoji: '🍠' },
];

/* ── Recettes suggestions ce soir ── */
export const RECETTES_SOIR = [
  {
    nom: 'Pâtes œuf-parmesan',
    temps: '15 min', kcal: 520, prot: 28, budget: '~1.2€',
    desc: 'Cuire les pâtes al dente. Hors feu, incorporer 2 œufs battus + parmesan râpé + poivre noir. Mélanger vite — la chaleur cuit l\'œuf sans le brouiller.',
    ingredients: ['Pâtes (80g)', 'Œufs (2)', 'Parmesan (30g)', 'Poivre'],
    veggie: true,
  },
  {
    nom: 'Riz sauté tofu-courgettes',
    temps: '20 min', kcal: 490, prot: 24, budget: '~1.8€',
    desc: 'Dorer le tofu en dés à feu vif. Ajouter les courgettes en rondelles, riz cuit froid. Splash de sauce soja, œuf brouillé en fin de cuisson.',
    ingredients: ['Riz cuit (150g)', 'Tofu ferme (150g)', 'Courgettes', 'Sauce soja'],
    veggie: true,
  },
  {
    nom: 'Omelette champignons-épinards',
    temps: '10 min', kcal: 380, prot: 32, budget: '~1.4€',
    desc: '3 œufs battus. Faire revenir les champignons émincés, ajouter une poignée d\'épinards frais, verser les œufs. Plier quand les bords prennent.',
    ingredients: ['Œufs (3)', 'Champignons (100g)', 'Épinards (50g)'],
    veggie: true,
  },
];

/* ── Stock permanent (acheté en gros, jamais dans les courses hebdo) ── */
export const STOCK_BASE = [
  { nom: 'Riz blanc (18 kg)',      qte: '~1 mois à deux', note: 'Sac en cours' },
  { nom: 'Pâtes',                  qte: 'grand format',   note: 'Stock en cours' },
  { nom: 'Huile d\'olive',         qte: '1-2 L',          note: 'Réappro mensuel' },
  { nom: 'Flocons d\'avoine',      qte: '1 kg',           note: 'Réappro mensuel' },
  { nom: 'Graines de lin moulues', qte: '250 g',          note: 'Réappro mensuel' },
  { nom: 'Sel, poivre, épices',    qte: 'placard',        note: 'Réappro rare' },
  { nom: 'Sauce soja',             qte: 'bouteille',      note: 'Réappro rare' },
];

/* ── 3 paniers hebdo rotatifs (~22-26€, féculents de stock exclus) ── */
const COURSES_SEMAINES = [
  // Semaine A — poulet + lentilles corail
  [
    { nom: 'Poulet (500g)',             prix: 4.2, cat: 'proteines', qte: '500g' },
    { nom: 'Œufs (x12)',                prix: 2.8, cat: 'proteines', qte: 'boîte x12' },
    { nom: 'Lentilles corail',          prix: 1.2, cat: 'proteines', qte: '500g' },
    { nom: 'Yaourt grec (x4)',          prix: 2.8, cat: 'proteines', qte: 'x4 200g' },
    { nom: 'Kéfir (bouteille)',         prix: 2.2, cat: 'proteines', qte: '500ml' },
    { nom: 'Pain au levain',            prix: 2.2, cat: 'feculent',  qte: 'miche' },
    { nom: 'Carottes (sachet)',         prix: 0.9, cat: 'legumes',   qte: '1kg' },
    { nom: 'Courgettes (x3)',           prix: 1.5, cat: 'legumes',   qte: 'x3' },
    { nom: 'Champignons (barquette)',   prix: 1.8, cat: 'legumes',   qte: '250g' },
    { nom: 'Épinards frais',            prix: 1.5, cat: 'legumes',   qte: '250g' },
    { nom: 'Bananes (grappe)',          prix: 1.2, cat: 'fruits',    qte: '~6' },
    { nom: 'Pommes (sachet)',           prix: 2.0, cat: 'fruits',    qte: '1kg' },
    { nom: 'Gingembre frais',           prix: 0.8, cat: 'autres',    qte: 'morceau' },
  ],
  // Semaine B — tofu + pois chiches + patate douce
  [
    { nom: 'Tofu ferme (2 blocs)',      prix: 3.0, cat: 'proteines', qte: '2×200g' },
    { nom: 'Œufs (x12)',                prix: 2.8, cat: 'proteines', qte: 'boîte x12' },
    { nom: 'Pois chiches (boîte x2)',   prix: 1.6, cat: 'proteines', qte: '2×400g' },
    { nom: 'Thon en boîte (x3)',        prix: 3.0, cat: 'proteines', qte: 'x3 140g' },
    { nom: 'Fromage blanc (x4)',        prix: 2.0, cat: 'proteines', qte: 'x4 200g' },
    { nom: 'Patate douce (x3)',         prix: 2.1, cat: 'feculent',  qte: 'x3' },
    { nom: 'Pain au levain',            prix: 2.2, cat: 'feculent',  qte: 'miche' },
    { nom: 'Tomates (grappe)',          prix: 1.6, cat: 'legumes',   qte: '500g' },
    { nom: 'Courgettes (x3)',           prix: 1.5, cat: 'legumes',   qte: 'x3' },
    { nom: 'Carottes (sachet)',         prix: 0.9, cat: 'legumes',   qte: '1kg' },
    { nom: 'Brocoli (x1)',              prix: 1.2, cat: 'legumes',   qte: '~300g' },
    { nom: 'Bananes (grappe)',          prix: 1.2, cat: 'fruits',    qte: '~6' },
    { nom: 'Oranges (filet)',           prix: 2.0, cat: 'fruits',    qte: '~6' },
    { nom: 'Gingembre frais',           prix: 0.8, cat: 'autres',    qte: 'morceau' },
  ],
  // Semaine C — saumon + haricots rouges + quinoa
  [
    { nom: 'Saumon (2 pavés)',          prix: 5.0, cat: 'proteines', qte: '~260g' },
    { nom: 'Œufs (x12)',                prix: 2.8, cat: 'proteines', qte: 'boîte x12' },
    { nom: 'Haricots rouges (boîte x2)',prix: 1.4, cat: 'proteines', qte: '2×400g' },
    { nom: 'Lentilles corail',          prix: 1.2, cat: 'proteines', qte: '500g' },
    { nom: 'Yaourt grec (x4)',          prix: 2.8, cat: 'proteines', qte: 'x4 200g' },
    { nom: 'Quinoa',                    prix: 2.2, cat: 'feculent',  qte: '500g' },
    { nom: 'Pain au levain',            prix: 2.2, cat: 'feculent',  qte: 'miche' },
    { nom: 'Épinards frais',            prix: 1.5, cat: 'legumes',   qte: '250g' },
    { nom: 'Champignons (barquette)',   prix: 1.8, cat: 'legumes',   qte: '250g' },
    { nom: 'Carottes (sachet)',         prix: 0.9, cat: 'legumes',   qte: '1kg' },
    { nom: 'Courgettes (x2)',           prix: 1.0, cat: 'legumes',   qte: 'x2' },
    { nom: 'Bananes (grappe)',          prix: 1.2, cat: 'fruits',    qte: '~6' },
    { nom: 'Pommes (sachet)',           prix: 2.0, cat: 'fruits',    qte: '1kg' },
    { nom: 'Gingembre frais',           prix: 0.8, cat: 'autres',    qte: 'morceau' },
  ],
];

function getISOWeek(d = new Date()) {
  const date = new Date(d); date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const w1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
}
const WEEK_LABELS = ['A', 'B', 'C'];

/* ── Constantes ── */
const CAT_META = {
  proteines: { label: 'Protéines', emoji: '🥩' },
  feculent:  { label: 'Féculents', emoji: '🌾' },
  legumes:   { label: 'Légumes',   emoji: '🥦' },
  fruits:    { label: 'Fruits',    emoji: '🍎' },
  autres:    { label: 'Autres',    emoji: '📦' },
};
const CAT_ORDER = ['proteines', 'feculent', 'legumes', 'fruits', 'autres'];
const MOMENTS_BASE = [
  { key: 'matin',      label: 'Matin',     emoji: '🌅' },
  { key: 'midi',       label: 'Midi',      emoji: '☀️' },
  { key: 'soir',       label: 'Soir',      emoji: '🌙' },
];
const MOMENT_COLLATION = { key: 'collation', label: 'Collation', emoji: '🥜' };
const COLLATION_IDEAS = ['Banane + poignée de noix', 'Yaourt grec + miel', 'Flocons d\'avoine + lin + lait', 'Barre maison : avoine + beurre cacahuète + miel'];
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function getLundi(d = new Date()) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const lundi = new Date(d);
  lundi.setDate(d.getDate() + diff);
  return lundi.toISOString().slice(0, 10);
}

function getWeekDates(lundiStr) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundiStr + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function fmtJour(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()}`;
}

/* ── CoursesView ─────────────────────────────────────────────────────────── */
function CoursesView() {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newQte, setNewQte] = useState('');
  const [newPrix, setNewPrix] = useState('');
  const [newCat, setNewCat] = useState('proteines');
  const [showRecettes, setShowRecettes] = useState(true);
  const [recetteOpen, setRecetteOpen] = useState(null);

  const load = useCallback(async () => { setItems(await getCourses()); }, []);
  useEffect(() => { load(); }, [load]);

  const budget = items.reduce((s, i) => s + (i.fait ? 0 : (parseFloat(i.prix) || 0)), 0);
  const budgetTotal = items.reduce((s, i) => s + (parseFloat(i.prix) || 0), 0);
  const budgetPct = Math.min(100, Math.round(budget / 35 * 100));
  const budgetColor = budget <= 30 ? 'var(--ok)' : budget <= 40 ? 'var(--ac2)' : 'var(--ac)';

  const weekIdx = getISOWeek() % 3;
  async function genererListe() {
    const existing = await getCourses();
    const existingNoms = existing.map(i => i.nom.toLowerCase());
    const panier = COURSES_SEMAINES[weekIdx];
    const toAdd = panier.filter(c => !existingNoms.includes(c.nom.toLowerCase()));
    await Promise.all(toAdd.map(c => addCourse(c)));
    await load();
  }

  async function toggle(id, fait) { await toggleCourse(id, fait); await load(); }
  async function del(id) { await deleteCourse(id); await load(); }
  async function clearFaites() { await clearCoursesFaites(); await load(); }

  async function ajouter() {
    if (!newNom.trim()) return;
    await addCourse({ nom: newNom.trim(), qte: newQte.trim(), prix: parseFloat(newPrix) || 0, categorie: newCat });
    setNewNom(''); setNewQte(''); setNewPrix(''); setNewCat('proteines'); setShowAdd(false);
    await load();
  }

  const bycat = CAT_ORDER.map(cat => ({
    cat, meta: CAT_META[cat],
    items: items.filter(i => (i.categorie || 'autres') === cat),
  })).filter(g => g.items.length > 0);

  const faites = items.filter(i => i.fait).length;

  return html`<div>

    <div class="nutri-budget-box">
      <div class="nutri-budget-top">
        <span class="nutri-budget-lbl">Budget estimé</span>
        <span class="nutri-budget-val" style=${'color:' + budgetColor}>${budget.toFixed(2)} €</span>
        <span class="nutri-budget-obj">/ 35 €</span>
      </div>
      <div class="prog-bar" style="margin-top:7px">
        <div class="prog-fill" style=${'width:' + budgetPct + '%;background:' + budgetColor}/>
      </div>
      ${faites > 0 ? html`<div class="nutri-hint">${faites} article(s) déjà en panier — budget affiché = restant à acheter</div>` : ''}
    </div>

    <div style="display:flex;gap:7px;margin-bottom:1.1rem">
      <button class="btn" style="flex:1" onClick=${genererListe}>⊕ Liste sem. ${WEEK_LABELS[weekIdx]}</button>
      ${faites > 0 ? html`<button class="btn" onClick=${clearFaites}>✓ Vider panier</button>` : ''}
      <button class=${'btn' + (showAdd ? ' pri' : '')} onClick=${() => setShowAdd(v => !v)}>+ Article</button>
    </div>

    ${showAdd ? html`<div class="nutri-add-form">
      <input class="taginp" style="width:100%;margin-bottom:7px" placeholder="Nom de l'article…"
        value=${newNom} onInput=${e => setNewNom(e.target.value)}
        onKeyDown=${e => e.key === 'Enter' && ajouter()} autoFocus/>
      <div style="display:flex;gap:6px;margin-bottom:7px">
        <input class="taginp" style="flex:1" placeholder="Qté (ex: 500g, x3)" value=${newQte} onInput=${e => setNewQte(e.target.value)}/>
        <input class="taginp" style="width:80px" placeholder="Prix €" type="number" step="0.1" min="0"
          value=${newPrix} onInput=${e => setNewPrix(e.target.value)}/>
      </div>
      <div class="types" style="flex-wrap:wrap;margin-bottom:9px">
        ${CAT_ORDER.map(c => html`<button key=${c} class=${'type-btn' + (newCat === c ? ' on' : '')}
          onClick=${() => setNewCat(c)}>${CAT_META[c].emoji} ${CAT_META[c].label}</button>`)}
      </div>
      <div style="display:flex;gap:7px">
        <button class="save-btn" style="flex:1" onClick=${ajouter} disabled=${!newNom.trim()}>Ajouter</button>
        <button class="btn" onClick=${() => setShowAdd(false)}>Annuler</button>
      </div>
    </div>` : ''}

    ${bycat.length === 0 ? html`<div class="empty-state">
      Liste vide — clique sur « Générer liste de base » pour démarrer
    </div>` : bycat.map(g => html`<div key=${g.cat} class="nutri-cat-group">
      <div class="nutri-cat-hdr">${g.meta.emoji} ${g.meta.label}
        <span class="nutri-cat-count">${g.items.filter(i => !i.fait).length}/${g.items.length}</span>
      </div>
      ${g.items.map(item => html`<div key=${item.id} class=${'nutri-course-item' + (item.fait ? ' done' : '')}>
        <div class="nutri-course-check" onClick=${() => toggle(item.id, !item.fait)}>
          ${item.fait ? html`<span class="nutri-check-ic done">✓</span>` : html`<span class="nutri-check-ic"/>` }
        </div>
        <div class="nutri-course-info" onClick=${() => toggle(item.id, !item.fait)}>
          <span class="nutri-course-nom">${item.nom}</span>
          ${item.qte ? html`<span class="nutri-course-qte">${item.qte}</span>` : ''}
        </div>
        <span class="nutri-course-prix">${item.prix > 0 ? item.prix.toFixed(2) + ' €' : ''}</span>
        <button class="del-btn" onClick=${() => del(item.id)}>×</button>
      </div>`)}
    </div>`)}

    <div class="nutri-stock-box">
      <div class="nutri-section-hdr" style="margin-bottom:7px">📦 Stock de base — pas à racheter</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${STOCK_BASE.map((s, i) => html`<span key=${i} class="nutri-stock-chip" title=${s.note}>${s.nom}</span>`)}
      </div>
    </div>

    <div class="nutri-section-hdr" style="cursor:pointer;margin-top:1.4rem"
      onClick=${() => setShowRecettes(v => !v)}>
      🍳 Recettes pour ce soir
      <span style="float:right;opacity:.5">${showRecettes ? '▲' : '▼'}</span>
    </div>

    ${showRecettes ? html`<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
      ${RECETTES_SOIR.map((r, i) => html`<div key=${i} class="nutri-recette-card"
        onClick=${() => setRecetteOpen(recetteOpen === i ? null : i)}>
        <div class="nutri-recette-top">
          <span class="nutri-recette-nom">${r.nom}</span>
          <span class="nutri-recette-badge">${r.temps}</span>
        </div>
        <div class="nutri-recette-meta">
          <span>${r.kcal} kcal</span> · <span>${r.prot}g protéines</span> · <span>${r.budget}</span>
          ${r.veggie ? html`<span class="nutri-veggie-tag">🌱</span>` : ''}
        </div>
        ${recetteOpen === i ? html`<div class="nutri-recette-detail">
          <p style="font-size:13px;line-height:1.55;margin-bottom:8px">${r.desc}</p>
          <div class="nutri-ingredients">
            ${r.ingredients.map((ing, j) => html`<span key=${j} class="chip">${ing}</span>`)}
          </div>
        </div>` : ''}
      </div>`)}
    </div>` : ''}
  </div>`;
}

/* ── PlanningView ─────────────────────────────────────────────────────────── */
function PlanningView() {
  const [repasData, setRepasData] = useState([]);
  const [lundi] = useState(getLundi);
  const [modal, setModal] = useState(null);
  const [nom, setNom] = useState('');
  const [kcal, setKcal] = useState('');
  const [prot, setProt] = useState('');
  const [libre, setLibre] = useState(false);
  const [showCollation, setShowCollation] = useState(false);

  const dates = getWeekDates(lundi);
  const moments = showCollation
    ? [MOMENTS_BASE[0], MOMENT_COLLATION, MOMENTS_BASE[1], MOMENTS_BASE[2]]
    : MOMENTS_BASE;

  const load = useCallback(async () => {
    const all = await getRepasSemaine(lundi);
    setRepasData(all);
  }, [lundi]);
  useEffect(() => { load(); }, [load]);

  function getRepasCell(date, moment) {
    return repasData.find(r => r.date === date && r.moment === moment);
  }

  function openModal(date, moment) {
    const existing = getRepasCell(date, moment);
    if (existing) return;
    setModal({ date, moment });
    setNom(''); setKcal(''); setProt(''); setLibre(false);
  }

  async function saveRepas() {
    if (!nom.trim() && !libre) return;
    await addRepas({
      date: modal.date,
      moment: modal.moment,
      nom: libre ? '🎉 Repas libre' : nom.trim(),
      kcal: parseInt(kcal) || 0,
      prot: parseInt(prot) || 0,
    });
    setNutriBadge('cuisinier');
    addNutriXP(10);
    setModal(null);
    await load();
  }

  async function delRepas(id) { await deleteRepas(id); await load(); }

  const today = new Date().toISOString().slice(0, 10);

  return html`<div>
    <div class="nutri-planning-scroll">
      <table class="nutri-planning-table">
        <thead>
          <tr>
            <th class="nutri-th-moment"/>
            ${dates.map(d => html`<th key=${d} class=${'nutri-th-day' + (d === today ? ' today' : '')}>
              ${fmtJour(d)}
            </th>`)}
          </tr>
        </thead>
        <tbody>
          ${moments.map(m => html`<tr key=${m.key} class=${m.key === 'collation' ? 'nutri-tr-collation' : ''}>
            <td class="nutri-td-moment">${m.emoji}</td>
            ${dates.map(d => {
              const r = getRepasCell(d, m.key);
              const isToday = d === today;
              return html`<td key=${d} class=${'nutri-td-cell' + (isToday ? ' today' : '')}
                onClick=${() => r ? null : openModal(d, m.key)}>
                ${r ? html`<div class="nutri-cell-repas">
                  <span class="nutri-cell-nom">${r.nom}</span>
                  ${r.kcal ? html`<span class="nutri-cell-kcal">${r.kcal}</span>` : ''}
                  <button class="nutri-cell-del" onClick=${e => { e.stopPropagation(); delRepas(r.id); }}>×</button>
                </div>` : html`<span class="nutri-cell-add">+</span>`}
              </td>`;
            })}
          </tr>`)}
        </tbody>
      </table>
    </div>

    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;margin-bottom:6px">
      <button class=${'btn' + (showCollation ? ' pri' : '')} style="font-size:11px;padding:5px 11px"
        onClick=${() => setShowCollation(v => !v)}>
        🥜 ${showCollation ? 'Masquer collations' : 'Afficher collations'}
      </button>
      <span class="hint" style="margin:0">🎉 = repas libre</span>
    </div>
    ${showCollation ? html`<div class="nutri-collation-ideas">
      <span class="sec-t">Idées collation ·</span>
      ${COLLATION_IDEAS.map((idea, i) => html`<span key=${i} class="chip" style="font-size:11px">${idea}</span>`)}
    </div>` : ''}

    ${modal ? html`<div class="modal-ov" onClick=${e => e.target === e.currentTarget && setModal(null)}>
      <div class="modal-sh">
        <div class="modal-hdl"/>
        <div class="sec-t" style="display:block;margin-bottom:1rem">
          ${[...MOMENTS_BASE, MOMENT_COLLATION].find(m => m.key === modal.moment)?.emoji} ${fmtJour(modal.date)} · ${[...MOMENTS_BASE, MOMENT_COLLATION].find(m => m.key === modal.moment)?.label}
        </div>

        <div style="display:flex;gap:7px;margin-bottom:11px">
          <button class=${'prio-pill' + (!libre ? ' on' : '')} onClick=${() => setLibre(false)} style="flex:1">Repas planifié</button>
          <button class=${'prio-pill' + (libre ? ' on' : '')} onClick=${() => setLibre(true)} style="flex:1">🎉 Repas libre</button>
        </div>

        ${!libre ? html`<div>
          <div class="set-label">Nom du repas</div>
          <input class="taginp" style="width:100%;margin-bottom:9px" placeholder="Ex : Riz tofu-légumes"
            value=${nom} onInput=${e => setNom(e.target.value)} autoFocus/>
          <div style="display:flex;gap:7px;margin-bottom:11px">
            <div style="flex:1">
              <div class="set-label">Kcal (approx.)</div>
              <input class="taginp" style="width:100%" type="number" placeholder="450" value=${kcal}
                onInput=${e => setKcal(e.target.value)}/>
            </div>
            <div style="flex:1">
              <div class="set-label">Protéines (g)</div>
              <input class="taginp" style="width:100%" type="number" placeholder="30" value=${prot}
                onInput=${e => setProt(e.target.value)}/>
            </div>
          </div>
        </div>` : html`<p style="font-size:13px;color:var(--ink2);margin-bottom:14px">
          Soirée avec des amis, déjeuner collègues, restaurant — aucun suivi, juste du plaisir.
        </p>`}

        <div style="display:flex;gap:7px">
          <button class="save-btn" style="flex:1" onClick=${saveRepas}
            disabled=${!libre && !nom.trim()}>Enregistrer</button>
          <button class="btn" onClick=${() => setModal(null)}>Annuler</button>
        </div>
      </div>
    </div>` : ''}
  </div>`;
}

/* ── MacroBar (composant stateless) ─────────────────────────────────────── */
function MacroBar({ label, val, max, unit }) {
  const pct = Math.min(100, Math.round(val / max * 100));
  const status = pct < 80 ? 'under' : pct <= 110 ? 'ok' : 'over';
  const barColor = status === 'ok' ? 'var(--ok)' : status === 'over' ? 'var(--ac)' : 'var(--ac2)';
  return html`<div class="nutri-macro-row">
    <div class="nutri-macro-lbl">
      <span>${label}</span>
      <span class="nutri-macro-val" style=${'color:' + barColor}>${val}<small>${unit}</small></span>
      <span class="nutri-macro-max">/ ${max}${unit}</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" style=${'width:' + pct + '%;background:' + barColor}/></div>
    <div class="nutri-macro-status">
      ${status === 'ok' ? html`<span class="nutri-status-ok">◉ Dans la cible</span>` :
        status === 'over' ? html`<span class="nutri-status-over">▲ Au-dessus</span>` :
        html`<span class="nutri-status-under">▽ Sous l'objectif</span>`}
    </div>
  </div>`;
}

/* ── MacrosView ─────────────────────────────────────────────────────────── */
function MacrosView() {
  const [obj, setObj] = useState(getMacrosObjectif());
  const [todayRepas, setTodayRepas] = useState([]);
  const [editObj, setEditObj] = useState(false);
  const [tmpObj, setTmpObj] = useState({ ...getMacrosObjectif() });
  const [protStreak, setProtStreak] = useState(0);
  const [badges, setBadges] = useState(getNutriBadges());
  const [xp, setXp] = useState(getNutriXP());

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    const r = await getRepas(today);
    setTodayRepas(r);
    setBadges(getNutriBadges());
    setXp(getNutriXP());
    let streak = 0;
    const o = getMacrosObjectif();
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const reps = await getRepas(ds);
      const totalProt = reps.reduce((s, x) => s + (x.prot || 0), 0);
      if (totalProt >= o.prot) { streak++; } else if (i > 0) { break; }
    }
    setProtStreak(streak);
  }, [today]);
  useEffect(() => { load(); }, [load]);

  const totals = todayRepas.reduce((acc, r) => ({
    kcal: acc.kcal + (r.kcal || 0),
    prot: acc.prot + (r.prot || 0),
    gluc: acc.gluc + (r.gluc || 0),
    lip:  acc.lip  + (r.lip  || 0),
  }), { kcal: 0, prot: 0, gluc: 0, lip: 0 });

  function saveObj() {
    saveMacrosObjectif(tmpObj);
    setObj({ ...tmpObj });
    setEditObj(false);
  }

  const NUTRI_BADGES = [
    { id: 'cuisinier', e: '👨‍🍳', label: 'Cuisinier', desc: 'Premier repas planifié' },
    { id: 'semaine_complete', e: '📅', label: 'Semaine complète', desc: '7 jours, 2+ repas/jour' },
    { id: 'streak_prot_7', e: '💪', label: 'Protéines ×7', desc: '7 jours d\'objectif protéines atteint' },
  ];

  return html`<div>

    <div class="nutri-kpi-row">
      <div class="kpi"><div class="kpi-n">${totals.kcal}<small> kcal</small></div><div class="kpi-l">Aujourd'hui</div></div>
      <div class="kpi"><div class="kpi-n">${totals.prot}<small> g</small></div><div class="kpi-l">Protéines</div></div>
      <div class="kpi"><div class="kpi-n">${xp}<small> xp</small></div><div class="kpi-l">Total XP</div></div>
    </div>

    <div class="nutri-macro-block">
      <${MacroBar} label="Kcal"        val=${totals.kcal} max=${obj.kcal} unit=" kcal"/>
      <${MacroBar} label="Protéines"   val=${totals.prot} max=${obj.prot} unit="g"/>
      <${MacroBar} label="Glucides"    val=${totals.gluc} max=${obj.gluc} unit="g"/>
      <${MacroBar} label="Lipides"     val=${totals.lip}  max=${obj.lip}  unit="g"/>
    </div>

    ${protStreak > 0 ? html`<div class="nutri-streak-badge">
      🔥 Objectif protéines atteint · <strong>${protStreak} jour${protStreak > 1 ? 's' : ''}</strong> d'affilée
    </div>` : ''}

    <div class="sec-h" style="margin-top:1.2rem">
      <span class="sec-t">Objectifs journaliers</span>
      <button class="btn" style="font-size:11px;padding:4px 10px" onClick=${() => { setTmpObj({ ...obj }); setEditObj(v => !v); }}>
        ${editObj ? 'Annuler' : 'Modifier'}
      </button>
    </div>

    ${editObj ? html`<div class="nutri-add-form">
      ${[['kcal','Calories (kcal)'],['prot','Protéines (g)'],['gluc','Glucides (g)'],['lip','Lipides (g)']].map(([k, lbl]) =>
        html`<div key=${k} style="display:flex;align-items:center;gap:9px;margin-bottom:7px">
          <span class="nutri-macro-lbl" style="width:130px;flex-shrink:0">${lbl}</span>
          <input class="taginp" type="number" min="0" style="flex:1" value=${tmpObj[k]}
            onInput=${e => setTmpObj(p => ({ ...p, [k]: parseInt(e.target.value) || 0 }))}/>
        </div>`
      )}
      <button class="save-btn" style="width:100%;margin-top:4px" onClick=${saveObj}>Enregistrer les objectifs</button>
    </div>` : html`<div class="nutri-obj-chips">
      <span class="chip">${obj.kcal} kcal</span>
      <span class="chip">${obj.prot}g prot.</span>
      <span class="chip">${obj.gluc}g gluc.</span>
      <span class="chip">${obj.lip}g lip.</span>
    </div>`}

    <div class="sec-h" style="margin-top:1.3rem"><span class="sec-t">Badges nutrition</span></div>
    <div class="badges-grid">
      ${NUTRI_BADGES.map(b => html`<div key=${b.id} class=${'badge-cell' + (badges[b.id] ? '' : ' locked')}>
        <div class="badge-e">${b.e}</div>
        <div class="badge-l">${b.label}</div>
        ${!badges[b.id] ? html`<div class="badge-prog">${b.desc}</div>` : ''}
      </div>`)}
    </div>

    ${todayRepas.length > 0 ? html`<div style="margin-top:1.3rem">
      <div class="sec-h"><span class="sec-t">Repas du jour</span></div>
      ${todayRepas.map(r => html`<div key=${r.id} class="nutri-repas-row">
        <span class="nutri-repas-moment">${[...MOMENTS_BASE, MOMENT_COLLATION].find(m => m.key === r.moment)?.emoji}</span>
        <span class="nutri-repas-nom">${r.nom}</span>
        <span class="nutri-repas-kcal">${r.kcal ? r.kcal + ' kcal' : ''}</span>
      </div>`)}
    </div>` : html`<div class="empty-state" style="margin-top:1.3rem">Aucun repas logué aujourd'hui — ajoute-les dans Planning</div>`}
  </div>`;
}

/* ── Nutrition (composant racine exporté) ─────────────────────────────────── */
export function Nutrition() {
  const [sub, setSub] = useState('courses');
  const now = new Date();
  const DAYS   = ['DIM','LUN','MAR','MER','JEU','VEN','SAM'];
  const MONTHS = ['JANV','FÉVR','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC'];
  const fmtDate = d => `${DAYS[d.getDay()]}. ${d.getDate()} ${MONTHS[d.getMonth()]}`;

  return html`<div class="scroll">
    <div class="hdr">
      <div class="brand">Zebracorn OS · Sport</div>
      <div class="date-lbl">${fmtDate(now)}</div>
    </div>
    <div class="h1">Nutrition.</div>
    <div class="greet">Bien manger = bien s'entraîner. Simple, étudiant, durable.</div>

    <div class="prio-pills" style="margin-bottom:1.2rem">
      <button class=${'prio-pill' + (sub === 'courses' ? ' on' : '')} onClick=${() => setSub('courses')}>🛒 Courses</button>
      <button class=${'prio-pill' + (sub === 'planning' ? ' on' : '')} onClick=${() => setSub('planning')}>📅 Planning</button>
      <button class=${'prio-pill' + (sub === 'macros' ? ' on' : '')} onClick=${() => setSub('macros')}>📊 Macros</button>
    </div>

    ${sub === 'courses' ? html`<${CoursesView}/>` :
      sub === 'planning' ? html`<${PlanningView}/>` :
      html`<${MacrosView}/>`}

    <div class="foot" style="margin-top:1.4rem">Sport · nutrition locale · aucune API externe</div>
  </div>`;
}
