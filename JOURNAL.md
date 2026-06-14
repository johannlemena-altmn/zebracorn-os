# Journal — Zebracorn OS

Mémoire cumulative du projet : ce qui a été fait, **pourquoi**, et ce qui vient.
Tenu selon le skill `atelier-produit`. Entrées les plus récentes en haut.

---

## 2026-06-14 — Test FICV par IA : contenu réel (vision image) + question reliée au Aim

- **Fait** : refonte du step `test` (Sonnet) du Filtre IA. (1) **Vision** : pour une
  capture image/croquis, l'image (`dataUrl`) est désormais **jointe** à Sonnet
  (message multimodal) → le FICV se fonde sur ce qui est réellement montré, plus
  seulement le nom de fichier. (2) **Critères FICV rigoureux** dans le prompt :
  Faits = littéral/vérifiable sans inférence · Interprétations = lectures marquées
  comme hypothèses · Croyances = présupposé qui, s'il tombe, fait tomber la thèse ·
  Valeurs = jugement en jeu. (3) **Question reliée au Aim** : la question socratique
  relie la thèse à l'intention de départ (« ce qui devrait être vrai/faux pour que
  ce contenu serve ce que tu cherches ») ; sans Aim, elle challenge la thèse seule.
  Le Aim est tenu à part (pivot du Test, appoint pour le Compress). Client : passe
  `dataUrl`/`mimeType` à l'API.
- **Pourquoi** : le Test est le cœur critique d'ACTOR ; sa valeur = transformer un
  contenu passif en challenge personnel qui force une position (Own) au service du
  Aim. Vision sur image = la seule façon d'avoir un FICV juste sur un croquis/
  screenshot (on ne « lit » pas un nom de fichier). Garde-fou taille base64
  (~4,5 Mo) pour éviter les 413. On ne navigue toujours pas les URLs (liens =
  titre/notes/compress), limite honnête assumée.
- **DoD** : `node --check api/actor-ai.js` OK ; assemblage simulé sur 2 cas (lien
  LinkedIn + Aim → texte avec Aim en tête ; image → message multimodal image+texte).
  **Sortie réelle de Sonnet à confirmer en prod** (pas de clé API en session). Shape
  JSON de réponse inchangée → genTest client intact.
- **Prochain** : confirmer en prod la qualité FICV sur un lien et sur un croquis ;
  selon retour, calibrer température/longueur.

## 2026-06-13 — Fix Flux/ACTOR (compress des liens) + design md studio (retours device)

- **Fait** : (A) **Compress IA des liens réparé** — le « Résumer avec Haiku »
  renvoyait « Contenu inaccessible » sur un post LinkedIn. Cause : le client
  envoyait l'**URL nue** (pas le `titre` riche en hashtags), et le serveur ajoutait
  un prompt défaitiste (« si insuffisant, dis-le clairement »). Désormais le client
  passe `titre` + `aim` (contexte utilisateur) ; le serveur (`api/actor-ai.js`)
  assemble tout le texte disponible (titre/accroche/hashtags + notes + contexte +
  lien non ouvert) et le prompt **interdit** de dire « inaccessible » (un titre plein
  de hashtags suffit à dégager le thème). Hint UI mis à jour. (B) **md studio
  design** : corrigé la **vue scindée** (en mode Écrire l'aperçu ne se cachait pas —
  `[hidden]` était écrasé par `#preview-wrap{display:flex}` → ajout `[hidden]{display:none!important}`),
  et **désencombré la barre du bas** (5 boutons qui débordaient, « xport HTML » coupé)
  en un seul **Exporter ▾** ouvrant une feuille PDF / HTML / PNG / Copier.
- **Pourquoi** : retours de Johann sur device. Le compress des liens est le cœur du
  Flux ; échouer dessus casse l'usage. Choix : exploiter le **titre déjà capturé**
  (api/title.js) plutôt que tenter (en vain) d'ouvrir l'URL. Footer : une seule
  action primaire d'export réduit la charge et règle le débordement mobile.
- **DoD (Playwright + simulation)** : assemblage du prompt vérifié sur le cas
  LinkedIn réel (Haiku reçoit titre + Aim + lien ; mode défaitiste = false) ;
  `node --check api/actor-ai.js` OK. md studio : mode Écrire → aperçu **caché** (plus
  de split), mode Aperçu → éditeur `display:none` + aperçu plein écran ; feuille
  Exporter ouvre/ferme, export HTML télécharge ; sélecteur modèles re-scopé à
  `#sheet` (n'écrase plus les boutons d'export qui partagent `.tpl`) ; zéro erreur
  console. Réponse réelle de Haiku (qualité du résumé) à confirmer en prod.
- **Prochain** : confirmer sur device le compress d'un lien LinkedIn ; vrais
  gabarits Ferryman quand le repo sera accessible.

## 2026-06-13 — md studio v1.1 : installable (manifest + SW), partage entrant, modèles narratifs

- **Fait** : (1) **PWA installable** — `md-studio/manifest.webmanifest` + `sw.js`
  (network-first, scope `/md-studio/`, réemploi des icônes terracotta `/icons/`),
  métas apple-touch → « Ajouter à l'écran d'accueil » propre + offline. (2)
  **Partage entrant** : `share_target` dans le manifest + lecture de `?text=` /
  `?title=` / `?url=` au boot → l'éditeur se préremplit quand on partage un texte
  depuis une autre app, puis l'URL est nettoyée. (3) **Modèles** : bottom-sheet
  « Partir d'un modèle » avec 3 gabarits narratifs (Verdict de spike · Note de
  décision · Données → récit).
- **Pourquoi** : complète le point « installable propre » + sert l'usage iPhone
  réel (« transformer depuis l'iPhone » = recevoir un partage). Modèles =
  amorce de l'esprit Ferryman (du structuré au récit) ; **génériques par choix**,
  les vrais gabarits éditoriaux Ferryman se brancheront quand le repo sera
  accessible — pas de faux-semblant.
- **DoD (Playwright)** : sheet s'ouvre + modèle « spike » inséré et rendu ;
  partage `?title=&text=` → éditeur = `# Bonjour\n\n…` + URL nettoyée ; **SW
  enregistré** (actif) ; manifest chargé (scope `/md-studio/`) ; export HTML
  non régressé ; zéro erreur console. À confirmer device : déclenchement réel du
  share_target iOS (support Safari limité → dégrade en simple deep-link, sans
  casse) et l'install A2HS.
- **Prochain** : brancher les vrais gabarits Ferryman (repo requis) ; éventuels
  exports SVG. Déploiement après merge `main` → `/md-studio/`.

## 2026-06-13 — Brique « md studio » : Markdown → présentable (PWA autonome v1)

- **Fait** : nouveau dossier **`md-studio/`** (un seul fichier `index.html`,
  ~zéro dépendance). Depuis Safari iPhone : on colle / ouvre un `.md` → **aperçu
  stylé** (rendu lisible façon Claude, design papier/encre/terracotta de la
  famille) → **exports** : HTML autonome (styles inline, s'ouvre seul partout),
  **PDF** (impression native → partage iOS « Enregistrer en PDF »), **PNG**
  (best-effort SVG/foreignObject→canvas), **Copier** (HTML riche via
  ClipboardItem, fallback texte). Onglets Écrire/Aperçu, **persistance du
  brouillon** (localStorage), toasts, safe-area iOS. Mini-parseur Markdown inline
  (titres, gras/ital, listes ±/ordonnées, citations, code inline + fences,
  liens, images, tableaux simples, hr).
- **Pourquoi / décision clé** : Johann a tranché **« PWA autonome (frugale) »**.
  Choix structurant : **zéro CDN** → (1) marche 100 % offline et reste une vraie
  brique autonome, (2) **testable dans ce conteneur cloud** alors que le reste de
  l'app (Preact/Dexie via CDN) n'y boote pas (proxy réseau bloque esm.sh/jsdelivr).
  Plutôt qu'embarquer une lib Markdown, **mini-parseur maison** couvrant le
  sous-ensemble utile (frugalité > exhaustivité). Sécurité : on **escape** le HTML
  avant transformation (rendu prévisible, pas d'injection). Placé dans le repo
  `zebracorn-os` (sous-dossier isolé) car c'est la seule surface déployable
  (Vercel sur `main`) disponible depuis le cloud — code séparé, déploiement
  mutualisé ; détachable plus tard. **Sert directement Ferryman** (sortie md → vue
  présentable), comme prévu.
- **DoD (testé pour de vrai, Playwright headless sur `http.server`)** : rendu
  vérifié sur un md complet → h1/h2, gras, ital, lien, ul+ol (4 li), citation,
  bloc de code **avec `<`/`>` préservés** (HTML non cassé), tableau, hr, tous
  présents ; **export HTML re-parsé** valide (titre extrait du `# `, `article.doc`
  présent) ; **persistance au reload** OK ; **PNG** génère un fichier 47 Ko sous
  Chromium ; **zéro erreur console**. Non vérifiable ici (à confirmer device) :
  comportement exact iOS Safari du PNG (canvas tainted possible → fallback PDF
  prévu) et du partage-PDF natif.
- **Prochain** : (1) confirmer sur iPhone réel (preview + share-PDF + add-to-home-
  screen) ; (2) si besoin offline installable « propre » : ajouter manifest + SW
  minimal ; (3) brancher les **gabarits narratifs Ferryman** (la vraie valeur
  éditoriale). Se déploiera après merge sur `main` → URL `/md-studio/`.
- **Accès fichiers — constat** : le cloud branché à la session est **Google
  Drive** (pas iCloud). Il contient les *documents* de Johann (sobriété, études…)
  mais **pas** les projets de code (Reprise-Sport / Ferryman / Murfy), qui sont
  sur iCloud Drive / Desktop — **non accessibles** depuis cette session. Les
  tâches 1/2/3 restent à faire depuis la session Claude Code locale (Mac).

## 2026-06-13 — Carré de veille « décision US / Fable·Opus » (réemploi chantier + question vivante)

- **Fait** : un nouveau « carré » apparaît dans Mémoire — chantier **« Veille —
  décision US sur les modèles frontière (Fable / Opus) »** (organe *vigie ·
  adaptation*). Il porte la **question vivante** « Comment se préparer
  objectivement à un durcissement qu'on ne contrôle pas ? » et 6 étapes = les
  **scénarios prospectifs** à creuser : cadre épistémologique (faits / hypothèses
  / inconnues), scénario A/B/C (les 3 pistes de Johann : Opus relevé vers Fable
  avec plus de garde-fous · voie d'accès UE · contournement type VPN cf.
  openclaw), signaux d'alerte précoces, plan d'adaptation par scénario. Seed
  `seedVeilleAnthropic_2026()` dans `db.js`, câblé au boot après les autres seeds.
- **Pourquoi / décision clé** : Johann veut « garder la question dans un carré sur
  l'app » pour la creuser ensemble plus tard. Choix **frugal** : zéro nouveau
  composant/écran — un chantier EST déjà un carré avec progression, étapes,
  badges, et la section « Question qui guide » (ajoutée en v0.3.4). On réutilise
  exactement le pattern `seedChantiersPlansABC_2026`. Les pistes A/B/C sont
  étiquetées **« (piste J.) »** dans les étapes pour les marquer comme hypothèses,
  pas comme faits. La `progression` résume factuellement l'annonce Fable 5 /
  Mythos 5 + le renvoi à `anthropic.com/news/claude-fable-5-mythos-5`.
- **DoD** : `node --check db.js` OK ; `seedVeilleAnthropic_2026` confirmée chargée
  comme fonction globale via sonde headless (Playwright). **Limite honnête** : le
  boot complet (rendu de la carte + lecture IndexedDB) n'a **pas** pu être exécuté
  dans le conteneur cloud — le proxy réseau y bloque les CDN Dexie/Preact
  (403 / CORS / cert), donc l'app ne démarre pas ici. La fonction étant un clone
  structurel d'un seed déjà en prod (mêmes helpers, même garde anti-doublon par
  titre + flag localStorage), le risque résiduel est faible, mais **à confirmer
  sur l'appareil de Johann** (preview navigateur réel, où les CDN se chargent) :
  carte présente dans Mémoire, fiche = 6 étapes (0/6) + « Question qui guide »
  rendue.
- **Prochain** : Johann vérifie le rendu sur device ; puis on creuse réellement la
  question (cadre épistémo + scénarios). Le carré ne se déploiera qu'après merge
  sur `main` (Vercel auto-deploy sur `main` ; ici on pousse seulement la branche
  `claude/multi-project-june-13-p7rgh3`).
- **Note environnement** : cette session tourne dans le conteneur cloud Claude
  Code (seul `zebracorn-os` cloné). Les projets `~/Desktop/Reprise-Sport`,
  `Ferryman`, `Murfy` ne sont **pas** accessibles ici → les tâches 1/2/3 de la
  reprise et les `vercel deploy` correspondants doivent se faire depuis la session
  Claude Code locale (Mac).

## 2026-06-13 — v0.3.4 : seed des chantiers stratégiques (Plans A/B/C) + question vivante sur la fiche

- **Fait** : trois chantiers stratégiques pré-remplis arrivent automatiquement
  dans Mémoire (seed `seedChantiersPlansABC_2026` dans db.js, câblé au boot après
  `seedChantiersEte2026`) : **reVu** (8 étapes, organe « média · vigie »),
  **Studio de rénovation frugale — coopétiteur de Murfy** (6 étapes), **Refonte
  Reprise-Sport + nutrition** (3 étapes). Chacun avec `prochaine` action +
  `progression` (où ça en est) + 1 **question vivante** liée. reVu seede en plus
  une tâche 🔴 « Aller au rassemblement de soutien à Vu » échéance 2026-06-16
  (elle remonte en « prochaine action » sur Maintenant). Nouvelle micro-feature :
  la **fiche-chantier affiche sa question vivante liée** (section « Question qui
  guide », entre la barre de progression et les étapes).
- **Pourquoi / décision clé** : Johann a une arborescence de chantiers en tête
  (3 plans issus de la session du 13/06) et ne veut pas « repartir de zéro » dans
  l'app. Choix **frugal** : ne RIEN construire de neuf côté gamification — l'app a
  déjà barre de progression (% d'étapes), badges sur `maxPct` (`⚒️ Mi-chantier`,
  `🏆 Maître d'œuvre`), questions vivantes, livres, AMWAP, streaks. Seeder des
  étapes **allume** ce dispositif. Le seul manque réel pour « apprentissage
  intégré au chantier » : la question vivante existait mais ne s'affichait pas sur
  la fiche → ajout de 6 lignes réutilisant `.q-card`. Seed **content-guardé par
  titre** (comme `seedQuestionsOnce`/`seedLivresOnce`) → pas de doublon quand un
  autre appareil se synchronise (le flag localStorage seul ne suffit pas en
  multi-device). Pas de pont cerveau→app pour les chantiers : `importTachesMerge`
  ne gère que les tâches ; le seed code-source est la voie propre.
- **DoD (preview python http.server 4242)** : boot sans erreur console ; les 3
  chantiers apparaissent dans Mémoire avec prochaine + compteurs (0/8, 0/6, 0/3) ;
  tâche 🔴 16 juin créée et surfacée sur Maintenant ; fiche reVu = 8 étapes +
  section « Question qui guide » rendue avec le bon intitulé/intention (vérifié via
  requête identique à celle du composant + lecture DOM scoping `.sec`). Non
  vérifié en headless : navigation par clic réel (le clic atterrit sur la poignée
  de drag — sans incidence, le rendu est confirmé par eval).
- **Prochain** : laisser vivre ; au besoin, surfacer aussi les livres liés sur la
  fiche-chantier, ou permettre de créer une question vivante depuis la fiche.

---

## 2026-06-12 — v0.3.3 : transitions slide directionnel portées dans l'app

- **Fait** : port de la maquette validée dans index.html + styles.css (+136/−16).
  Changement d'onglet directionnel (entrant depuis la direction du tab choisi,
  sortant en parallaxe −30 %/.6, 240 ms tokens existants) via composant `Stage` ;
  drill-down `.nav-page` : parallaxe de l'écran dessous + **retour par
  swipe-bord-gauche** (suit le doigt, seuil 35 % ou vélocité, même chemin de
  code que le bouton ←). Reduced-motion : crossfade sans mouvement latéral.
- **Pourquoi / décision clé** : un premier jet (pré-existant dans le worktree)
  pilotait l'animation par styles inline impératifs + double rAF → écrasés par
  les re-renders Preact, écran entrant figé à 100 %. Remplacé par des **classes
  CSS keyframes** (`ent-r/ent-l/lea-r/lea-l`) : le navigateur tient la timeline,
  indépendamment du JS. Verrou `tabLock` + cleanup `setTimeout(240+40)`
  déterministe (jamais `animationend`, manqué si interrompu). `.phone` passe en
  `height:100svh` (requis par les écrans superposés en absolu). Cache-buster
  `styles.css?v=transitions2`.
- **DoD (sous-agent Opus, preview 390×844 dark+light)** : directions 0→2 / 2→0
  vérifiées (`getAnimations()`), un seul écran au repos, 4 clics rapides → état
  stable ; drill-down + retour bouton ET swipe souris (snap-back sur drag
  court) ; non-régression : capture persistée au reload (donnée test nettoyée),
  feuille ACTOR, routines ; zéro erreur console. Le rendu interpolé du slide et
  le swipe tactile réel restent à confirmer sur iPhone (preview headless gèle
  la timeline CSS).
- **Point de veille** : l'écran sortant est re-monté pendant les 240 ms (ses
  données se rechargent en async) — pas d'artefact vu en preview ; si flash
  visible sur iPhone, geler le contenu sortant (snapshot DOM) sera l'itération.
- **Prochain** : test réel iPhone (feel du slide, swipe-back, reduced-motion).

## 2026-06-12 — Maquette transitions slide directionnel (validation en attente)

- **Fait** : `maquette_transitions_v1.html` (statique, autonome, zéro dépendance,
  413 lignes) — 4 faux écrans + tab bar pictos main levée. Changement d'onglet :
  l'entrant glisse depuis la direction du tab choisi (index supérieur = depuis la
  droite, inférieur = miroir), le sortant part en parallaxe −30 % + opacity .6,
  240 ms `--ease-out` (tokens motion existants, rien de nouveau). Drill-down
  carte chantier → page détail slide droite (z-index 200) + retour bouton ET
  swipe-bord-gauche (suivi du doigt, seuil 35 % ou vélocité > 0,5 px/ms ;
  équivalent souris pour la preview). Toggle ☀/🌙 de test.
- **Pourquoi** : donner le sens spatial natif iOS sans dépendance — incrément
  « Prochain » acté en v0.3.2. Transform/opacity uniquement, `will-change`
  temporaire, `prefers-reduced-motion` → crossfade sans mouvement latéral.
- **DoD (sous-agent, preview mobile 390×844 dark+light)** : directions vérifiées
  par mesure des matrices de transform (0→2 : entrant +127→0 px, sortant
  −117 px ; 2→0 : miroir) ; 4 clics d'onglets rapides → un seul écran stable
  (verrou `animating`) ; swipe-bord simulé souris OK ; zéro erreur console.
  Bug corrigé avant livraison : cleanup `transitionend` manqué en cas
  d'interruption → remplacé par `setTimeout(DUR+20)` déterministe.
  Reduced-motion non exerçable en preview (limite outillage) ; swipe tactile
  réel à confirmer sur iPhone.
- **Prochain** : validation Johann sur la maquette, PUIS port dans index.html
  (session fraîche) — brancher goTab sur la pile d'onglets Preact et le pattern
  `.nav-page` existant.

## 2026-06-12 — v0.3.2 : feuille ACTOR (swipe + z-index) · Mémoire réordonnable · fiche refermable

- **Fait** :
  1. **Feuille ACTOR** : passe AU-DESSUS de la tab bar (z-index 120 vs 100 — le
     bouton Sauvegarder était recouvert, vidéo 02:51) + **swipe-down** sur la
     poignée/le header : la feuille suit le doigt, seuil 90 px → glisse hors
     écran et ferme (= sauvegarde, closeActor).
  2. **Mémoire — ordre manuel** : poignée ⠿ sur les tâches « Cette semaine » et
     les cartes chantiers ; drag au doigt (touch + souris), index d'arrivée
     calculé sur les centres des cartes, champ `ordre` persisté en DB. Tri :
     ordre asc, sans-ordre derrière. « Cette échéance » reste triée par échéance
     (le deadline décide, pas la main).
  3. **Fiche chantier/livre refermable** : Mémoire ouvrait les fiches en rendu
     inline SANS retour (bug « je ne peux plus refermer ») → elles passent par
     la pile nav globale (`pushNav`, back bar « ← Mémoire ») + reload au retour.
- **DoD** : preview mobile — drag bleu : ordre changé ET persistant au reload ✓ ;
  fiche chantier : ouverture nav-page, retour « Mémoire », fermeture ✓ ; feuille
  ACTOR : « Sauvegarder · 1/5 » entièrement visible au-dessus de la nav ✓ ;
  zéro erreur console ; captures-test nettoyées. Swipe à confirmer sur iPhone.
- **Prochain** : transitions slide directionnel type iOS (maquette dédiée).

---

## 2026-06-12 — v0.3.1 : pictos main levée + fixes vidéo iPhone (perte de données, titres, feel)

- **Fait** :
  1. **Pictos tab bar** : les 4 dessins de Johann (IMG_8205 — sablier, cerveau,
     entonnoir, engrenage) vectorisés en SVG inline `stroke:currentColor` (l'actif
     passe en terracotta sans CSS dédié). L'identité dessin-récit est dans l'app.
  2. **Perte de données corrigée (bug le plus grave, vu sur vidéo)** : le
     pull-on-open écrasait le local quand iOS tuait la PWA avant le push de
     fermeture. Triple fix : hooks Dexie → flag `zc_dirty` à chaque écriture
     locale (suspendu pendant importAll) ; **push auto debounced 4 s** après
     toute écriture (la donnée part avant de quitter) ; au boot, si `zc_dirty`
     → push (local en avance) sinon pull. + listener `pagehide` en renfort.
  3. **Brouillon ACTOR** : fermer la feuille (✕/backdrop) sauvegarde désormais
     le brouillon (sans déclencher l'appel IA connexions) — avant, perte sèche.
  4. **Titres de liens** : `api/title.js` (Vercel, extraction og:title/<title>,
     cache 24 h) + `fetchTitleFor` après capture (jamais bloquant) + `capTitle()`
     partout (inbox, chips, corpus, pickers, titre ACTOR). Fallback sans titre :
     « Lien · domaine ». L'URL reste la donnée d'analyse, visible dépliée.
  5. **Feel natif** : `viewport-fit=cover` + status-bar translucent + safe-area
     top sur .scroll/.nav-back-bar (fini le contenu sous la Dynamic Island = les
     « rebords qui buguent ») ; listener `touchstart` (iOS n'applique pas :active
     sans lui) ; appui **instantané** (transition 0s à l'enfoncement, animée au
     relâcher) ; prefers-reduced-motion respecté.
- **DoD** : preview mobile — flag dirty posé à l'écriture ✓, capture lien →
  « Lien · lowtechlab.org » + domaine ✓ (titre réel viendra de l'API en prod),
  ACTOR : aim saisi puis fermeture backdrop → retrouvé en DB ✓, zéro erreur
  console, données nettoyées. Sync push/pull réel à confirmer sur iPhone.
- **Prochain** : Johann re-teste sur iPhone (capture → quitter → rouvrir ;
  titres de liens en prod) ; tester le Filtre IA de bout en bout.

## 2026-06-11 — v0.3 tranche 1 : refonte écran Mémoire (ex-Semaine)

- **Fait** : écran Mémoire au langage v0.2 — maquette statique d'abord
  (`maquette_memoire_v1.html`, validée preview dark+light) puis port dans
  index.html. Temps 1 : composer (UN CTA « Poser ») + backlog 2 groupes +
  chantiers ; profondeur : questions vivantes + bibliothèque sous un pli
  `<details>` en cartes `card-pli` (pattern Maintenant). Les emojis 🔴🔵🟢/📦/📖/📚
  remplacés par des **dots de couleur** (`.pdot`) et du texte — cohérence
  monochrome v0.2.1, la couleur reste une donnée (urgence), pas une déco.
  Bonus : **barre de progression** sur chaque carte chantier (étapes faites/total,
  calculée depuis db.etapes — la carte « progresse », leçon des chantiers 🟢).
- **Pourquoi** : « la question du temps 1 » (Basti Ui) reposée à cet écran :
  ce qui nourrit la prochaine action (backlog + chantiers) en premier, la
  profondeur (questions, livres) au second regard. Aucun CRUD retiré.
- **DoD** : preview mobile dark ET light — rendu fidèle maquette, vraies données
  affichées, ajout tâche → **persiste au reload** (puis nettoyée de la DB),
  pli ouvre/ferme, dots rendus, zéro erreur console. Aucune migration Dexie.
- **Piège dev (noté)** : le cache HTTP du navigateur (python http.server) peut
  servir un styles.css périmé même avec SW network-first — `fetch(url,{cache:
  'reload'})` pour forcer. Sans incidence en prod Vercel (headers corrects).
- **Prochain** : tranche 2 — refonte Flux (alléger, friction calibrée).

---

## 2026-06-11 — v0.3 tranche 2 : refonte écran Flux (alléger, friction calibrée)

- **Fait** : écran Capturer → **Flux**. Temps 1 réduit à deux choses : le composer
  et l'inbox « À traiter ». Composer allégé : types **sans emojis** (texte mono),
  rattachements projet/livre **repliés derrière un bouton ◎** dans la barre du
  composer (badge compteur si actif) — le lien peut aussi se faire plus tard au
  jugement ; hint redondant supprimé. « Plus tard », « Traités », revue hors-scope
  et Corpus ACTOR passent **sous un pli** « le reste du flux · n » (masqué si vide).
  ACTOR, liens entre captures, questions vivantes : inchangés sur le fond.
- **Pourquoi** : friction calibrée du scope — zéro à l'entrée (capter), choisie au
  jugement. L'écran montrait 5 sections empilées ; le moment d'usage « je trie mon
  inbox » n'a besoin que de l'inbox.
- **DoD** : preview mobile light + dark — capter une note → apparaît dans À traiter
  (badge nav 1), Traiter sans note → bascule dans le pli « · 1 » section Traités,
  donnée en **IndexedDB vérifiée**, pli masqué quand vide, zéro erreur console.
  Capture-test nettoyée. (Note outillage : `preview_click` peut viser un nœud
  re-rendu par Preact — cliquer via eval `.click()` fait foi.)
- **Prochain** : tranche 3 — extraction Corps (export données puis retrait onglet).

---

## 2026-06-11 — v0.3 tranche 3 : extraction du module Corps → Reprise-Sport

- **Fait** : le module nutrition sort de Zebracorn OS (P5 de la revue : 23 % du code
  hors boucle). Déposé dans `~/Desktop/Reprise-Sport/` : `nutrition.js` (composant
  complet), `nutrition-db.js` (data-layer Dexie + `importFromZebracornBackup()`),
  `nutrition.css` (styles .nutri-*, ~12 ko extraits de styles.css), `NOTE_NUTRITION.md`
  (dépendances + comment récupérer les données + conception à faire avant intégration).
  Côté Zebracorn : import retiré, onglet Corps supprimé (nav à 4), branche `sport`
  retirée, helpers nutrition supprimés de db.js, `git rm nutrition.js`.
- **Données : AUCUNE perte.** Les schémas Dexie v7/v8 (repas, courses,
  aliments_custom) restent déclarés, SYNC_TABLES inchangé → les données existantes
  sur l'iPhone restent en IndexedDB, dans la sync Supabase et dans l'export JSON
  (Réglages → Exporter, c'est la voie pour les rapatrier dans Reprise-Sport).
- **Pourquoi** : l'identité de l'app = capture/jugement/mémoire. Le corps a son
  app (Reprise-Sport). L'intégration là-bas se fera en session dédiée, conception
  d'abord (interview JTBD — grill en cours avec Johann).
- **DoD** : preview mobile — 4 onglets (Maintenant · Mémoire · Flux · Régl.),
  les 4 écrans rendent, `node --check db.js` OK, zéro erreur/warning console,
  tâches réelles toujours affichées (persistance intacte). −933 lignes JS, −12 ko CSS.
- **Prochain** : tranche 4 — Réglages, 3 métriques d'usage en grands chiffres Fraunces.

---

## 2026-06-11 — v0.3 tranche 4 : métriques d'usage dans Réglages

- **Fait** : section « Usage réel · 7 jours » en tête de Réglages — 3 grands chiffres
  Fraunces (`big-n`, leçon Monolog : le chiffre comme élément graphique) : captures/jour
  (moyenne 7 j, virgule fr), intentions/semaine (jours distincts avec intention, /7),
  ACTOR complétés (captures avec position Own remplie). Phrase-principe en dessous :
  « La prochaine revue produit se fait sur ces chiffres — pas au ressenti. »
- **Pourquoi** : c'est l'instrument du moratoire (REVUE §3) : R3 ne se déclenche que
  sur des métriques non nulles. Les zéros affichés aujourd'hui sont le constat honnête.
- **DoD** : preview mobile dark + light — calcul vérifié avec données temporaires
  (1 capture → « 0,1 », 1 intention → « 1/7 »), puis nettoyées de la DB. Zéro erreur
  console.
- **Note** : grill Reprise-Sport clos en parallèle — conception nutrition validée et
  gravée dans `Reprise-Sport/NOTE_NUTRITION.md` (phases qualitatives + log binaire +
  fiches Yuka consultatives ; session de build dédiée à venir).
- **Prochain** : tranche 5 — import-merge `actions_du_jour.json` (pont cerveau,
  bloquant connu : importAll REMPLACE tout).

---

## 2026-06-11 — v0.3 tranche 5 : import-merge du pont cerveau (bloquant levé)

- **Fait** : `importTachesMerge(dump)` dans db.js — valide le format
  (`_de==='zebracorn-cerveau'` + tableau `taches`), **AJOUTE sans rien effacer**,
  dédoublonne par titre (insensible à la casse) contre les tâches non faites.
  Section « Pont cerveau · actions du jour » dans Réglages avec son bouton d'import
  dédié et un message de résultat (« n ajoutées · m doublons ignorés »). L'import
  JSON destructif existant reste le filet de secours, clairement distingué.
  Bonus monochrome : 🤖/✨ retirés de la section Filtre IA, foot Réglages → v0.3.
- **Pourquoi** : c'était LE bloquant du pont cerveau (R2 de la revue) : `importAll`
  REMPLACE tout, impossible de faire couler les actions du wiki vers l'app sans
  perdre l'appareil. Le flux devient : cerveau → actions_du_jour.json →
  AirDrop/Fichiers → Réglages → fusion.
- **DoD** : testé preview avec le VRAI fichier du cerveau (3 tâches) — 1ᵉʳ import :
  3 ajoutées ; ré-import : 3 ignorées (idempotent) ; format invalide rejeté avec
  message clair ; les 10 tâches existantes intactes ; section rendue dans Réglages ;
  zéro erreur console. Tâches de test nettoyées.
- **Prochain** : backlog restant — pictos main levée (Johann dessine), header 375px
  (déjà resserré en v0.2.1, à confirmer sur iPhone), test Filtre IA avec clé Vercel.

---

## 2026-06-11 — v0.2.1 : polish fidélité maquette (retour vidéo iPhone)

- **Fait** : tab bar monochrome (◍ ▤ ◇ ⬡ ⊙ + labels complets, actif terracotta — les
  emojis 🌱🧠🥗 cassaient le monochrome, leçon Basti Ui) ; animation d'entrée de page
  (pageIn 240 ms à chaque changement d'onglet → toutes les pages en profitent) ; retours
  tactiles globaux (boutons scale .95, cartes/routines/items scale .985 + fond, tokens
  motion existants) ; cartes du pli plus lisibles en mode clair (border2 + ombre légère) ;
  header resserré (date nowrap 9px).
- **Pourquoi** : vidéo iPhone de Johann : le déploiement était bon mais le feel ne
  suivait pas la maquette (onglets colorés, navigation sèche, cartes plates en clair).
- **DoD** : preview mobile light : fidèle à la maquette (vérifié screenshot), zéro
  erreur console. Pas de refonte des écrans Mémoire/Flux/Réglages (prochaine session) :
  ils héritent quand même des transitions, retours tactiles et de la nouvelle nav.
- **Prochain** : refonte écrans restants + extraction Corps (session dédiée) ; pictos
  main levée de Johann pour remplacer les glyphes provisoires.

---

## 2026-06-11 — v0.2 « le rail d'abord » LIVRÉE (R1, push main → Vercel)

- **Fait** : refonte réelle de l'écran Maintenant dans index.html (−185/+737 sur 8
  fichiers, le composant Maintenant passe de 14,3k à 13k chars malgré les ajouts) :
  3 blocs (rail mode-auto par l'heure + 🎲 variation + état « ✓ ancrée » ; UNE prochaine
  action avec célébration et rotation ; capture note inline) + pli <details> contenant
  agenda, cap, chaîne (grand chiffre + heatmap 28 j depuis db.intentions), routines+AMWAP,
  revue hebdo (auto-ouverte le vendredi), resurfacing, lecture, inbox, quote. CSS v0.2
  ajouté (tokens motion existants réutilisés). Fix R0 : boucle infinie de l'automatisation
  « App ouverte → Ouvrir » documentée et remplacée par le pattern MENU dans R0_INTERCEPT.md.
- **Pourquoi** : maquette v2.1 validée par Johann (avec « une seule tâche »). Le mode
  auto suit le scope §5 (12-14 h et soir = relâché, week-end = libre, sinon fort).
- **DoD** : preview mobile : rendu 1 écran, vraie tâche du backlog affichée (« Talents
  for the Planet », 9 en attente), capture → IndexedDB confirmée APRÈS reload (puis
  nettoyée), pli 3 cartes, heatmap 28 cellules, dé OK, zéro erreur console. Merge
  claude/motion-feel-v2 → main, push 175c18d → Vercel auto-deploy.
- **Données** : aucune migration Dexie, aucune table touchée → données intactes.
  Recommandé à Johann : Réglages → Pousser (Supabase) après la première ouverture.
- **Prochain** : R0 sur l'iPhone (guide corrigé) ; extraction nutrition (Corps) en
  session dédiée ; pictos main levée ; resserrer le header 375 px.

---

## 2026-06-11 — Maquette v2.1 : gamification sobre + tab bar (pré-validation)

- **Fait** : application de DESIGN_PRINCIPES_v2 sur la maquette. Ajouts : 🎲 dé de
  variation sur le rail (rotation des questions = moteur-de-variation rendu tangible) ;
  chip 🔥 série dans le header ; micro-célébration à la complétion (« ✓ fait · 1/1 ·
  la chaîne tient ») ; carte « La chaîne » du pli refondue (grand chiffre Fraunces +
  heatmap 30 j façon Did I Do) ; tab bar 3 espaces AVEC labels (pictos provisoires :
  à dessiner à la main par Johann, leçon Basti Ui).
- **Pourquoi** : la gamification retenue est celle qui montre le réel (chaîne, heatmap)
  et celle qui varie (dé), pas des badges de plus. Tout le reste des principes (un CTA,
  monochrome, textes ferrés) était déjà respecté.
- **DoD** : testé preview mobile : dé rotation OK, célébration OK, heatmap 30 cellules,
  3 tabs labellisés, zéro erreur console. Connu/accepté : le header wrappe sur 2 lignes
  en 375 px (à resserrer en R1).
- **Prochain** : validation Johann → R0 (guide débutant réécrit dans R0_INTERCEPT.md,
  avec patron générique réutilisable) → R1 code.

---

## 2026-06-10 — Maquette « Maintenant v2 » + guide R0 (refonte, phase design)

- **Fait** : `maquette_maintenant_v2.html` (statique, données simulées, tokens du design
  system, dark/light). 3 blocs au-dessus du pli : rail (mode AUTO par l'heure, chip
  override), LA prochaine action (une seule, la 1re rouge ; faite → la suivante remonte),
  capture immédiate (sans changer d'écran). Tout le reste (agenda, cap, tracker,
  resurfacing, lecture) sous un pli <details> fermé par défaut. `R0_INTERCEPT.md` : guide
  pas-à-pas Raccourcis iOS (alarme → ouvrir l'app ; Instagram/YouTube → détour par le
  rail ; vérif Share Target) + DoD mesurable à 3 jours.
- **Pourquoi** : validation Johann du plan refonte (R0 + « une seule tâche »). La maquette
  matérialise « le rail d'abord » : l'écran entier tient en UNE hauteur d'iPhone (vs ~4
  avant), cohérent avec un moment d'usage de 30 s. Mode auto = friction de choix supprimée.
- **DoD** : testé preview 375×812 — dark ET light fidèles aux tokens ; intention + Entrée
  → rail replié « ✓ ancrée » ; tâche cochée → suivante affichée ; pli ouvre/ferme ;
  capture → confirmation ; zéro erreur console.
- **Prochain** : Johann valide visuellement la maquette (sur iPhone idéalement) + exécute
  R0 ce soir. Puis R1 en session de code : refondre l'écran Maintenant d'index.html sur ce
  modèle + modes auto + extraction nutrition (1 commit par tranche).

---

## 2026-06-10 — Revue produit + plan de refonte v1 (profil product designer)

- **Fait** : `REVUE_REFONTE_v1.md` à la racine. Fondée sur les données réelles du backup
  (0 intention, 0 routine, 0/10 tâches, 2 captures vs 26 incréments) + lecture du code.
  5 problèmes priorisés (P1 pas d'Intercept actif → tout le reste est secondaire ;
  P2 Maintenant = dashboard 12 blocs au lieu d'un rail 30 s ; P3 choix de mode manuel ;
  P4 capture à 2 taps ; P5 nutrition = 23 % du code hors boucle). Refonte « le rail
  d'abord » : 3 espaces (Maintenant 3 blocs + pli / Flux / Mémoire), Corps extrait,
  phases R0 (Intercept, config) → R1 (réduction) → R2 (pont cerveau : import-merge car
  importAll REMPLACE tout + export markdown) → R3 (conditionnée à 7 j d'usage mesuré).
- **Pourquoi** : le ratio construction/usage est inversé ; la refonte vise la bascule
  vers l'usage, pas plus de modules. Moratoire features rituels tant que métriques à zéro.
- **DoD** : revue écrite, plan phasé, critères de déclenchement définis. AUCUN code touché
  (méthode : maquette à valider avant).
- **Prochain** : validation Johann → maquette HTML Maintenant v2 → R1.

---

## 2026-06-09 — Architecture navigation + UX polish

- **Fait** :
  - **Nav stack global** (`pushNav`/`popNav` dans App) : drill-down depuis n'importe où vers `FicheChantier` ou `FicheLivre`. Overlay position:absolute qui glisse depuis la droite (iOS/Notion pattern). Tab nav masquée pendant la navigation. `FicheChantier`/`FicheLivre` : back-btn hardcodé retiré, remplacé par `nav-back-bar` globale avec label contextuel (`from:'Maintenant'`, `from:'Flux'`, etc.).
  - **Cross-links** : tâche Maintenant avec `chantierId` → "◎ Voir le chantier →" ouvre FicheChantier ; lecture card avec livre en cours → drill vers FicheLivre ; chantier chip sur capture → drill vers FicheChantier.
  - **ACTOR progress** : indicateur `✓` vert par étape complétée + bouton save adaptatif ("Sauvegarder · X/5" ou "⊙ Analyse complète").
  - **Fixes** : corpus doublon corrigé (filtre `statut !== 'inbox'`) ; `getWeekData` bascule sur semaine courante Lun→Dim ; rail feedback "✓ noté" ; boutons IA découvrables (état verrouillé visible) ; lecture card cliquable.
  - **Tabs** : Sem → Mém (🧠), Cap → Flux, Sport → Corps.

- **Pourquoi** :
  - La navigation plate (5 onglets sans drill-down) cassait le fil mental : on perdait le contexte en changeant d'onglet. Le nav stack résout ça sans complexifier le modèle mental — on sait toujours où on est et d'où on vient.
  - Les cross-links créent des "fils conducteurs" entre Maintenant, Flux, et Mémoire. La tâche du jour se relie à son chantier sans changer d'onglet.
  - Le progress ACTOR n'est pas un blocage (friction douce) mais une boussole : on voit ce qui manque sans être forcé. La valeur est dans la conscience, pas la contrainte.

- **DoD** : vérifié visuellement. Tous les chemins de navigation testés (drill chantier, drill livre, retour). Corpus plus dupliqué.
- **Prochain** : revue hebdo plus engageante (friction positive), resurfacing plus visible, connexions ACTOR en mode "graphe léger".

---

## 2026-06-09 — Incrément 25 : Connexions automatiques post-ACTOR (graph Obsidian type)

- **Fait** :
  - `api/actor-ai.js` — nouveau step `connect` (Haiku) : prend `current.{compress,own}` + liste `others[{id,compress,own}]` (max 20 captures traitées à 70%+), retourne `{connections:[{id,reason}]}` trié par force de connexion décroissante. `reason` = 3-5 mots (ex: "tension: autonomie vs contrainte").
  - **Déclenchement automatique** après `Sauvegarder ⊙` si `compress` + `own` remplis + Filtre IA activé. Pas de clic supplémentaire.
  - **Bouton "Sauvegarder ⊙" déplacé** : sorti du step R, mis dans un `.actor-footer` qui recouvre tout le panel. Après sauvegarde, le footer bascule en "⊙ Sauvegardé ✓" + bouton "Fermer" + section "🔗 Connexions".
  - **Section connexions** : 3 cartes. Chacune : [type_icon] contenu (60 chars) + raison IA en italique terracotta. Boutons "✓ Lier" (appelle `linkCaptures` existant) + "✗" (dismiss). Les cartes disparaissent au fur et à mesure des choix.
  - Reset propre : fermeture panel / ré-ouverture → états connexions réinitialisés.

- **Pourquoi** :
  - Ferme la boucle "second cerveau Obsidian" : une fois qu'on a une position (OWN) sur une capture, l'IA trouve les positions voisines dans le corpus. Les `linkedIds` existants deviennent le graphe de connaissances personnel. La valeur est dans la découverte — pas dans la visualisation (un graphe vide de 5 nœuds ne sert à rien ; le graph vient quand le corpus est dense).
  - Trigger = compress + own = seuil 70% ACTOR. Cohérent avec la demande "captures traitées à 70%+".
  - Haiku pour connect : tâche de matching, pas d'analyse profonde. ~$0.002/connexion.

- **Coût connect (Haiku)** : ~1600 tokens in × $0.80/M + ~100 tokens out × $4/M ≈ $0.002/appel.

- **DoD** : 22/22 vérifications OK. API step connect, states, fonctions, JSX footer, CSS.

- **Prochain** : Activer `ANTHROPIC_API_KEY` dans Vercel → tester sur une vraie capture avec compress+own → valider les 3 connexions proposées.

---

## 2026-06-09 — Incrément 24 : Le Filtre IA — ACTOR C + T assistés par Claude

- **Fait** :
  - `api/actor-ai.js` : Vercel serverless function, 2 étapes, zéro dépendance npm (fetch natif).
    - `step=compress` → Haiku 4.5 : titre + résumé 2-3 phrases en JSON pour le champ C.
    - `step=test` → Sonnet 4.6 : FICV complet (faits/interp/croyances/valeurs) + question socratique pour la section T.
    - Extraction JSON robuste (gère réponse brute + code block markdown). Clé API depuis `ANTHROPIC_API_KEY` (env Vercel — jamais exposée au client).
  - **Bouton "✨ Résumer avec Haiku"** dans la section C de l'ACTOR panel. Visible uniquement si Filtre IA activé.
  - **Bouton "✨ Analyser avec Sonnet"** dans la section T (au-dessus des FICV). Idem.
  - Les deux boutons sont désactivés pendant un chargement. Erreur affichée sous le bouton si l'appel échoue.
  - O (Position) et R (Run) restent **100% manuels**. A (Aim) se remplit après avoir vu la question T générée — c'est l'intention de Johann.
  - **Réglages → 🤖 Filtre IA** : toggle activé/désactivé + sélecteurs de modèle et température pour Compress (Haiku par défaut, t=0.3) et Test (Sonnet par défaut). Persisté en `localStorage`. Onglet Capture re-lit les settings à chaque montage (tab switch = remount).

- **Pourquoi** :
  - Flux voulu : Capturer → ouvrir ACTOR → ✨ Haiku résume le C en 3 sec → ✨ Sonnet génère les FICV + question T → Johann lit la question, formule son A (Aim), complète O (Position) et R (Run). L'IA réduit le coût cognitif d'entrée ("feuille blanche"), pas le jugement final.
  - Haiku pour C : tâche de compression factuelle, vitesse > nuance. Sonnet pour T : analyse critique où la nuance et la question socratique comptent.
  - Zéro dépendance npm : pattern identique à `api/ical.js`. Pas de package.json à gérer.

- **Coût réel estimé** :
  - Compress (Haiku 4.5) : ~600 tokens in × $0.80/M + ~150 tokens out × $4/M = ~$0.001/appel
  - Test (Sonnet 4.6) : ~850 tokens in × $3/M + ~200 tokens out × $15/M = ~$0.006/appel
  - Total par analyse complète : ~$0.007 (0.7 centimes). 100 analyses/mois ≈ $0.70.

- **Setup requis** : Ajouter `ANTHROPIC_API_KEY` dans Vercel > Settings > Environment Variables (réutiliser la clé du Filtre V1).

- **DoD** : 26/26 vérifications logiques OK. API function, DB helpers, Réglages section, boutons ACTOR C+T, state aiLoading/aiError.

- **Prochain** : Activer dans Réglages, tester sur une vraie capture. Vérifier que la clé V1 fonctionne bien.

---

## 2026-06-09 — Incrément 23 : Resurfacing quotidien

- **Fait** : Section "📍 Resurfacer" dans le Maintenant screen — entre la quote et l'inbox.
  - `getResurfaceCandidates()` : retourne les captures > 7 jours, jamais surfacées ou surfacées > 7 jours. Triées : inbox sans ACTOR en premier (les plus orphelines), puis le reste.
  - `seededShuffle(arr, seed)` : LCG déterministique seedé sur la date ISO du jour (`20260609`). Mêmes 3 captures toute la journée — change demain. Stabilité cognitive.
  - 3 captures max affichées. Section cachée si 0 candidats (pas de bruit).
  - Chaque carte : type icon + contenu (80 chars) + date relative + statut + badge ⊙ si ACTOR. Border-left terracotta pour distinguer visuellement.
  - **"→ Traiter"** : si la capture est `inbox` → navigate vers Capture (item visible en haut). Si `traité` ou `plus-tard` → rouvrir en inbox + navigate. Le traitement cognitif reste dans Capture — pas de duplication.
  - **"✓ Revu"** : `lastSurfaced = now` en DB + retire la carte localement immédiatement (sans reload). L'item sera de nouveau éligible dans 7 jours.

- **Pourquoi** : C'est la boucle manquante d'un second cerveau. Capturer sans jamais revoir = stock mort. La valeur d'un second cerveau est dans la remontée spontanée de captures oubliées — connexions nouvelles, positions à réviser, actions à déclencher. 3 captures = charge cognitive calibrée (ni submergé, ni insignifiant). Le seed déterministique évite l'effet "slot machine" (les mêmes 3 reviennent toute la journée, pas un roll à chaque visite).

- **DoD** : 13/13 vérifications logiques OK. Fonctions db.js présentes, state Maintenant, loader, handlers, JSX section.

- **Prochain** : Tester sur iPhone avec captures réelles > 7 jours. Puis Plan B = Le Filtre IA.

---

## 2026-06-09 — Incrément 22 : Croquis image · ACTOR dans corpus · NLM↔Zebracorn

- **Fait** :
  - **📐 Croquis = image** : le type Croquis déclenche maintenant un file picker image-only (caméra, Photos, fichiers scannés). Compression identique à Fichier. Miniature visible dans l'inbox et dans "Plus tard". Hint iOS "📷 Appareil photo · Photos · Dessins scannés".
  - **ACTOR dans l'export corpus** : les 5 champs de l'analyse ACTOR (`aim`, `compress`, `test` F/I/C/V + question socratique, `own`, `run`) sont maintenant exportés dans le `.md`. La **Position (Own)** apparaît comme `**Position :**` — directement lisible par NLM. L'ancien `annotation` n'est exporté que si pas d'ACTOR complet (rétrocompatibilité).
  - **NLM → Zebracorn** : détection auto des URLs `notebooklm.google.*` au Share Target → source automatiquement "NotebookLM". Dans le formulaire ACTOR : pré-remplissage aim avec "Session NotebookLM — [date] — quelle question j'explorais ?". Placeholders C et A spécifiques pour captures NLM. Bandeau "📒 Capture NotebookLM" sur la section Aim.

- **Pourquoi** :
  - Croquis = input analogique dans le second cerveau. Dessiner avant de digitaliser engage le moteur différemment (principe friction calibrée). La miniature rend le croquis visible immédiatement.
  - ACTOR dans corpus : les positions (OWN) restaient invisibles dans l'export → NLM ne pouvait pas répondre "Quelle est la position de Johann sur X ?". Maintenant si.
  - NLM → Zebracorn : quand Johann partage un audio NLM vers l'app, le contexte NLM est reconnu et les champs ACTOR sont pré-configurés pour la réflexion post-écoute, pas pour une analyse de texte générique.

- **DoD** : 11/11 vérifications logiques OK. Croquis miniature, ACTOR export, détection NLM, pré-fill aim, placeholders.

- **Prochain** : Test iPhone — partager une URL NLM → vérifier source "NotebookLM" + ACTOR pré-configuré. Export corpus → vérifier section ⊙ ACTOR avec Position visible.

---

## 2026-06-09 — Incrément 21 : Corpus enrichi · Tâche→Cap · Croquis · Chantiers été

- **Fait** :
  - **K — Questions vivantes dans le corpus** : `doCorpus()` génère maintenant une section `❓ Questions vivantes` avec l'intention de chaque question + les captures qui lui sont rattachées (filtrées sur traité ou annoté). Questions archivées listées en une ligne en bas de section.
  - **H — Lier tâche → objectif Cap 2026** : dans la vue expanded d'une tâche 🔴/🔵, un picker `🎯 Objectif Cap` liste les objectifs annuels (parsés depuis le Cap 2026 dans Réglages). Sélection = tap (toggle = désélectionner). Objectif lié visible comme petit chip terracotta sur la carte collapsée. `setTacheObjectif()` dans `db.js`, sans migration Dexie.
  - **📐 Croquis** : nouveau type de capture. Honore la capture analogique (photo d'un dessin, schéma, note à la main). Visible dans le picker de types + `T_ICONS` + `T_LBLS`.
  - **Seed chantiers été 2026** : 3 nouveaux chantiers verts au démarrage (flag `zebracorn_seed_ete2026`) : *Low-tech design appart parisien*, *Machine à pédale Singer redesignée*, *7 éléments → 6 prismes Campus Environnement*.

- **Pourquoi** :
  - **K** : le corpus NLM était aveugle aux questions vivantes — les captures rattachées à une question n'avaient pas de contexte dans l'export. Ferme la boucle capture→question→corpus→NLM.
  - **H** : ferme la boucle planif→cap. La friction est calibrée : opt-in conscient (expand + choisir), jamais automatique. L'acte de lier EST la réflexion stratégique.
  - **📐 Croquis** : friction calibrée — le dessin engage le moteur différemment. L'app archive la trace sans remplacer l'acte. Issu des notes chantiers d'été (schémas Singer, mapping 6 prismes).
  - **Chantiers été** : ancrer les projets low-tech dans l'outil. Machine Singer + 7 éléments→6 prismes sont des chantiers ressourcement scientifique en aval du cap Regen.

- **Design principle acté** : *friction calibrée*. Zero-friction n'est pas la cible. L'ACTOR à 5 étapes, le picker Cap opt-in, le type Croquis — chaque point de friction est un moment de jugement actif. L'app reprogramme le cerveau à faire des tâches complexes en les rendant désirables, pas invisibles.

- **DoD** : 11/11 vérifications logiques OK (node). Corpus questions présent, picker Cap dans expanded task, chip visible collapsée, Croquis dans types, seed été registré.

- **Prochain** : Test iPhone (picker Cap + Croquis + corpus). I (Le Filtre IA) quand inbox ~20+ captures.

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
