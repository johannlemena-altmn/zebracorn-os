# Revue produit et plan de refonte v1 — Zebracorn OS

*10 juin 2026 · revue à froid, profil product designer · fondée sur les données réelles
(backup du 8 juin), le JOURNAL (26 incréments) et la lecture du code (3 973 lignes).*

## 1. Les données d'abord

| Signal | Valeur (backup 08/06) | Lecture |
|---|---|---|
| Captures | 2 | le cœur du JTBD démarre à peine |
| Intentions posées | 0 | le rail n'est pas utilisé |
| Routines cochées / AMWAP | 0 / 0 | les rituels ne sont pas habités |
| Tâches faites | 0/10 | le backlog est posé, pas consommé |
| Incréments livrés | 26 en 3 jours | la construction va 10× plus vite que l'usage |

Verdict honnête : **l'app est devenue le projet au lieu d'être l'outil**. Rien d'anormal en
phase de build, mais c'est le moment exact où un produit bascule soit vers l'usage, soit
vers l'accumulation de modules. La refonte vise la bascule vers l'usage.

## 2. Diagnostic design (5 problèmes, par ordre de gravité)

### P1 · Il n'y a pas d'Intercept
Le JTBD commence par « quand je prends mon téléphone… ». Or rien n'intercepte : pas de
raccourci iPhone actif au réveil ni avant les réseaux. L'app attend d'être ouverte, donc
elle ne l'est pas. **Tout le reste est secondaire tant que ce déclencheur n'existe pas.**
C'est une config (Raccourcis iOS + PWA), pas du code.

### P2 · « Maintenant » est un dashboard, pas un rail
L'écran empile ~12 blocs : modes, rail, intention, cap annuel, cap mois, agenda, tracker,
3 tâches à sous-tâches, resurfacing, AMWAP, inbox, revue hebdo, lecture. Le moment d'usage
visé dure 30 secondes ; l'écran demande 4 hauteurs de scroll. Un rail, c'est UNE question
et UN geste. La densité actuelle reproduit ce qu'on combat : du contenu à scroller.

### P3 · Le choix du mode est une friction mal calibrée
3 boutons (Intercept fort / Relâché / Libre) demandent une décision à chaque visite. Le
scope §5 prévoyait des **modes horaires automatiques** : c'est la bonne réponse (l'heure
décide, override discret).

### P4 · La capture est trop loin
JTBD secondaire = capter en 1 geste. Elle est à 2 taps (onglet Flux). Le geste capital doit
vivre sur l'écran d'accueil.

### P5 · « Corps » dilue l'identité
nutrition.js = 933 lignes, 23 % du code, zéro lien avec la boucle
capture → jugement → action. Module d'urgence devenu onglet permanent. À extraire vers
Reprise-Sport (prévu dès sa conception, jamais fait). Symptôme plus large : la nav a déjà
été renommée deux fois (Sem→Mém, Cap→Flux, Sport→Corps) = architecture d'information
instable.

## 3. La refonte proposée : « le rail d'abord, le reste en profondeur »

### Architecture cible (3 espaces + réglages)
- **Maintenant** (agir, 30 s) : 3 blocs au-dessus du pli, rien d'autre :
  1. le rail : la question du mode (auto) OU l'intention du jour si déjà posée ;
  2. **LA prochaine action** : une seule tâche (la 1ʳᵉ rouge), pas trois ; en finir une
     vaut mieux qu'en voir trois ;
  3. **capture immédiate** : champ 1 tap, sans changer d'écran.
  Sous un pli « + » discret : agenda, cap, tracker, resurfacing, lecture, revue.
- **Flux** (capturer-juger) : inbox + ACTOR + Filtre IA + corpus. Inchangé sur le fond.
- **Mémoire** (profondeur) : chantiers, questions vivantes, bibliothèque, stats/badges.
- **Réglages** : + 3 métriques d'usage visibles (captures/j, intentions/sem, ACTOR
  complétés) : la prochaine revue produit se fera sur données, pas au ressenti.
- **Corps : supprimé** (module migré vers Reprise-Sport, données exportées avant).

### Phases (ordre strict)
- **R0 · Intercept (config, 0 code)** : raccourci iOS « réveil → ouvre Maintenant » +
  automatisation « ouverture Instagram/YouTube → question-rail ». Une soirée. Sans R0, ne
  pas faire R1.
- **R1 · Réduction** : Maintenant 3 blocs + pli ; modes auto par horaire ; extraction
  nutrition ; UNE tâche au lieu de trois. (1 session)
- **R2 · Pont cerveau** : import-merge `actions_du_jour.json` (l'`importAll` actuel
  REMPLACE tout : bloquant connu) ; export markdown des captures avec `statut` +
  `wikiPage`. (1 session)
- **R3 · Conditionnée à 7 jours d'usage réel mesuré** : rituels enrichis, graphe léger,
  moteur de variation. **Moratoire confirmé d'ici là** : aucune nouvelle feature de rituel
  tant que les métriques de R1 restent à zéro.

### Principes tenus
Friction calibrée (zéro sur capturer/agir, choisie sur consommer, conservée sur juger) ·
no-build Preact/htm · réutiliser l'existant (rien de l'actuel n'est jeté : déplacé sous le
pli ou dans Mémoire) · maquette avant code (méthode app : valider visuellement le
Maintenant v2 AVANT de toucher index.html).

## 4. Prochaine étape
1. Johann valide ou amende ce plan (surtout : R0 ce soir ? une seule tâche au lieu de
   trois, OK ?).
2. Maquette HTML du Maintenant v2 (données simulées) → validation visuelle.
3. R1 en session de code (lire JOURNAL.md d'abord, 1 commit par phase).
