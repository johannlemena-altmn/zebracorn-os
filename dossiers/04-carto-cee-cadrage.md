# Carto-CEE : cartographier les logements candidats aux aides (CEE, MaPrimeRénov') et aux besoins d'adaptation

*Dossier de travail : 6 juillet 2026. Statut : cadrage + prototype v0 (`carto-cee.html`).*
*Utilisateurs visés : délégataires CEE, artisans RGE, puis collectivités (OPAH/PIG). Horizon : contribuer à la rénovation du parc dans le cadre des chantiers sectoriels du PTEF (Shift Project) et du PNACC.*

---

## 1. Le job à faire

> **Quand** un délégataire ou un artisan RGE prospecte une zone, **il veut** voir quels logements sont candidats à quelles fiches d'opérations standardisées CEE (et aux dispositifs cumulables), avec les signaux d'adaptation du lieu, **afin de** cibler ses visites et ses devis au lieu de prospecter à l'aveugle.

Ce que l'outil apporte par rapport à l'existant : les bases publiques (DPE ADEME, Géorisques, BDNB) existent séparément ; personne ne les croise dans un geste simple « je regarde une rue, je vois les candidats et je sais quelle fiche ouvrir ». C'est aussi le chaînon opérationnel entre la Boussole (diagnostic), la couche hédonique (valeur) et le terrain (qui rénove quoi, financé comment) : le désajustement prix/risque du protocole 03 désigne les zones, Carto-CEE désigne les logements et le véhicule de financement.

## 2. Le principe : candidature probable, jamais droit acquis

Point de doctrine, non négociable dans toute présentation : **l'éligibilité CEE est attachée à une OPÉRATION (fiche standardisée + critères techniques du matériel et de la pose + qualification RGE), pas à un logement**. Les données publiques permettent de dire « ce logement est un candidat probable à ces fiches », jamais « ce logement a droit à ». L'outil produit du ciblage, le professionnel produit l'éligibilité. C'est exactement la posture « écart à un référentiel, pas prédiction » de la Boussole, transposée.

## 3. Architecture v0 (prototype livré : `carto-cee.html`)

Un fichier HTML autonome, zéro backend, données interrogées en direct dans le navigateur :

| Brique | Source (API publique) | Usage dans l'outil |
|---|---|---|
| Recherche commune | geo.api.gouv.fr | centre + code INSEE |
| Logements diagnostiqués | ADEME data-fair, jeu `dpe-v2-logements-existants` (endpoint `/lines`, filtre bbox) | points DPE géolocalisés : étiquette, type, énergie de chauffage, période, surface |
| Risques du lieu | Géorisques API v1 (`rga?latlon=`, `resultats_rapport_risque?latlon=`) | signaux d'adaptation au clic sur un logement |
| Fond de carte | tuiles OSM via Leaflet (CDN) | repérage ; **repli sans réseau** : nuage de points SVG sans fond |
| Moteur de règles | JSON embarqué (`REGLES`), éditable | logement → fiches candidates + dispositifs + alertes |

Décisions de sobriété : pas de compte, pas de stockage serveur, pas d'export de fichiers de prospection en v0 (voir limites, section 6) ; le référentiel de fiches est un JSON lisible qu'un professionnel peut corriger sans toucher au code ; l'outil fonctionne en mode démo (données fictives embarquées) quand les APIs sont injoignables, pour les présentations hors ligne.

## 4. Le moteur de règles v0 (à faire relire par le terrain, réf. alternance Énergie Responsable)

Heuristiques embarquées, chacune avec la fiche ou le dispositif associé :

- **Isolation** : BAR-EN-101 (combles/toitures), BAR-EN-102 (murs), BAR-EN-103 (plancher bas), BAR-EN-104 (fenêtres) : déclenchées par période de construction ancienne × étiquette D-G, modulées maison/appartement.
- **Chauffage** : remplacement fioul/gaz vers PAC (BAR-TH-171 air/eau, BAR-TH-172 eau/eau) ou biomasse (BAR-TH-112/113), avec le Coup de pouce chauffage quand l'énergie actuelle est fossile.
- **Rénovation d'ampleur** : étiquette F/G → orientation MaPrimeRénov' parcours accompagné (saut d'au moins 2 classes), cumul CEE.
- **Urgence locative** : étiquette G (location interdite depuis 2025) et F (échéance 2028, loi Climat et Résilience) → argument bailleur prioritaire.
- **Bonification précarité** : dépend des revenus du ménage (barèmes ANAH), invisibles dans l'open data → case déclarative dans le panneau, jamais déduite.
- **Signaux d'adaptation (PNACC)** : RGA moyen/fort → coupler la rénovation énergétique à la vigilance structurelle ; zone inondable → choix de matériaux résilients et précautions sur l'isolation des niveaux bas ; étiquette liée au confort d'été quand disponible. La rénovation qui ignore l'adaptation est le cas d'école de maladaptation : c'est le prisme P7 de la Boussole appliqué au bâtiment.

**Statut du référentiel** : les fiches et bonifications évoluent par arrêtés (6ᵉ période CEE). Le JSON embarqué est daté et marqué « à valider » ; la relecture par un professionnel des CEE (toi, ton entreprise, le PNCEE comme source) fait partie de la définition de fini de la v1, pas de la v0.

## 5. Trajectoire

- **v0 (livrée)** : carte par commune, points E/F/G cliquables, fiches candidates + signaux Géorisques, mode démo hors ligne.
- **v1 (ciblage de zones)** : agréger par IRIS/quartier avec la BDNB (le parc entier, pas seulement les logements déjà diagnostiqués), scorer les gisements (densité de passoires × énergie fossile × petits propriétaires), relecture du référentiel de fiches par un pro.
- **v2 (convergence)** : croiser avec la carte de désajustement prix/risque (protocole 03, livrable 5) pour prioriser les quartiers où la rénovation protège aussi la valeur ; brancher le module comme vue « bâtiment » de la Boussole pour les collectivités.

## 6. Limites et garde-fous (à dire d'emblée)

1. **La base DPE n'est pas le parc** : elle contient les logements déjà diagnostiqués (ventes, locations récentes) ; le gisement le plus intéressant (jamais diagnostiqué) n'y est pas. Réponse : BDNB en v1.
2. **Géocodage et fraîcheur** : DPE géocodés à l'adresse BAN, avec erreurs ; certains DPE sont anciens ou refaits. L'outil affiche la date du diagnostic.
3. **Cadre commercial** : le démarchage téléphonique en rénovation énergétique est interdit ; l'outil est un instrument de ciblage terrain et de préparation de visite, pas un générateur de fichiers de démarchage. Pas d'export massif en v0, mention explicite dans l'interface.
4. **Données personnelles** : adresses et DPE sont publics, mais le croisement avec des inférences (revenus supposés, vulnérabilité) créerait un traitement sensible : on ne stocke rien, on n'infère pas les revenus.
5. **Responsabilité** : une « fiche candidate » affichée n'engage pas l'éligibilité (section 2) ; le libellé le rappelle dans le panneau.
6. **Dépendance aux APIs publiques** : formats susceptibles d'évoluer ; les noms de champs et endpoints sont regroupés dans un bloc CONFIG unique en tête de fichier.

## 7. Modèles économiques candidats

1. **Délégataires** : génération de gisements qualifiés et conformes (l'outil documente le critère de candidature, utile en cas de contrôle) ; licence ou mise à disposition en marque blanche.
2. **Artisans RGE** : préqualification de chantiers autour de leurs zones d'intervention ; abonnement modeste, volume.
3. **Collectivités** : repérage de passoires pour OPAH, PIG, plans de sobriété ; prestation d'étude, pont direct avec l'AMO adaptation (dossier 02, canal 4).
4. **Interne Boussole** : vue « bâtiment » du diagnostic, non facturée séparément.

Le canal 1 est le plus naturel vu ton poste actuel : tu connais la douleur du délégataire (conformité des dossiers, coût d'acquisition) de l'intérieur.
