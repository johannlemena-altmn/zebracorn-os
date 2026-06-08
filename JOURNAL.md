# Journal — Zebracorn OS

Mémoire cumulative du projet : ce qui a été fait, **pourquoi**, et ce qui vient.
Tenu selon le skill `atelier-produit`. Entrées les plus récentes en haut.

---

## 2026-06-09 — Incrément 20 : Workflow NotebookLM fluide (ACTOR pré-rempli · audio · corpus)

- **Fait** :
  - **ACTOR pré-rempli** : ouverture sur une nouvelle capture → champ C (Compress) pré-rempli avec les 500 premiers caractères du contenu. Sur une analyse existante, les champs conservent ce qui avait été sauvegardé.
  - **Audio player inline** : si un lien capturé pointe vers un fichier audio (`.mp3/.wav/.ogg/.m4a/.aac`), un `<audio controls>` s'affiche directement dans la section expand de la carte. Utile pour les podcasts NotebookLM partagés par URL.
  - **Corpus ⊙ ACTOR** : section en bas de l'onglet Capture listant toutes les captures ayant une analyse ACTOR (tous statuts). Chaque carte affiche : contenu tronqué, OWN en italique Fraunces (la position prise), badge Run type, date. Se met à jour en temps réel après chaque `Sauvegarder ⊙`.

- **Pourquoi** : Friction principale du workflow NotebookLM → ACTOR : l'utilisateur devait re-taper le contenu capturé dans le champ Compress. Éliminé. Le Corpus est le début du "connect-the-dots" : naviguer ses positions sans rouvrir chaque capture.

- **DoD** : Testé preview — pre-fill compress confirmé (console log), corpus visible avec OWN + badge, 0 erreur console.

- **Prochain** : Tests sur vraies captures NotebookLM. Éventuellement : clic sur carte corpus → rouvre ACTOR pour édition ; recherche/filtre dans le corpus.

---

## 2026-06-09 — Incrément 19 : Share Target iOS + handler URL entrant

- **Fait** : L'app peut maintenant recevoir du contenu depuis le Share Sheet iOS (et depuis le raccourci Shortcuts).
  - `manifest.webmanifest` : ajout `share_target` GET avec params `text`/`url`/`title`.
  - Handler URL au démarrage (App) : lit `?url=` (→ capture `lien` avec titre en source) ou `?text=` (→ capture `note`), bascule sur l'onglet Capture, nettoie l'URL.
  - Workflow : partager un lien ou un texte depuis n'importe quelle app iOS → "Zebracorn OS" dans le Share Sheet → capture ajoutée instantanément, prête pour ACTOR.

- **Pourquoi** : Le raccourci Shortcuts précédent ouvrait dans Safari en ignorant les params. Le Share Target enregistre la PWA comme destination native dans le Share Sheet iOS — ouvre en standalone (pas Safari) quand la PWA est installée sur l'écran d'accueil.

- **DoD** : Testé en preview — `?url=https://notebooklm.google.com&title=NotebookLM+test` crée capture `🔗 LIEN` avec titre source + bouton `↗ Ouvrir` + bouton `⊙ ACTOR`. `?text=` crée capture note. Basculement onglet Capture OK.

- **Prérequis iOS** : PWA doit être installée (Safari → Partager → "Ajouter à l'écran d'accueil") pour apparaître dans le Share Sheet. Une fois installée, rouvrir depuis l'écran d'accueil pour recharger le nouveau manifest.

- **Prochain** : Tests NotebookLM → ACTOR sur captures réelles. Éventuellement : `share_target` POST pour partager des fichiers (audio NotebookLM).

---

## 2026-06-09 — Incrément 18 : Interface ACTOR · Raccourci ?text=

- **Fait** :
  - Bouton `⊙ ACTOR` sur chaque item inbox → accordéon 5 sections (A/C/T/O/R). Section T : grille 2×2 F/I/C/V + question socratique pré-remplie. Section O : textarea proéminente (bordure terracotta 2px). Section R : dropdown type d'action + Sauvegarder. Persistance via `actorAnalysis` champ libre Dexie. Indicateur `⊙` terracotta sur les cartes analysées.
  - Handler `?text=` au démarrage : le raccourci Shortcuts "presse-papiers → `?text=`" ajoute la capture silencieusement et bascule sur l'onglet Capture.

- **Pourquoi** : ACTOR = méta-outil du second cerveau. Différé de la capture, il transforme la note brute en position + action. L'indicateur `⊙` permet de distinguer d'un coup d'œil les captures déjà travaillées.

- **DoD** : Testé en preview — capture `?text=Test raccourci coller ACTOR` ajoutée automatiquement à l'inbox, bouton ACTOR fonctionnel sur tous les items, indicateur `⊙` visible sur carte avec analyse existante.

---

## 2026-06-09 — Incrément 17 : Sous-tâches interactives (tap-to-expand refondé)

- **Fait** : Notes de tâche entièrement refondues en sous-tâches interactives.
  - Toggle `▸`/`▾` explicite à droite du titre (+ tap titre = même effet).
  - Parsing `[ ]` / `[x]` → checkboxes cliquables dans le design system (☐/☑, couleur `--ok` quand coché, barré).
  - Compteur `X/N` en terracotta visible en mode collapsed et en header.
  - Lignes sans `[ ]` → texte grisé (notes libres, séparateurs).
  - Bouton `✎ éditer` pour passer en mode textarea (édition du texte brut).
  - Sauvegarde on-blur du textarea → retour en vue checkboxes.
  - Sans notes : tap → textarea directement (pas de vue vide inutile).
  - Implémenté dans Maintenant et Semaine.
  - Helpers globaux `parseNotes()` + `toggleSubtaskLine()` partagés.

- **Pourquoi** : Textarea brut sur fond blanc cassait le design sombre et offrait zéro feedback sur la progression. Refonte motivée par cas d'usage T4TP aujourd'hui (7 sous-tâches stands/suivi). Parcours : collapsed → compteur → tap → cocher au fur et à mesure.

- **DoD** : Testé navigateur — collapse/expand OK, checkbox toggle OK, compteur live OK, persistance DB confirmée après reload.

---

## 2026-06-08 — Incrément 16 : Module Nutrition — onglet Sport

- **Fait** : Nouvel onglet 🥗 Sport avec 3 sous-vues dans un fichier `nutrition.js` autonome.
  - **Courses** : liste de courses par catégorie (Protéines / Féculents / Légumes / Fruits / Autres), budget en temps réel avec barre de progression (cible 35€/sem), génération liste de base flexitarienne en 1 clic, cases à cocher au supermarché (article barré = en panier), bouton « Vider panier », ajout libre d'article (nom + quantité + prix + catégorie).
  - **Recettes ce soir** : 3 fiches dépliantes (Pâtes œuf-parmesan / Riz tofu-légumes / Omelette champignons-épinards) avec temps, kcal, protéines, budget, ingrédients et instructions.
  - **Planning** : grille 7j × 3 moments (Matin/Midi/Soir), repas libres 🎉 (sorties, déj collègues — sans suivi), modal d'ajout avec nom + kcal + protéines approx.
  - **Macros** : barres kcal / protéines / glucides / lipides vs objectifs configurables, streak protéines, badges gamification (Cuisinier / Semaine complète / Protéines ×7), XP par repas logué.
  - **DB** : Dexie v7 → tables `repas` + `courses`, ajoutées à SYNC_TABLES pour backup JSON.

- **Pourquoi** : Urgence ce soir : liste de courses + recettes. Module conçu migration-friendly (un seul fichier module ES, zéro couplage avec les organes Zebracorn) pour extraction future vers Reprise-Sport. Base alimentaire locale ~30 aliments, aucune API externe. Vision flexitarienne : légumineuses / tofu en alternatives à la viande.

- **DoD** : Commit sur branche `claude/reprise-nutrition-module-Z2DKR`, push OK. À fusionner sur main pour déploiement Vercel.

- **Note déploiement** : La branche est prête. Pour la mettre en prod sur Zebracorn OS (Vercel), merge sur `main`. Pour migrer vers Reprise-Sport plus tard : copier `nutrition.js` + la section v7 de `db.js`.

- **Prochain** : Fusionner sur main pour test navigateur → valider persistance courses + planning → ajuster UX si besoin. Migration vers Reprise-Sport en session dédiée.

---

## 2026-06-08 — Incrément 15 : Bibliothèque légère · Fix CAP sync · Fix sync.js · iCal debug

- **Fait** :
  - **Bibliothèque légère (K')** : table Dexie v5 `livres`. FicheLivre (pattern FicheChantier) : toggle statut (À lire / En cours / Lu), progression pages + barre, intention, notes de lecture, question vivante liée, captures liées. Section 📚 Bibliothèque dans Semaine avec cartes + ajout rapide. Bloc lecture dynamique dans Maintenant (affiche le livre en cours + progression si statut `en-cours`). Sélecteur livre dans Capture composer (comme chantier). Corpus export enrichi avec section Bibliothèque. Seed : « Bienvenue en 2055 » pré-chargé avec intention mémoire M2.
  - **Fix CAP 2026 non syncé** : Dexie v6 table `settings` (clé/valeur). `getCap()` / `saveCap()` migrés vers IndexedDB avec fallback localStorage au premier chargement. CAP est maintenant dans SYNC_TABLES → syncé via Supabase Pousser/Tirer.
  - **Fix sync.js** : TABLES dans `sync.js` ne listait pas `questions`, `livres`, `settings` — les questions vivantes et le cap ne synçaient pas. Corrigé.
  - **iCal debug** : bouton « Tester » dans Réglages → affiche le nombre d'événements total + nb aujourd'hui + leurs noms. Hint « aucun événement aujourd'hui » visible quand fetch OK mais résultat vide. Note explicative ajoutée : URL iCal est **par calendrier**, pas globale — si l'event est dans un autre agenda, il ne remonte pas.

- **Pourquoi** :
  - Bibliothèque = organe « Boussole des Récits » : les livres alimentent les questions vivantes et le corpus NLM. Approche Obsidian (livre ↔ questions ↔ captures) crée un vrai second cerveau.
  - CAP non syncé = bug silencieux critique : Johann poussait depuis l'ordi, tirait sur le tel, mais le cap n'arrivait jamais. Cause : localStorage n'est pas syncé par Supabase, seul IndexedDB l'est.
  - sync.js incomplet = même problème pour les questions vivantes (jamais synçées sur d'autres appareils).
  - iCal debug = le bouton « Tester » permet à Johann de diagnostiquer si le fetch fonctionne et si l'événement est dans le bon calendrier.

- **DoD** : zéro erreur console, seed « Bienvenue en 2055 » visible dans Bibliothèque et dans le sélecteur Capture, FicheLivre navigable depuis Semaine, Cap chargé depuis migration localStorage→IndexedDB (visible dans Maintenant), sections confirmées par snapshot DOM.

- **Setup pour Google Calendar** : Si le bouton Tester dit « 0 aujourd'hui » alors que tu as un événement — vérifie que l'URL iCal dans Réglages correspond au calendrier qui contient l'événement. Google Calendar a une URL iCal **par calendrier** (pas une URL globale). Va dans chaque agenda → ⚙ → « Adresse secrète au format iCal ».

- **Prochain** : H (lier tâche → objectif annuel · moyen), K (export corpus enrichi questions · rapide), I (Le Filtre IA · grosse session), Reprise Sport nutrition (session dédiée), Low-Tech gamification (session dédiée).

---

## 2026-06-08 — Incrément 14 : Auto-pull · Revue hebdo · Capture→Question · Google Calendar

- **Fait** :
  - **F — Auto-pull silencieux** : au démarrage, si la sync Supabase est configurée ET qu'un sync précédent existe (push ou pull), `pullAll()` est appelé avant le render. Données fraîches sans intervention. Guard anti-perte : si jamais rien n'a été synchonisé avant, pas de pull (évite l'écrasement surprise sur un appareil vierge).
  - **G — Revue hebdo guidée** : bloc collapsible dans Maintenant, 3 questions (avancée / résistance / intention semaine suivante). S'ouvre automatiquement le vendredi si pas encore close. Sauvegarde localStorage par clé ISO-semaine → persiste entre sessions. Bouton « Clore la semaine ✓ » + possibilité de rouvrir.
  - **Capture → Question vivante** : section « ❓ Question vivante » dans l'expand inbox. Picker de toutes les questions actives, badge de la question liée, bouton Dissocier. `linkCaptureToQuestion(captureId, qId)` dans `db.js`. Compteur de captures dans Semaine étendu aux captures inbox (pas seulement les traités).
  - **Google Calendar (iCal proxy)** : `api/ical.js` — Vercel serverless function (~17 lignes) qui proxyfie l'URL iCal secrète de Google Calendar (CORS). Parser iCal minimal inline (`unfoldIcal`, `parseIcal`, `filterToday`, `fmtGcalTime`). Bloc « ◇ Aujourd'hui » dans Maintenant (doré, 6 événements max, temps local). Champ config dans Réglages. **Read-only, sans OAuth, sans re-auth.**

- **Pourquoi** :
  - Auto-pull = ferme la boucle multi-appareil sans friction (iPhone + Mac).
  - Revue hebdo = le rituel vendredi était un angle mort : sans structure, il n'arrive pas.
  - Capture→Question = manquait pour fermer la boucle PKM (capter → relier à une réflexion vivante).
  - Google Calendar = voir le planning du jour depuis Maintenant évite le switch d'app le matin.
  - Choix iCal vs OAuth : l'URL secrète Google est stable, longue durée, aucun token à renouveler. La Vercel function proxy résout le CORS en ~17 lignes sans backend. Option OAuth PKCE (access_token 1h) reste une piste si Johann veut écrire des événements depuis l'app.

- **DoD** : preview validé (zéro erreur console), q-link-section présente et fonctionnelle, revue box 3 questions 3 textareas, gcal section dans Réglages avec champ iCal. Push `270951d` → Vercel auto-deploy.

- **Setup Johann pour Google Calendar** :
  1. Google Calendar (web) → ⚙ Paramètres → ton agenda → descendre jusqu'à « Adresse secrète au format iCal »
  2. Copier l'URL (`https://calendar.google.com/calendar/ical/…`)
  3. Coller dans Réglages Zebracorn OS → « Google Calendar » → Enregistrer
  4. Recharger Maintenant → bloc « ◇ Aujourd'hui » apparaît si des événements du jour existent

- **Prochain** : H (lier tâche → objectif annuel) ou I (Le Filtre IA) — voir roadmap ci-dessous.

---

## 2026-06-08 — Incrément 11 : Cap annuel North Star + hors-scope journal

- **Fait** :
  - `getCap()` / `saveCap()` en `localStorage` — stable, pas de migration Dexie.
  - `toggleHorsScope(id, val)` + `getHorsScopeMois()` dans `db.js`.
  - Section **Cap 2026 · North Star** en tête des Réglages : intention (1 phrase), grands objectifs (un par ligne), non-négociables.
  - `.cap-annuel` sous le rail dans Maintenant — visible uniquement si une intention est renseignée.
  - Bouton `.hs-btn` dans Traités — toggle ○ hors-scope ? / 📍 hors-scope.
  - Compteur mensuel hors-scope dans Maintenant (section inbox), en terracotta.
  - `.cmp-inp` ajouté dans styles.css pour les textareas Réglages.

- **Pourquoi** : boucle planif→cap→filtre — avoir le cap visible chaque jour évite de
  dériver sur du bruit. Taguer « hors-scope » sur les traités trace ce qui a pollué
  le backlog sans servir le cap annuel (signal précieux à la revue mensuelle).

- **DoD** : diff propre (+59 lignes, 0 suppression) sur base origin/main. Push via
  branche cap-deploy → main (fast-forward). Vercel auto-deploy.

---

## 2026-06-08 — Incrément 10 : Gamification Corpus+Badges + Icône Z

- **Fait** :
  - `getStats()` dans `db.js` : total captures, traitées, avec notes, avec liens, tâches faites, maxPct chantier.
  - Section **Corpus** dans Réglages : 4 KPIs (stats-grid Fraunces) + 9 badges paliers.
  - Badges : Première graine (1), Annotateur (note), Acteur (tâche), Cartographe (lien),
    Mi-chantier (50%), Filtreur (10 traitées), Archiviste (50 cap.), Maître d'œuvre (chantier 100%), Corpus vivant (100 cap.).
  - Locked = grayed+grayscale avec progression `X/N` si mesurable.
  - `icons/icon.svg` : Z blanc/terracotta sur fond arrondi — favicon SVG + manifest.
  - `<link rel="icon">` SVG + `<link rel="apple-touch-icon">` PNG dans `<head>`.

- **Pourquoi** : voir le corpus grandir donne un retour concret sur l'investissement.
  Les badges paliers créent des micro-victoires sur le parcours apprentissage/maîtrise.
  L'icône Z remplace le carré plat — identité visuelle Zebracorn affirmée.

- **DoD** : code relu in-context. Stats calculées à la volée (pas de migration DB).
  Badges définis comme pure logique fonctionnelle sur stats.

- **Prochain** : Le Filtre v1 (IA sur capture) ou Rotation rail captif. À valider.

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

## Roadmap — état au 2026-06-08 (post-incrément 14)

### État de l'app

| Onglet | Fonctionnalités |
|--------|----------------|
| **Maintenant** | Rail captif · intention · tracker 7j · 3 tâches · routines+streak · AMWAP · Cap 2026 + objectifs du mois · **Agenda du jour (Google Calendar)** · **Revue hebdo guidée (vendredi)** |
| **Capturer** | Note/lien/PDF/fichier · horsScope · revue hors-scope mensuelle · liens entre captures · annotation ACTOR · **Rattacher à une question vivante** |
| **Semaine** | Backlog 🔴🔵🟢 + échéances · fiche-chantier (étapes + progression) · ❓ Questions vivantes (archiver/rouvrir) |
| **Réglages** | Cap 2026 · **Google Calendar (iCal URL)** · sync Supabase · export corpus .md · stats+badges · backup JSON |

### Sync
- Push-on-hide : ✅ (depuis incrément 4+5)
- **Pull-on-open** : ✅ (incrément 14 — guard : ne pull que si sync déjà établie)

---

### Backlog restant (priorité décroissante)

#### H — Lier une tâche à un objectif annuel [moyen]
- **Quoi** : dans Semaine, chaque tâche 🔴/🔵 peut être rattachée à un grand objectif du Cap 2026.
- **Pourquoi** : fermer la boucle planif→cap. Voir d'un coup d'œil si la semaine sert le cap ou dérive.
- **Effort** : moyen — ui picker similaire à capture→question, pas de nouveau modèle DB (objectif = texte libre du Cap).
- **Quand** : priorité si Johann veut renforcer la discipline stratégique hebdomadaire.

#### I — Le Filtre IA [complexe, ≥ 1 session entière]
- **Quoi** : classer automatiquement une capture (pertinence cap, type d'action suggérée, question associée).
- **Pourquoi** : réduire la friction ACTOR sur les captures brutes → jugement assisté, pas automatisé.
- **Effort** : gros — nécessite API Claude (clé Anthropic), Vercel function pour ne pas exposer la clé, prompt engineering, gestion erreurs/timeout. Stack : `api/filter.js` (Vercel) → `@anthropic-ai/sdk`.
- **Décision** : à faire quand l'inbox déborde (~20+ captures) et que le tri manuel devient une corvée.
- **Prérequis** : clé API Anthropic configurée dans les env vars Vercel.

#### J — Écrire dans Google Calendar depuis Maintenant [moyen-complexe]
- **Quoi** : créer un événement ou un rappel depuis l'app (ex : poser l'intention du lendemain comme bloc calendrier).
- **Pourquoi** : actuellement read-only. Pour Johann : externaliser la planif depuis l'app sans ouvrir Google Calendar.
- **Effort** : moyen-complexe — nécessite OAuth PKCE (client_id Google, domaine autorisé) + token management. La Vercel function pour refresh token est recommandée (client_secret côté serveur).
- **Décision** : pas prioritaire tant que le read-only suffit au besoin du matin.

#### K — Export corpus enrichi (questions vivantes incluses) [petit]
- **Quoi** : l'export `.md` inclut déjà cap + hors-scope. Ajouter les questions vivantes + les captures rattachées à chaque question, comme sections dédiées.
- **Pourquoi** : NotebookLM bénéficierait d'un corpus qui trace explicitement la connexion capture → question → réflexion.
- **Effort** : petit (~30 lignes dans `doCorpus()`).

---

### Matrice de décision pour la semaine

| Feature | Valeur | Effort | Quand faire |
|---------|--------|--------|-------------|
| H (tâche→objectif) | ★★★ | Moyen | Prochaine session si cap défini |
| I (Filtre IA) | ★★★★ | Gros | Quand inbox déborde |
| J (écrire Calendar) | ★★ | Moyen-complexe | Plus tard |
| K (export questions) | ★★ | Petit | Peut être fait en 20 min |

**Recommandation immédiate** : K d'abord (20 min, valeur directe pour NLM), puis H si Johann veut renforcer la discipline cap cette semaine.
