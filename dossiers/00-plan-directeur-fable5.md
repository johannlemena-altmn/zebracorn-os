# Plan directeur : exploiter Fable 5 maintenant, consolider avec Claude Science ensuite

*Dossier de travail : 6 juillet 2026. Rédigé sur la branche `claude/hedonic-pricing-risk-analysis-fqiic1`.*
*Répond à la note : « penser le(s) modèle(s) économique(s), faire naître le modèle de prix hédonique (dimensions physique et environnementale), ou se concentrer sur l'outil d'analyse de risque à 7 prismes ».*

---

## 1. Le constat qui change le cadrage : ce ne sont pas deux chantiers, c'est un seul

La note posait une alternative (« soit le prix hédonique, soit la Boussole »). Après relecture de tout le matériau disponible (note d'intention à Thibaut Massiet du Biest, pistes A/B du 22 juin, chantier ville-chaleur, contexte immobilier/rénovation), l'alternative est fausse : **le modèle de prix hédonique est la couche « valeur » qui manque à la Boussole d'Adaptation**.

- La Boussole lit l'exposition, la capacité, puis l'impact réel d'une organisation, sur le principe de l'écart à un référentiel. Elle produit un diagnostic. Sa faiblesse commerciale connue : « qui paie, et comment » (question laissée ouverte dans la note d'intention).
- Le prix hédonique traduit une exposition environnementale en euros de valeur patrimoniale. C'est exactement ce qui transforme un diagnostic en argument de décision : « votre site est exposé » ne déclenche rien ; « des actifs comparables au vôtre, exposés comme le vôtre, se vendent déjà X % moins cher » déclenche.
- Le wedge assurabilité (Piste B) est le troisième sommet du même triangle : assurance, valeur d'actif et exposition physique sont trois lectures du même risque. La spécificité française (régime CatNat mutualisé, prime uniforme) affaiblit le signal assurantiel ; le signal « prix de l'actif » devient alors le plus lisible des trois.

**Décision de cadrage proposée** : la Boussole reste l'organe (le produit présenté aux acteurs) ; le prix hédonique devient son module de valorisation ET le candidat naturel de sujet de mémoire M2 (la partie qui exige une validation scientifique). Un seul récit, deux livrables.

## 2. Répartition Fable 5 / Claude Science

Le principe de répartition : **Fable 5 pour tout ce qui est cadrage, architecture, formalisation et rédaction dense** (le coût d'une erreur est faible, la vitesse compte) ; **Claude Science pour tout ce qui produit une affirmation empirique défendable** (exécution statistique, robustesse, préenregistrement respecté).

### Fait aujourd'hui avec Fable 5 (cette session)

1. Ce plan directeur.
2. `01-prix-hedonique-cadrage.md` : fondements, spécification proposée, cartographie des données françaises mobilisables, et surtout la liste honnête des limites concrètes (celles qui décident si le modèle « peut voir le jour »).
3. `02-boussole-7-prismes-consolidation.md` : formalisation de l'architecture, positionnement face à l'existant (OCARA, OCARA PME, ClimaDiag Entreprise, ODACC, diagnostics CCI), six modèles économiques candidats avec leurs conditions de viabilité et le test terrain associé, trame de présentation aux acteurs.

### À faire encore avec Fable 5 (avant la date limite du forfait)

- **Le protocole empirique préenregistré** du modèle hédonique : hypothèses H1 à H4 figées, spécifications écrites à l'avance, critères de rejet. C'est un document de rédaction pure : Fable 5 y excelle et Claude Science n'aura ensuite qu'à l'exécuter sans pouvoir « pêcher » des résultats.
- **Le script d'assemblage des données** (DVF + BDNB + Géorisques sur 2 ou 3 départements contrastés) : du code, pas de la science ; autant le faire produire maintenant.
- **La maquette du radar 7 prismes** (une page HTML sobre, style Zebracorn) pour les présentations acteurs : support visuel, pas de vérité scientifique dedans.

### Réservé à Claude Science (après)

- Exécution du protocole hédonique : estimation, diagnostics économétriques, tests placebo, analyse de sensibilité.
- Validation de construit de la Boussole : pondération des prismes (Delphi ou AHP avec les mentors), backtesting du score sur la sinistralité passée (données CCR), fiabilité inter-évaluateurs sur 2 ou 3 cas.
- Revue de littérature systématique (capitalisation des risques climatiques dans les prix immobiliers français ; maladaptation) pour le mémoire M2.

## 3. Arbitrage M2 / projet pro

| | M2 (mémoire) | Projet pro |
|---|---|---|
| Objet | Le lien risque physique → valeur : « le risque climatique est-il capitalisé dans les prix résidentiels français malgré la mutualisation CatNat ? » | La Boussole comme produit : diagnostic + traduction en valeur, vendu via prescripteurs |
| Ce qui est réutilisé | Le protocole hédonique, la revue de littérature, le jeu de données | Le même modèle, dégradé en « indice de désajustement prix/risque » par zone |
| Risque principal | Données DVF/DPE bruitées : prévoir un plan B (étude d'événement autour d'une inondation ou d'un zonage PPRI) | Construire avant d'avoir validé le problème (leçon post-hackathon : Piste B d'abord) |

Le même travail nourrit les deux : c'est le critère qui faisait hésiter la note initiale, et il est levé.

## 4. Décisions tranchées (validées par Johann le 6 juillet 2026)

- **Nomenclature P1-P7** : validée telle que proposée au dossier 02 (P7 en anneau transversal, pas en rayon).
- **Pilote du jeu de données** : l'urbain ICU, soit Paris et petite couronne (75, 92, 93, 94). Périmètre figé dans le protocole préenregistré (dossier 03, section 2).
- **Ordre des présentations acteurs** (logique : chaque étape produit l'artefact dont la suivante a besoin) :
  1. **L'oncle** (méthode) : c'est déjà la prochaine action de la Piste A, l'enjeu est interne et le risque faible ; il valide la nomenclature et la décision P7-anneau avant toute exposition externe. Support : la maquette radar.
  2. **Massiet du Biest** (P6) : on arrive avec un radar validé côté méthode et la grille 5 critères ; l'entretien sert à caler le barème achats, pas à défendre l'architecture.
  3. **Courtiers / CCI** (trame générique) : seulement après 2 ou 3 entretiens Piste B, pour présenter avec des verbatims terrain plutôt que des hypothèses.

### Livrables Fable 5 complémentaires (produits le 6 juillet)

- `03-protocole-preenregistre.md` : protocole empirique figé (H1-H4, spécifications S1-S3, placebos), le commit Git faisant foi d'horodatage.
- `scripts/assemble_donnees.py` : assemblage DVF × BDNB × Géorisques × LCZ en étapes rejouables, filtres du protocole implémentés.
- `maquette-radar-boussole.html` : maquette de présentation autonome (radar 6 rayons + anneau P7, vue table, modes clair/sombre, palette validée daltonisme/contraste).
