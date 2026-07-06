# Protocole empirique préenregistré : capitalisation de l'exposition environnementale dans les prix résidentiels (pilote urbain ICU)

*Version 1.0, 6 juillet 2026. Statut : PRÉENREGISTRÉ.*
*Règle du jeu : ce document est figé AVANT toute ouverture des données. Le commit Git qui l'introduit fait foi d'horodatage. Toute modification ultérieure passe par une nouvelle version, avec l'écart consigné en section 9. L'exécution (estimation, tests, robustesse) est confiée à Claude Science, qui n'a pas le droit d'ajouter une hypothèse après avoir vu les résultats.*

---

## 1. Question de recherche

Dans un marché urbain dense où le régime CatNat mutualise le risque assurantiel, **le marché résidentiel capitalise-t-il l'exposition environnementale des logements** : chaleur urbaine (ICU) d'une part, zonage réglementaire inondation (PPRI) d'autre part ?

Sous-question qui porte le projet pro : là où la capitalisation est faible alors que l'exposition est documentée, l'écart mesure un **désajustement prix/risque** exploitable en diagnostic (Boussole, module valeur).

## 2. Périmètre (figé)

- **Territoire pilote** : Paris et petite couronne (départements 75, 92, 93, 94). Justification : gradient ICU maximal en France, couverture LCZ disponible, PPRI Seine/Marne en vigueur, densité de mutations suffisante, continuité avec le chantier O1 (Carnet ville-chaleur parisien).
- **Période** : mutations du 01/01/2018 au dernier millésime DVF disponible. La période enjambe la réforme du DPE (juillet 2021) et les étés extrêmes 2022-2023 : les deux ruptures sont exploitées, pas subies.
- **Unités** : ventes de gré à gré de maisons et d'appartements (nature de mutation « Vente »), mutations mono-bien après reconstitution (règles section 5).

## 3. Hypothèses (figées, avec sens attendu et taille d'effet minimale d'intérêt)

| # | Hypothèse | Sens attendu | MDE | Ce qui compte comme confirmation |
|---|---|---|---|---|
| H1 | À caractéristiques du bien et micro-quartier donnés, un logement en zone climatique locale minérale (LCZ bâties denses/minérales) se vend moins cher qu'un logement en zone végétalisée | δ < 0 | 1 % du prix | δ négatif, p < 0,05, robuste aux spécifications S1-S2 |
| H2 | Cette décote se renforce après les étés 2022 et 2023 (saillance) | interaction année × ICU croissante | +0,5 pt entre 2018-2021 et 2023-2025 | pente positive des interactions post-2022, test de tendance |
| H3 | À la frontière d'un zonage PPRI, la décote côté zone est faible ou nulle (mutualisation CatNat) | δ ≈ 0 (test bilatéral) | 1 % | intervalle de confiance contenu dans ±2 % = « capitalisation faible » confirmée ; décote > 2 % = capitalisation réelle ; les deux issues sont publiables |
| H4 | La décote ICU est plus forte pour les biens les moins adaptables : DPE E-G et construction avant 1948 | interaction ICU × DPE(E-G) < 0 | 0,5 pt | interaction négative significative |

Aucune autre hypothèse ne sera testée puis rapportée comme si elle avait été prévue. Les explorations hors H1-H4 seront étiquetées « exploratoire » dans tout livrable.

## 4. Variables et sources (figées)

- **Dépendante** : ln(prix de mutation). Alternative de sensibilité : ln(prix/m²).
- **Structurel** (DVF + BDNB) : ln(surface bâtie), nombre de pièces, type (maison/appartement), période de construction (classes BDNB), classe DPE (A-G + manquant en catégorie propre).
- **Localisation** : effets fixes section cadastrale × année. C'est le cœur de l'identification : tout invariant du micro-quartier (prestige, écoles, métro) est absorbé.
- **Exposition ICU** : classe LCZ du bâtiment (cartographie Cerema des zones climatiques locales). Indicateur binaire préenregistré : LCZ ∈ {1, 2, 3, 8, 10, E} = « minéral » ; LCZ ∈ {6, 9, A, B, D, G} = « végétalisé/aéré » ; autres classes = catégorie intermédiaire. Variable continue de sensibilité : part de « minéral » dans un rayon de 200 m.
- **Exposition inondation** : appartenance au zonage PPRI (polygones Géorisques) + distance signée à la frontière de zone (pour la discontinuité S3).
- **Contrôles environnementaux** : aléa retrait-gonflement des argiles (Géorisques, 3 classes), exposition au bruit Lden (cartes stratégiques de bruit, classes ≥ 65 dB), pour éviter que l'ICU capte le bruit ou l'argile.
- **Temps** : effets fixes trimestre.

## 5. Filtres de données (figés avant lecture des données)

1. Nature de mutation = « Vente » ; type local ∈ {maison, appartement}.
2. Reconstitution des mutations multi-lignes par identifiant de mutation ; exclusion des mutations multi-biens hétérogènes (vente en bloc, bien + dépendances multiples non valorisables séparément).
3. Surface habitable entre 9 et 300 m² ; prix entre les percentiles 0,5 et 99,5 du prix/m² par département × année.
4. Exclusion des ventes en l'état futur d'achèvement si identifiables, des échanges, adjudications.
5. Un bien apparié BDNB avec score de confiance de jointure faible reste dans l'échantillon principal sans attributs BDNB (catégorie « manquant ») et sort du sous-échantillon « apparié » (section 7).

## 6. Spécifications (figées)

- **S1 (principale)** : MCO, ln(prix) sur les variables de la section 4, effets fixes section cadastrale × année + trimestre. Erreurs types clusterisées par section cadastrale.
- **S2 (robustesse spatiale)** : modèle à erreur spatiale (SEM) sur matrice de contiguïté des 10 plus proches voisins, sur l'échantillon S1.
- **S3a (événement)** : interactions année × indicateur ICU, années 2018-2021 en référence ; graphique d'étude d'événement.
- **S3b (discontinuité PPRI)** : régression sur la distance signée à la frontière de zonage, polynôme local de degré 1, fenêtres de 100/200/300 m, uniquement sur les paires de sections traversées par une frontière.

## 7. Tests de falsification et sensibilité (figés)

1. **Placebo spatial** : permutation aléatoire des classes LCZ entre sections cadastrales (500 tirages) ; le δ observé doit sortir de la distribution placebo.
2. **Placebo de frontière** : frontières PPRI translatées de 300 m vers l'extérieur ; l'effet doit disparaître.
3. **Sous-échantillons** : (a) biens bien appariés BDNB seulement ; (b) hors Paris intra-muros ; (c) appartements seulement.
4. **Multicolinéarité** : VIF rapportés ; si VIF(ICU, bruit, argiles) > 10, les coefficients concernés sont présentés en fourchette avec et sans le contrôle en cause.
5. **DPE** : réplication de H1 sans la variable DPE (échantillon complet 2018-2025) pour vérifier que la rupture 2021 du DPE ne porte pas le résultat.

## 8. Puissance, seuils, interprétation

- Seuil α = 0,05, tests bilatéraux partout (y compris H1 : une prime « minérale » serait un résultat, pas une anomalie à cacher).
- Effectif attendu : plusieurs centaines de milliers de mutations sur 75/92/93/94 × 8 ans ; la contrainte de puissance réelle porte sur S3b (fenêtres étroites), à documenter avant interprétation.
- Un résultat nul est un résultat : pour H3 en particulier, « le marché ne price pas le zonage » est la conclusion qui alimente le récit Boussole (désajustement prix/risque) et le mémoire (effet CatNat).
- Aucun coefficient ne sera présenté à un public sans son intervalle de confiance et sans le rappel des limites 1 à 8 du dossier 01.

## 9. Registre des écarts au protocole

| Date | Écart | Raison | Impact sur l'interprétation |
|---|---|---|---|
| *(vide à l'enregistrement)* | | | |

## 10. Livrables attendus de la phase Claude Science

1. Tableau des coefficients H1-H4 (spécifications S1, S2) avec intervalles.
2. Graphique d'étude d'événement (S3a) et graphique de discontinuité (S3b).
3. Distribution placebo vs effet observé.
4. Note de limites reprenant point par point la section 4 du dossier 01, avec ce que les données ont confirmé ou aggravé.
5. Carte du désajustement prix/risque par section cadastrale (livrable pro, étiqueté exploratoire).
