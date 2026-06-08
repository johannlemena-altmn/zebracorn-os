# Journal — Zebracorn OS

Mémoire cumulative du projet : ce qui a été fait, **pourquoi**, et ce qui vient.
Tenu selon le skill `atelier-produit`. Entrées les plus récentes en haut.

---

## 2026-06-08 — Incrément 2 : Chantier/Tâche + onglet « La semaine »

- **Fait** :
  - Modèle de données `chantiers` (titre, couleur rouge/bleu/vert, statut) et `taches`
    (chantierId FK, titre, fait 0/1) — Dexie version 2, migration automatique.
  - Helpers : `addChantier`, `getChantiers`, `deleteChantier`, `addTache`, `getTaches`,
    `toggleTache`, `deleteTache`.
  - Onglet **« La Semaine »** (3ème tab, icône ◫) : 3 sections color-codées
    🔴 Maintenant · J+1 / 🔵 Cette semaine / 🟢 Horizon · long terme.
  - CRUD complet inline : ajouter/supprimer chantier, ajouter/supprimer/cocher tâche.
    Chaque ChantierCard est pliable, compteur avancement (done/total).
  - Token `--bleu: #3a6fa8` ajouté au design system (dark : `#5a8fc8`).
  - SW bumped `zebracorn-v2` pour invalider le cache.

- **Pourquoi** : ancrer l'app dans les vrais chantiers de Johann — réflexion
  d'orientation (mémoire M2, ressourcement scientifique, positionnement Regen) et
  objectifs opérationnels — plutôt que de rester sur des tâches hardcodées. La session
  a aussi posé le cadre d'orientation : mémoire = colonne vertébrale, sujet à centrer
  sur le déficit épistémologique des écoles de management face aux enjeux Regen.

- **DoD** : onglet visible, CRUD persisté en IndexedDB, survit au reload, dark mode ✓.

- **Décision notable** : couleur « bleu » comme nouvel axe sémantique (semaine courante)
  en plus de terracotta (urgence) et vert (horizon). Jeton CSS `--bleu` propre, pas de
  valeur en dur dans le JS.

- **Prochain** : incrément 3 — seeder les vrais chantiers de Johann + connexion avec
  l'écran Maintenant (les 3 tâches du jour piochent dans les chantiers actifs 🔴).

- **Jauge** : ≈ 4,2 € / 5 € (cumul estimation session).

## 2026-06-07 — Skill « atelier-produit » + discipline de suivi
- **Fait** : création du skill projet `.claude/skills/atelier-produit/` (posture
  PO/PM senior + UX/architecte frugal, boucle en 5 temps) et de ce JOURNAL.
- **Pourquoi** : se doter d'une méthode ré-itérable à chaque requête pour
  construire la bonne chose, en bonne et due forme, avec une trace concrète.
  Skill mis *dans le repo* pour être disponible sur mobile (Claude Code).
- **DoD** : skill écrit, JOURNAL amorcé, poussé sur `origin/main`.
- **Prochain** : incrément 2 — modèle `Chantier`/`Tache` + onglet « La semaine »
  (3 priorités couleur 🔴🔵🟢).
- **Jauge** : ≈ 3,1 € / 5 € (estimation).

## 2026-06-07 — Slice verticale validée (Maintenant + Capture persistée)
- **Fait** : écran « Maintenant » (rail captif, intention, 3 tâches, routines +
  streaks, mini-tracker 7 j) et écran « Capturer » (composer 1-geste + inbox).
  Capture persistée en IndexedDB (Dexie), survit au reload. PWA (manifest + sw).
- **Pourquoi** : valider le chemin critique du JTBD (capter en 1 geste →
  persister → ressortir dans l'inbox) avant ACTOR / Le Filtre.
- **DoD** : testé en preview — capture ajoutée, reload, donnée retrouvée dans
  l'inbox ; rendu fidèle aux maquettes (Fraunces/Inter/JetBrains Mono, dark mode).
- **Décisions notables** :
  - **Pivot Babel → Preact + htm** (ES modules via esm.sh) au lieu de
    React+Babel CDN. Raison : Babel CDN transpile chaque script en scope isolé →
    les `const`/`function` top-level ne deviennent pas globaux de façon fiable
    (composants `undefined`, page blanche). Preact+htm = zéro build, zéro race
    condition, 3 ko, plus rapide sur iPhone. Écart au scope assumé, dans le bon
    sens (plus léger, plus robuste).
  - Fix `db.js` : retrait d'une ligne `const {...} = React` obsolète qui faisait
    planter silencieusement la persistance (React n'est plus global avec Preact).
  - Nettoyage : suppression des fichiers `app.jsx`, `screens/*.jsx` devenus
    inutiles (tout le JSX est inline dans `index.html`).
- **Prochain** : incrément 2 (voir entrée ci-dessus).

---

## Backlog / horizons (source : notes du 06/06 + scope)

Priorités : 🔴 pour J+1 · 🔵 à caser cette semaine · 🟢 long terme (suivi multi-jours).

**Incréments produit à venir**
1. ✅ Slice verticale (Maintenant + Capture persistée).
2. ✅ Modèle `Chantier`/`Tache` + onglet « La semaine » (3 groupes couleur, CRUD).
3. Badges couleur sur Maintenant + fiches-chantiers 🟢 (étapes + captures reliées).
4. Moteur de composition auto des 3 tâches du jour (prio + variation anti-monotonie).
5. Google Calendar (lecture events + prép auto). — le plus lourd, en dernier.
6. Traitement ACTOR + module « Le Filtre » (résumé épistémologique IA).

**Objectifs réels à saisir dans l'app (incrément 2)** : répondre à Léo, répondre
à Laura, réviser finance (test), Talents for the Planet (chantier), liste de
courses, organiser sport+cooking, ressources prisme, livres low-tech, prix
hédonique (chantier), projet médiation scientifique / Bobroff (chantier),
réactiver vieux dossiers → format de contenu (chantier).
