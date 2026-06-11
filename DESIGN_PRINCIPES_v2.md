# Principes design v2 — leçons des revues vidéo (10 juin 2026)

*Synthèse des transcripts Basti Ui (« Je redesign vos applications »), Better Creating
(« Amazingly Simple iPhone Apps »), DesignCourse (« Fable 5 UI/UX One-Shots ») + analyse
Monolog. À appliquer pendant R1 et après. Complète `REVUE_REFONTE_v1.md`.*

## A · Leçons Basti Ui (hiérarchie, lisibilité, identité)

1. **La question du temps 1** : « quelles informations sont les plus importantes dans un
   temps 1 pour l'utilisateur, et comment les regrouper par groupes logiques ? » C'est
   exactement notre tri 3 blocs / pli. À reposer à CHAQUE écran pendant R1.
2. **Le contexte au-dessus des onglets** : un élément qui conditionne le reste (sa
   « ligue », chez nous le mode horaire) ne vit pas dans la tab bar : il vit en haut,
   comme l'adresse Uber Eats. Notre chip « auto · fort » est au bon endroit. ✓
3. **Textes ferrés à gauche, jamais centrés ni justifiés** (zigzag de l'œil, rivières
   blanches). À auditer dans l'app : la maquette a 2 textes centrés (note de pied,
   summary du pli) : acceptable car très courts, mais ne pas en ajouter.
4. **Interface monochrome, la couleur vient du contenu.** Son conseil escape game = notre
   choix papier/encre + terracotta accent. Validé, ne pas dériver. Le contenu (croquis,
   images capturées) apporte la couleur.
5. **Un seul call to action** (le bouton JOUER unique, « pied dans la porte ») = notre
   « une seule prochaine action ». Convergence totale. ✓
6. **Labels sous les icônes de tab bar** : pas de pictos muets. Vérifier nos 4 onglets.
7. **Pas de déco qui écrase la donnée ; pas d'image géante au détriment de l'info**
   (leçon GeoRide). Pour nous : les miniatures de capture restent 56 px, pas de hero.
8. **Pictos dessinés à main levée = identité authentique.** Son déblocage PFR. Pour nous,
   c'est une évidence-organisme : **Johann dessine les icônes de Zebracorn OS**
   (dessin-recit devient le langage visuel de l'app). À faire après R1, scannées via le
   type Croquis. Candidat : icônes des 4 onglets + badges.
9. **Micro-feedback signifiant** : la pulsation du point de tracking (état actif) plutôt
   qu'une épingle statique. Chez nous : le streak qui « respire » quand la routine du jour
   n'est pas faite ? À doser, jamais décoratif.

## B · Leçons Better Creating (la simplicité comme produit)

1. **Faire MOINS avec une attention au détail extrême** : « they're not trying to do
   more, they're trying to do less ». La refonte R1 est exactement ça.
2. **« Did I Do »** (yes/no + reset auto + heatmap) est le patron de nos routines :
   toggle binaire, zéro friction, la satisfaction vient de la heatmap. Notre mini-tracker
   7 jours est bon ; une heatmap mensuelle dans Mémoire suffirait comme seule
   « gamification » supplémentaire (au lieu de plus de badges).
3. **L'app doit « disparaître dans le workflow »** : form and function, invisible mais
   présente quand il faut. Le pli incarne ça.
4. **Curation de l'écran d'accueil + Focus modes iOS** : complément naturel de R0
   (l'intercept fonctionne mieux sur un écran d'accueil épuré). À ajouter au guide R0 :
   recommander à Johann une page d'accueil avec Zebracorn OS + 3 apps utiles max.
5. **Matter (read-later qui lit à voix haute)** : confirme le module lecture du soir
   comme régime de fidélisation. Pas de nouvelle feature : le bloc lecture du pli suffit.

## C · Leçons DesignCourse (l'IA comme outil de design)

1. La qualité perçue des UI « awwwards » tient aux **animations subtiles : timing et
   easing soignés**, pas à la quantité d'effets. Nos tokens motion (`--t-tap: 90ms`,
   `--ease-spring`) sont déjà là : les utiliser systématiquement, n'en pas créer d'autres.
2. **Générer des variantes puis choisir** : pour les écrans à fort enjeu (Maintenant),
   produire 2 variantes de micro-interactions et A/B à l'usage réel plutôt que débattre.
3. **« A trained eye can see a copy of a copy »** : ne PAS chasser le look awwwards
   générique (3D, shaders, hero pleine page). Notre identité papier/encre/typo est
   l'anti-tendance qui vieillira bien : c'est un atout, pas un retard.

## D · Leçon Monolog (copywriting)

Ton confiant et humain, **chiffres comme éléments graphiques**, phrases-principes
(« Rushed work compounds into regret »). Pour nous : les stats du corpus (Réglages)
peuvent devenir 3 grands chiffres Fraunces signifiants plutôt qu'une grille de KPI.
Et chaque écran peut porter UNE phrase-principe (le rail en a déjà une).

## E · Fluidité et zéro bug (engagements R1)

- Network-first SW déjà acté (jamais cache-first). Tester chaque tranche sur preview
  AVANT push + au reload (persistance).
- Pas de nouvelle dépendance. Preact/htm/Dexie suffisent.
- Toute animation : CSS only, tokens motion existants, 60 fps (transform/opacity
  uniquement, jamais layout).
- Budget poids : index.html ne doit pas grossir pendant R1 (la réduction doit se voir
  dans le code aussi).

## Sites awwwards (statut)
Monolog analysé (ci-dessus). rawhouseathens.gr, nirnor.jp : fetch bloqué (403) ;
unabyss.com, armory.framer.ai : non tentés. Une revue visuelle via le navigateur est
possible en session dédiée si besoin : mais la leçon C3 invite à ne pas trop s'en
inspirer (identité propre > tendance).
