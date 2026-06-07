# Journal — Zebracorn OS

Mémoire cumulative du projet : ce qui a été fait, **pourquoi**, et ce qui vient.
Tenu selon le skill `atelier-produit`. Entrées les plus récentes en haut.

---

## 2026-06-07 — Sync cloud (Supabase) + export/import + icônes PWA
- **Fait** :
  - **Sync cloud** optionnelle via **Supabase côté client** (`sync.js`, SDK en
    lazy-import → app légère par défaut) : 1 ligne par table, last-write-wins,
    identifiée par un `space_id` secret. **4ᵉ onglet « Réglages » ⚙** : config +
    boutons **Pousser/Tirer** (explicites, pas d'auto-écrasement). Setup → README.
  - **Export/Import JSON** (`db.js`) — filet de sécurité offline.
  - **Icônes PWA** (`icons/icon-192|512.png`, terracotta) → install iPhone propre.
  - `window.db` exposé pour que le module `sync.js` accède à l'instance Dexie.
- **Pourquoi** : permettre de synchroniser tél ↔ ordi pour tester dès demain.
  App statique → Supabase client = **zéro backend**, reste compatible Vercel statique.
- **DoD vérifié (sans son compte)** : app rend, 4 onglets OK, Réglages fidèle au
  design, **export/import round-trip 8→0→8 OK**, zéro erreur console.
- **⏳ NON vérifié par l'IA** : le round-trip **CLOUD** (nécessite le compte
  Supabase de Johann) → **à tester par lui** via le setup README (SQL + clés).
- **Décision** : sync **explicite** en v1 (boutons) — pas d'auto-sync, pour éviter
  l'écrasement silencieux tant que la confiance n'est pas établie. Auto-sync =
  refinement futur (pull-on-open + push-on-hide, avec garde anti-perte).

## 2026-06-07 — Incrément 2c + seed : Maintenant ↔ backlog + amorçage
- **Fait** : les « 3 tâches clés du jour » de Maintenant sont désormais **piochées
  dans le backlog** (🔴 d'abord, puis 🔵), avec pastille couleur ; cocher une tâche
  écrit la même donnée que l'onglet Semaine → cohérence inter-écrans. **Seed
  initial** (une fois, flag localStorage) qui amorce la semaine avec les 11
  objectifs réels de Johann (4 🔴 + 4 🔵 + 3 chantiers 🟢 avec 1ʳᵉ étape).
- **Pourquoi** : relier planification (Semaine) et action (Maintenant) — le backlog
  devient vivant ; donner de la matière pour tester dès demain matin.
- **DoD** : testé preview — purge + reload déclenche le seed (8 tâches, 3 chantiers),
  Maintenant affiche les 3 🔴 prioritaires, cocher persiste.
- **Décisions** : suppression de `DEF_TASKS` (tâches hardcodées). Les helpers
  `taskChecks` deviennent inutilisés → à nettoyer. **Abandon du faux compteur
  « €/5 € »** : la vraie jauge = panneau d'usage Claude Code ; skill corrigé.
- **Prochain** : backlog priorisé ci-dessous (à faire sur Sonnet).

## 2026-06-07 — Incrément 2b : onglet « La semaine » (UI backlog)
- **Fait** : 3ᵉ onglet « Semaine » avec ajout rapide (input + pastilles 🔴🔵🟢) et
  3 groupes : 🔴 *Cette échéance* / 🔵 *Cette semaine* (tâches cochables, suppr.)
  + 🟢 *Chantiers* (cartes-progression, pas de case à cocher). CRUD branché sur
  les helpers Dexie. Nav passée à 3 onglets (Maintenant · Semaine · Capturer).
- **Pourquoi** : donner un lieu où poser les objectifs 🔴/🔵/🟢. Choix UX :
  la couleur = l'urgence ; un chantier *progresse* (ne se coche pas) → renvoie du
  progrès, pas de la culpabilité.
- **Décision design (sobriété)** : la couleur passe par les **emojis** 🔴🔵🟢,
  pas par de nouveaux tokens palette → zéro dérive du design system papier/encre/
  terracotta. Chrome en neutres chauds existants.
- **Bug corrigé (important)** : le service worker était **cache-first** → il
  masquait les mises à jour CSS/JS (la carte chantier restait non stylée). Passé
  en **network-first** (frais en ligne, cache seulement pour l'offline) +
  cache bumpé v2. Piège qui aurait pollué tout le reste du projet.
- **DoD** : testé preview — ajout des 3 types, persistance, rendu fidèle, CSS
  frais confirmé. (Données de test laissées dans IndexedDB du preview seulement,
  pas dans le repo ni sur Vercel.)
- **Prochain** : 2c — lier le backlog au « Maintenant » (badges couleur + pioche
  des 3 tâches du jour depuis 🔴/🔵).
- **Jauge** : ≈ 4,5 € / 5 € (estimation — gros incrément UI + debug SW).

## 2026-06-07 — Incrément 2a : fondation données backlog
- **Fait** : modèle `Chantier` (🟢 long terme, progression + prochaine étape) +
  `Étape` + `Tâche` one-shot (🔴/🔵) ajoutés à `db.js` (migration Dexie v2) avec
  leurs helpers CRUD (add/get/update/delete, toggleEtape, toggleTacheDone, setTacheDate).
- **Pourquoi** : poser le socle de données AVANT l'UI, pour le découper du gros
  incrément 2 et rester frugal en budget (pas de screenshots). Les 3 objets
  reflètent la conception : un chantier ne se coche pas (il progresse).
- **DoD** : testé en console (preview) — création chantier+étape+tâche, survie au
  reload, nettoyage OK. Pas encore d'UI (c'est la tranche 2b).
- **Prochain** : 2b — onglet « La semaine » (3 groupes couleur 🔴🔵🟢, CRUD visible).
- **Jauge** : ≈ 3,6 € / 5 € (estimation).

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

## 2026-06-07 — Incrément 4 : fiche-chantier (étapes + prochaine étape)
- **Fait** : cliquer sur un 🟢 dans « Semaine » ouvre la **fiche du chantier** : titre, barre de progression (n/total étapes · %), liste d'étapes cochables (case ✓, texte barré, compteur en temps réel), champ « Prochaine étape » éditable (sauvegarde à blur, reflété sur la carte Semaine), bouton « + » pour ajouter une étape, retour « ← Semaine » avec rechargement du backlog. Le ✕ de la carte Semaine reste fonctionnel (stopPropagation).
- **Pourquoi** : les chantiers 🟢 sont des projets multi-semaines qui progressent, pas des cases à cocher. La fiche donne un espace de suivi réel sans alourdir la vue Semaine.
- **DoD** : testé preview — ajout étape, cochage (barre 0→100 %), retour Semaine, chantier re-listé avec prochaine étape mise à jour. Zéro erreur console.
- **Décisions** : pas de suppression d'étape en v1 (scope minimal) ; la barre de progression n'apparaît que si ≥1 étape (évite le widget vide inutile). CSS `.back-btn`, `.prog-wrap`, `.prog-bar`, `.prog-fill` ajoutés sans toucher aux tokens existants.
- **Prochain** : AMWAP enrichi (log de victoires, feedback dopamine) puis Capturer (upload fichier, second cerveau).

## 2026-06-07 — Nettoyage dead code : getTaskCheck / toggleTaskCheck
- **Fait** : suppression des deux helpers `getTaskCheck` et `toggleTaskCheck` dans `db.js`.
- **Pourquoi** : orphelins depuis la suppression des `DEF_TASKS` hardcodées (incrément 2c). Aucun appel dans `index.html` ni dans `sync.js`. La table `taskChecks` reste dans le schéma Dexie (données utilisateur préservées) et dans `SYNC_TABLES` (compatibilité export/import) — la migration de table est un scope distinct.
- **DoD** : zéro erreur console, app rend normalement.
- **Prochain** : incrément 4 — fiche-chantier (ouvrir un 🟢 → cocher ses étapes + éditer la prochaine étape).

---

## Backlog / horizons (source : notes du 06/06 + scope)

Priorités : 🔴 pour J+1 · 🔵 à caser cette semaine · 🟢 long terme (suivi multi-jours).

**Incréments produit à venir**
1. ✅ Slice verticale (Maintenant + Capture persistée).
2. ✅ Onglet « La semaine » (3 couleurs, CRUD) + Maintenant pioche le backlog + seed.
3. ✅ Icônes PWA + sync cloud Supabase + export/import JSON.
4. Fiche-chantier : ouvrir un 🟢 → cocher ses étapes + éditer la prochaine étape. [moyen]
5. Lier captures ↔ chantiers (mémoire cumulative) depuis l'inbox. [moyen]
6. Échéances datées sur 🔴/🔵 + tri + **nettoyage dead code** (`taskChecks`, helpers `getTaskCheck`/`toggleTaskCheck` inutilisés). [petit-moyen]
7. **Auto-sync** (pull-on-open + push-on-hide, avec garde anti-perte) — une fois la sync manuelle validée. [moyen]
8. Traitement ACTOR sur une capture + « Le Filtre » (résumé IA, clé API). [gros, cœur jugement]
9. Google Calendar (events du jour + prép auto). [gros, en dernier]
10. Moteur de variation anti-monotonie (rotation des angles). [moyen]
11. Icônes : remplacer le carré terracotta plat par un vrai logo (Z / zèbre). [petit]

**Objectifs réels à saisir dans l'app (incrément 2)** : répondre à Léo, répondre
à Laura, réviser finance (test), Talents for the Planet (chantier), liste de
courses, organiser sport+cooking, ressources prisme, livres low-tech, prix
hédonique (chantier), projet médiation scientifique / Bobroff (chantier),
réactiver vieux dossiers → format de contenu (chantier).
