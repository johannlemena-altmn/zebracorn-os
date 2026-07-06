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

## 4. Ce que ce plan ne décide pas (à trancher par Johann)

- La nomenclature exacte des 7 prismes : le dossier 02 propose une reconstruction complète, marquée comme proposition, à valider ou corriger.
- Le choix des départements pilotes pour le jeu de données (proposition par défaut : un littoral atlantique, un urbain dense soumis aux îlots de chaleur, un rural argileux soumis au retrait-gonflement).
- La priorité entre les deux acteurs à présenter en premier (Massiet du Biest sur le prisme achats, ou l'oncle sur la méthode OCARA-simplifiée) : les deux trames sont dans le dossier 02.
