# Journal — Zebracorn OS

Mémoire cumulative du projet : ce qui a été fait, **pourquoi**, et ce qui vient.
Tenu selon le skill `atelier-produit`. Entrées les plus récentes en haut.

---

## 2026-06-08 — Incrément 9 : Liens entre captures (Obsidian-like)

- **Fait** :
  - `linkCaptures(a,b)` / `unlinkCaptures(a,b)` bidirectionnels dans `db.js` (`linkedIds:[]`).
  - Section "Liens" dans la carte expansible : affiche les captures liées avec bouton × délier.
  - Picker "🔗 Lier" : liste toutes les autres captures (triées par date), toggle Lier/✓Lié.
  - Mise à jour locale (setInbox + setLinkedCaps) — pas de reload complet, fluidité maintenue.
  - Indicateur 🔗 N en bleu (`var(--bleu)`) sur les cartes collapsées ayant des liens.

- **Pourquoi** : les captures restaient des silos. Le lien bidirectionnel crée un graphe de connaissance
  minimal sans complexité d'interface (pas de vue graphe — les liens sont visibles dans la carte).
  Fondation pour les badges gamification ("1er lien", "5 liens sur un chantier").

- **DoD** : structure relue in-context. stopPropagation sur tous les boutons du picker.
  Mise à jour locale cohérente avec l'inbox.

- **Prochain** : incrément 10 — Gamification (stats corpus + badges paliers) + Icône Z/zèbre.

---

## 2026-06-08 — Incrément 8 : Carte expansible + notes pré-ACTOR

- **Fait** :
  - Tap sur le corps d'une carte inbox → expand (flèche ↓/↑).
  - Contenu complet visible, champ "Notes" (textarea) sauvegardé à la perte de focus via `updateCaptureNotes`.
  - Chantier lié affiché en chip vert si la capture est liée à un chantier.
  - "Traiter ✓" pré-remplit le champ ACTOR depuis les notes existantes.
  - Captures de type lien/vidéo : bouton "↗ Ouvrir" (tab Safari, iOS compatible).
  - `toggleExpand` sauve les notes du card précédent avant de changer de carte.

- **Pourquoi** : l'inbox était unidirectionnelle (capturer → traiter sans retour).
  L'utilisateur ne pouvait pas "creuser" une carte avant de décider. Les notes
  pré-ACTOR créent un espace de réflexion entre la capture et le traitement.

- **DoD** : rendu relu in-context. stopPropagation sur les boutons (pas de conflit
  avec le toggle expand). Tri données : fondation pour les liens entre captures.

- **Prochain** : liens entre captures (Obsidian-like) — `linkedIds:[]` dans captures,
  sélection dans la carte expansible. OU export corpus NotebookLM. À valider.

---

## 2026-06-08 — Incrément 7 : Échéances datées 🔴/🔵 (backlog 6)

- **Fait** :
  - `setTacheEcheance(id, echeance)` dans `db.js`.
  - `fmtEch(ech)` → `{label, urgent}` : Retard / Auj. / Demain (⚠) ou "LUN 9".
  - `sortByEch(arr)` : trie par date asc, les sans-date en fin.
  - Chip `+` sur chaque tâche 🔴/🔵 → `input type="date"` natif iOS au tap.
  - `onChange` sauve à la confirmation picker, `onBlur` ferme sans sauver (annulation propre).
  - Badge `.ech-chip.urgent` terracotta si ≤ demain ou en retard.

- **Pourquoi** : les tâches sans date visible ne se différencient pas par urgence réelle.
  Le picker natif iOS évite toute dépendance externe. `echeance` était déjà dans le
  schema Dexie — aucune migration nécessaire.

- **DoD** : relu in-context. Tri et badge vérifiés logiquement. Mobile-first.

- **Prochain** : rotation rail captif (item 9) ou icône Z (item 10). À confirmer.

---

## 2026-06-08 — Incrément 6 : Le Filtre UX — Plus tard visible, Traités gérables

- **Fait** :
  - **Trou noir "Plus tard" corrigé** : `getLater()` ajouté dans `db.js`,
    nouvelle section "Plus tard" dans Capturer (entre À traiter et Traités).
    Chaque item : bouton "↑ Reprendre" (remet en inbox) + "Effacer" (2 taps).
  - **Traités inaccessibles corrigé** : contenu affiché jusqu'à 200 caractères
    (était 80), bouton × discret (2 taps pour confirmer, sans modal natif —
    compatible iOS PWA), bouton "↩ Réouvrir" pour remettre en inbox.
  - **Boutons renommés** : "Traiter · ACTOR" → "Traiter ✓", "Plus tard" → "↓ Plus tard".
    La section visible rend le comportement de "↓ Plus tard" immédiatement clair.
  - **deleteCapture(id)** ajouté dans `db.js`.
  - CSS : `.del-btn`, `.danger-btn` (confirmation 2 taps sans texte natif).

- **Pourquoi** : `statut='plus-tard'` n'était récupéré par aucune query —
  les items tombaient dans un limbe de données. Les Traités étaient en lecture
  seule : pas de suppression, pas de retour en inbox, contenu tronqué. Les deux
  boutons semblaient "intuitifs" mais sans destination visible pour "Plus tard",
  l'utilisateur ne comprenait pas l'outcome. Fix minimal : rendre les états
  visibles plutôt que de réinventer l'UX.

- **DoD** : code relu, structure Preact cohérente, pas de modal natif (iOS PWA
  bloque `confirm()`), confirmDelId partagé entre les deux sections.

- **Prochain** : tester sur iPhone (les 3 flows — Traiter, Plus tard, Effacer).
  Ensuite : backlog item 6 (échéances datées 🔴/🔵) ou item 9 (variations rail captif).

---

## 2026-06-08 — Incréments 4+5 : Le Filtre v0 + auto-sync + SW auto-reload

- **Fait** :
  - **Le Filtre v0** : "Traiter · ACTOR" ouvre un champ inline (pas de modal)
    pour annoter la capture avant de la valider. "Sans note" pour traiter direct.
    L'annotation est affichée en badge vert dans la section « Traités ».
    `traitCapture(id, annotation)` helper ajouté à `db.js`.
  - **Push-on-hide** (item 7) : si la sync Supabase est configurée, un
    `visibilitychange` dans App déclenche `pushAll()` silencieusement quand
    l'app passe en arrière-plan. Zéro friction pour l'utilisateur.
  - **SW auto-reload** : `updatefound` handler sur l'enregistrement du service
    worker — quand Vercel déploie une nouvelle version, l'app se recharge
    automatiquement côté iPhone dès que le nouveau SW est activé. Fin des
    réinstallations manuelles.
  - CSS : `.annot-form`, `.annot-badge`.

- **Pourquoi** : capturer sans friction est inutile si traiter en génère.
  L'annotation inline (ACTOR) ferme la boucle sans quitter le contexte. Le
  push-on-hide et le SW auto-reload ensemble rendent l'app auto-synchronisée
  côté données et côté code.

- **Décision** : annotation optionnelle (pas bloquante), field autofocus,
  Enter = valider. Pas de modal pour rester sobre. Push-on-hide conditionnel
  à `syncConfigured()` — pas de bruit si Supabase non configuré.

- **DoD** : HTML/CSS vérifié in-context. Push sur `main` → Vercel déploie.

- **Prochain** : tester la sync Supabase depuis l'iPhone → configurer les
  identifiants dans Réglages.

> **Contexte ~70 % rempli** · limites réelles → panneau d'usage Claude Code.

---

## 2026-06-08 — Session orientation + Incrément 3 : captures liées aux chantiers

- **Fait** :
  - Session de réflexion d'orientation : reconnexion scientifique (SVT 19/20,
    physique), critique du déficit épistémologique des écoles de management (IESEG)
    face aux enjeux Regen, mémoire M2 comme colonne vertébrale possible (sujet
    pressenti : l'épistémologie des transitions / pourquoi les acteurs sans sciences
    dures sous-estiment les systèmes qu'ils veulent changer).
  - `getCapturesByChantier(id)` helper (filter en mémoire, pas de migration).
  - Capture → chips optionnelles « ◎ Projet » : lier une capture à un chantier
    actif en 1 tap ; `chantierId` stocké dans le payload `extra`.
  - Fiche-chantier → section « Captures liées » (ordre anti-chronologique).
  - `seedOnce_v2()` : chantiers **Mémoire M2** + **Ressourcement scientifique**
    et 2 tâches bleu orientation (filières enseignement, positionnement Regen).
  - CSS : `.link-wrap`, `.ch-pill`, `.item-mini`.

- **Pourquoi** : capture et chantiers étaient des silos — JTBD : ancrer une
  ressource dans le projet qu'elle éclaire au moment de la capter. Fondation pour
  Le Filtre futur. Seed v2 = ancrer l'orientation dans l'app.

- **Décision** : pas de migration Dexie (chantierId via spread extra). Sélecteur
  limité à 5 chantiers × 22 chars pour rester compact. Chips désélectables
  (toggle).

- **DoD** : patterns HTML/CSS vérifiés serveur local, seed protégé par flag
  localStorage `zebracorn_seed_v2`.

- **Prochain** : Le Filtre v0 (annotation manuelle des captures traitées) OU
  sync Supabase validée sur l'iPhone.

> **Contexte ~60 % rempli** · limites réelles → panneau d'usage Claude Code.

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

## 2026-06-07 — Incrément 6 : Capturer fichiers (image/PDF + share iOS)
- **Fait** : nouveau type **📎 Fichier** dans Capturer. Zone de drop cliquable (`<input type="file" accept="image/*,application/pdf">`) — sur iOS ouvre nativement Photos · Fichiers · Scanner. Images compressées via Canvas (JPEG, qualité 0.82, max 1400px) avant stockage base64. PDFs stockés bruts jusqu'à **15 Mo** (avertissement au-delà avec suggestion Smallpdf). Inbox : miniature 56×56 pour images, icône 📄 pour PDFs. Bouton **↗ Partager** sur chaque fichier → `navigator.share({ files:[...] })` iOS = sélecteur d'apps natif incluant NotebookLM, Notes, Mail, AirDrop. Helper `shareFile` reconstruit le Blob depuis le dataUrl stocké.
- **Pourquoi** : fermer la boucle "second cerveau" — toute trace (texte, lien, image, PDF) entre dans le même pipeline ACTOR. Le share natif iOS est le pont le plus frugal vers NotebookLM sans API tierce.
- **DoD** : testé preview — zone fichier s'affiche avec type Fichier, autres types ne régressent pas (textarea + bouton Capter OK), zéro erreur console.
- **Décisions** : pas de drag-and-drop en v1 (scope inutile sur mobile) ; blob URL pour la préview composer (temp, révoqué après compression) ; `navigator.share` indisponible sur desktop → message d'alerte propre.
- **Prochain** : backlog — lier captures ↔ chantiers depuis inbox (#5) ; ou échéances datées 🔴/🔵 (#6b).

## 2026-06-07 — Incrément 5 : AMWAP enrichi (modal slide-up + mémoire courte)
- **Fait** : cliquer sur la routine AMWAP (non cochée) ouvre une **modal slide-up** : 3 champs numérotés, bouton « Valider » (désactivé si champ 1 vide), animation ✓ + fermeture auto 650ms. À validation : sauvegarde en DB (`amwap` table v3) + routine cochée + streak mis à jour. **Recap « Hier »** : si des victoires existent pour la veille, une ligne mémo apparaît sous les routines (fondation mémoire cumulative).
- **Pourquoi** : transformer une case à cocher passive en rituel actif avec feedback immédiat. L'entrée (3 points fixes) donne un cadre ; la fermeture automatique évite le vide après la validation. Le recap « Hier » crée une continuité narrative sans effort.
- **DoD** : testé preview — 3 champs remplis, validation → DB contient l'entrée, routine `.on`, modal fermée. Zéro erreur console.
- **Décisions** : modal `position:fixed` = fonctionne sur vrai iPhone indépendamment du scroll ; pas de portal Preact nécessaire. Pas de "recap du jour" (seulement hier) — évite la redondance avec ce qu'on vient de saisir.
- **Prochain** : incrément 6 — Capturer enrichie (upload fichier image/PDF, share natif iOS → NotebookLM).

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
4. ✅ Fiche-chantier : ouvrir un 🟢 → cocher ses étapes + éditer la prochaine étape.
5. ✅ Lier captures ↔ chantiers : chips optionnelles au moment de la capture + section sur la fiche.
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
