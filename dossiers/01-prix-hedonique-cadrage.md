# Le modèle de prix hédonique « physique + environnemental » : cadrage, faisabilité, limites

*Dossier de travail : 6 juillet 2026. Statut : cadrage Fable 5, à consolider scientifiquement avec Claude Science.*
*Question directrice : ce modèle peut-il voir le jour, avec quelles données françaises, et avec quelles limites concrètes ?*

---

## 1. Ce que dit la théorie (le socle à maîtriser pour le M2)

La méthode des prix hédoniques repose sur deux idées :

1. **Lancaster (1966)** : un bien n'a pas de valeur en soi ; il est un panier de caractéristiques, et c'est chacune d'elles qui porte de l'utilité. Un logement = des mètres carrés + un état + une localisation + un environnement.
2. **Rosen (1974)** : sur un marché à l'équilibre, le prix observé d'un bien révèle les **prix implicites** de ses caractéristiques. En régressant le prix sur les attributs, la dérivée partielle du prix par rapport à un attribut donne son prix marginal implicite : ce que le marché « paie » pour un degré de moins d'exposition à un risque, pour un arbre de plus, pour une classe DPE de mieux.

Le cadre canonique a deux étapes : la première (estimer la fonction de prix) est robuste et praticable ; la seconde (remonter à la fonction de demande, donc au consentement à payer pour des changements non marginaux) pose un problème d'identification sérieux, documenté depuis Brown et Rosen (1982). **Décision de cadrage : le projet reste en première étape.** On mesure des prix implicites, on ne prétend pas mesurer des courbes de demande. Cette humilité méthodologique est défendable en jury et suffisante pour l'usage pro.

### La spécificité du projet

Les études hédoniques françaises existantes traitent surtout la dimension énergétique (la « valeur verte » des Notaires de France, estimée précisément par méthode hédonique sur les bases notariales : décotes des étiquettes F-G pouvant aller de -5 % à plus de -20 % selon les régions par rapport à une classe D). Le projet ajoute ce que ces études ne croisent pas :

- **Dimension physique du bâti** : surface, époque, état, performance (DPE), matériaux.
- **Dimension environnementale d'exposition** : inondation, retrait-gonflement des argiles (RGA), îlot de chaleur urbain (ICU), recul du trait de côte.
- **Dimension environnementale d'aménité** : végétation, ombrage, bruit, proximité d'espaces verts.

Le croisement exposition × aménité à l'échelle micro-locale (la place, la rue) est le territoire encore peu occupé, et il rejoint directement le chantier Carnet ville-chaleur (O1).

## 2. La spécification proposée (à préenregistrer avant toute estimation)

Forme de base, log-linéaire, standard et lisible :

```
ln(prix_i) = α
  + β·S_i        (structurel : surface, pièces, époque, type, DPE)
  + γ·L_i        (localisation : effets fixes fins, ex. section cadastrale × année)
  + δ·E_i        (environnement : zonage PPRI, aléa RGA, indicateur ICU, NDVI, bruit)
  + θ·T_i        (temps : trimestre de mutation)
  + ε_i
```

Trois niveaux de rigueur croissante, à annoncer dès le protocole :

1. **MCO avec effets fixes fins** : la version de base. Les effets fixes de micro-quartier absorbent l'essentiel de l'inobservé spatial ; on identifie δ sur la variation *à l'intérieur* d'un micro-quartier.
2. **Économétrie spatiale** (modèles à décalage spatial ou à erreur spatiale) : traite l'autocorrélation résiduelle des prix, attendue sur ce type de données.
3. **Quasi-expérimental**, le vrai plan B et la meilleure carte pour un mémoire :
   - **Discontinuité de régression aux frontières de zonage** (PPRI) : deux biens quasi identiques de part et d'autre d'une limite réglementaire ;
   - **Étude d'événement / différence de différences** autour d'un choc de saillance : une inondation médiatisée, la publication d'une carte de risque, un épisode caniculaire. C'est le design qui répond à la critique « le marché ne price que ce qu'il voit ».

## 3. Les données françaises mobilisables (toutes ouvertes ou quasi)

| Brique | Source | Ce qu'elle apporte | Piège connu |
|---|---|---|---|
| Transactions | DVF (Etalab) / DV3F (Cerema) | Prix, date, surface, localisation parcellaire | Aucune caractéristique de confort ni DPE ; Alsace-Moselle absente ; ventes atypiques à filtrer |
| Attributs bâtiment | BDNB (CSTB) | Jointure bâtiment : DPE, époque, matériaux, usage | Appariement adresse/parcelle imparfait ; qualité variable |
| Performance énergie | Base DPE (ADEME, open data) | Étiquettes, consommations | Fiabilité contestée du DPE, ruptures méthodologiques (réforme 2021) |
| Exposition risques | Géorisques (zonages PPRI, aléa RGA, TRI) | Variables d'exposition réglementaires et physiques | Le zonage réglementaire n'est pas l'aléa physique : les deux se capitalisent différemment |
| Sinistralité | CCR (études CatNat) | Le « réalisé » du risque, pour le backtesting | Accès agrégé, pas à l'adresse |
| Climat / ICU | Météo-France (DRIAS, Climadiag), cartographies LCZ, NDVI satellitaire (Copernicus) | Chaleur urbaine, végétation, projections | L'ICU se mesure à des échelles fines : choix méthodo à assumer |
| Bruit | Cartes stratégiques de bruit (ex. Bruitparif en IdF) | Aménité négative de contrôle | Couverture hétérogène hors grandes agglos |

L'assemblage DVF × BDNB × Géorisques sur 2-3 départements contrastés est un travail de code, pas de science : à faire produire par Fable 5 (script Python documenté), à exécuter et auditer ensuite.

## 4. Les limites concrètes (la partie demandée par la note : « avec quelles limites »)

Classées de la plus structurante à la plus gérable. Chacune avec sa parade honnête.

1. **Le régime CatNat français affaiblit la capitalisation du risque.** La surprime catastrophes naturelles est uniforme : l'acheteur français est largement assuré contre l'inondation quel que soit le lieu, donc le prix a de bonnes raisons de *ne pas* refléter le risque. C'est la limite la plus profonde ET la meilleure question de recherche : « que price le marché quand l'assurance mutualise ? ». Un résultat proche de zéro est ici un résultat, pas un échec. C'est aussi le pont exact avec le wedge assurabilité de la Piste B : si demain l'assurabilité se tend, la décote latente se matérialise.
2. **Le marché ne capitalise que l'information saillante.** Les décotes apparaissent après les événements et les publications de cartes, puis s'estompent (résultat récurrent de la littérature internationale sur les inondations). Parade : designs en étude d'événement, et interpréter les coefficients comme « capitalisation à date », jamais comme valeur actuarielle du risque.
3. **Variables omises corrélées.** La végétation est corrélée à la qualité résidentielle générale ; l'exposition au bruit à la pauvreté du quartier. Un δ naïf mélange tout. Parade : effets fixes micro-locaux, frontières de zonage, contrôles de composition sociale (données Filosofi INSEE).
4. **Tri résidentiel (endogénéité de la localisation).** Les ménages les moins averses au risque achètent en zone exposée : le prix implicite estimé reflète les préférences des acheteurs marginaux de ces zones, pas celles de la population. Parade : le dire, et rester en première étape de Rosen.
5. **Qualité des données d'appariement.** DVF sans attributs → tout repose sur la jointure BDNB, imparfaite ; DPE bruité et discontinu en 2021. Parade : analyses de sensibilité sur les sous-échantillons bien appariés ; ne jamais commenter un coefficient DPE au dixième près.
6. **Non-marginalité du changement climatique.** L'hédonique mesure des écarts marginaux à l'équilibre ; un basculement systémique (retrait assurantiel, inconstructibilité) casse l'équilibre qui fonde la méthode. Parade : cantonner le modèle au constat présent, et laisser la prospective à la Boussole (scénarios, pas de prix).
7. **Validité locale.** Les prix implicites ne se transfèrent pas d'un marché à l'autre (le « benefit transfer » est fragile). Parade : viser 2-3 territoires contrastés et présenter des fourchettes, jamais un chiffre national.
8. **Multicolinéarité des attributs environnementaux** (végétation, ICU et densité se recouvrent). Parade : parcimonie, indices composites assumés, VIF au protocole.

**Verdict de faisabilité** : le modèle peut voir le jour en première étape, sur données ouvertes, à coût nul hors temps de travail. Sa version « chiffre unique de valeur environnementale » est hors d'atteinte honnêtement ; sa version « décotes/primes locales documentées + indice de désajustement prix/risque » est atteignable et plus utile.

## 5. Les modèles économiques liés (qui paie ce modèle ?)

1. **Module de valorisation de la Boussole** (voie principale) : le diagnostic 7 prismes se conclut par « ce que ça vaut déjà sur le marché ». Payé indirectement, via le diagnostic.
2. **Indice de désajustement prix/risque** par zone : là où le marché ne price pas un risque documenté, il y a soit une opportunité d'acquisition-rénovation (lien direct avec le process de développement immobilier déjà documenté : DVF, PLU, friches), soit un argument d'AMO auprès des collectivités (place minérale surexposée = actifs municipaux surévalués).
3. **Études « valeur verte/brune » locales** pour foncières, bailleurs, notaires locaux : marché existant mais occupé (les Notaires ont le monopole de la donnée fine). Différenciation possible uniquement sur le croisement climat physique × valeur, pas sur l'énergie seule.
4. **Mémoire M2** : la version scientifique finance en crédibilité, pas en euros ; c'est elle qui rend les trois autres défendables.

## 6. Protocole de passage à Claude Science (à figer avant d'ouvrir les données)

- **H1** : à caractéristiques égales, le zonage réglementaire inondation (PPRI) est associé à une décote ; **H2** : l'aléa physique hors zonage ne l'est pas (test de la saillance réglementaire) ; **H3** : la décote augmente après un événement CatNat local puis décroît ; **H4** : l'exposition ICU est associée à une décote détectable seulement après 2022 (étés extrêmes récents).
- Spécifications 1 à 3 écrites avant estimation ; seuils de puissance et critères de rejet posés ; tests placebo (zonages fictifs décalés) obligatoires.
- Livrables Claude Science : tableau de coefficients avec intervalles, courbe événementielle, note de limites reprenant la section 4 point par point.
