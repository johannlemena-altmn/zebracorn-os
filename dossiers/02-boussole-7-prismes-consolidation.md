# La Boussole d'Adaptation (radar à 7 prismes) : consolidation avant présentation aux acteurs

*Dossier de travail : 6 juillet 2026. Statut : cadrage Fable 5, à valider par Johann puis à durcir avec Claude Science.*
*Sources internes : note d'intention à Thibaut Massiet du Biest (30/06), pistes A/B du 22/06, kit d'entretien assurabilité.*

---

## 1. Ce qui est déjà acquis (l'invariant à ne pas rediscuter)

D'après la note d'intention, le cœur de l'outil est stable :

- **Un radar à sept prismes** qui lit, dans l'ordre, l'**exposition** d'une organisation, sa **capacité**, puis son **impact réel**.
- **Le principe fondateur : l'écart à un référentiel, plutôt que la prédiction.** C'est la meilleure idée de l'outil : un écart est auditable et discutable, une prédiction ne l'est pas. À défendre en toute circonstance.
- **Cinq prismes branchent des données qui existent déjà** (Météo-France, Géorisques, Banque de France).
- **Deux prismes n'existent nulle part et sont la signature** : la **justice de l'adaptation** (garde-fou contre la maladaptation) et les **dépendances matérielles** (les achats, scope 3), avec une grille à cinq critères par intrant : concentration de l'offre, exposition climatique de la source, levier géopolitique, substituabilité, criticité opérationnelle.

## 2. Nomenclature des 7 prismes (VALIDÉE par Johann le 6 juillet 2026, y compris P7 en anneau)

Reconstruction cohérente avec « exposition → capacité → impact » et avec les trois sources de données citées, validée comme nomenclature de travail (maquette : `maquette-radar-boussole.html`) :

| # | Prisme | Lecture | Référentiel d'écart | Donnée d'appui |
|---|---|---|---|---|
| P1 | Exposition physique des sites | Exposition | Aléas locaux vs aléas médians du secteur d'activité | Météo-France (Climadiag, DRIAS), Géorisques |
| P2 | Exposition des marchés et revenus | Exposition | Sensibilité climat du chiffre d'affaires vs pairs | Banque de France (ODACC, cotation sectorielle) |
| P3 | Capacité financière d'absorption | Capacité | Trésorerie/endettement vs seuils de résilience du secteur | Banque de France |
| P4 | Capacité organisationnelle et assurantielle | Capacité | Couverture, plans de continuité vs pratique de référence (esprit OCARA) | Déclaratif structuré + courtier |
| P5 | Impact réel constaté | Impact | Sinistralité et interruptions passées vs sinistralité attendue de la zone | Historique CatNat, arrêtés, déclaratif |
| P6 | **Dépendances matérielles (achats)** | Exposition amont | Grille 5 critères par intrant vs panier de référence du métier | Grille signature + terrain Massiet du Biest |
| P7 | **Justice de l'adaptation** | Garde-fou | Mesures envisagées vs critères de maladaptation (report du risque sur autrui, sur l'aval, sur plus vulnérable que soi) | Grille signature, à construire |

Deux remarques d'architecture :

- **P7 n'est pas un axe de plus sur le radar, c'est un filtre transversal** : une organisation ne devrait pas pouvoir « scorer » P7 comme elle score P1-P6 ; elle devrait voir ses plans d'adaptation *invalidés ou signalés* quand ils sont maladaptatifs. Le distinguer visuellement (anneau extérieur du radar, pas rayon) renforcerait la signature au lieu de la noyer.
- **Le lien avec le prix hédonique** (dossier 01) se branche sur P1/P5 : « voici ce que des actifs comparables, exposés comme les vôtres, valent déjà sur le marché ». C'est la couche de traduction en euros qui manque à tous les outils du tableau ci-dessous.

## 3. Positionnement : la Boussole dans le paysage existant

Le paysage est déjà dense, et deux outils publics sont gratuits. C'est la principale menace et il faut la regarder en face.

| Outil | Porteur | Nature | Coût | Ce que la Boussole fait en plus |
|---|---|---|---|---|
| OCARA | Carbone 4 (avec ADEME, HDI, Bureau Veritas) | Référentiel complet de résilience climatique, désormais aussi en SaaS | Payant (conseil/licence) | Légèreté PME ; P6 achats notés ; P7 justice ; traduction en valeur d'actif |
| OCARA pour PME | Carbone 4, Bpifrance, ADEME | Méthode simplifiée, libre | Gratuit | Idem ; mais c'est le concurrent frontal du « diagnostic vendu » : ne pas vendre ce qui est gratuit ailleurs |
| ClimaDiag Entreprise | Météo-France | Auto-diagnostic « premier pas », en ligne | Gratuit | La Boussole commence là où ClimaDiag s'arrête : capacité + impact + amont achats |
| ODACC | Banque de France | Visualisation des aléas pour l'entreprise, dans le cadre du PNACC | Gratuit (service BdF) | Confirme que « Banque de France » est un canal, pas seulement une donnée |
| Diagnostics CCI / ADEME subventionnés | CCI, ADEME | Accompagnement individuel | Subventionné | Réseau de distribution potentiel plutôt que concurrent |
| Bat-ADAPT (OID) | Observatoire de l'Immobilier Durable | Résilience physique des actifs immobiliers | Gratuit | Pont naturel avec le module hédonique ; périmètre immobilier seulement |

**Conclusion de positionnement** : la Boussole ne peut pas gagner comme « encore un diagnostic climat ». Elle peut gagner sur trois choses que personne n'assemble : (1) le prisme achats noté intrant par intrant, (2) le garde-fou justice/maladaptation, (3) la traduction du diagnostic en signal économique (assurabilité + valeur d'actif). La méthode de l'oncle (OCARA-simplifié, crédibilité CSRD) fournit le socle reconnu ; les trois éléments ci-dessus restent la brique défendable de Johann (réponse à la question vivante de la Piste A : « comment profiter d'un mentor sans devenir le junior qui déploie sa méthode »).

## 4. Modèles économiques candidats (« qui paie, et comment »)

Six candidats, chacun avec sa condition de viabilité et le test terrain qui permet de le tuer ou de le garder. Ordre de préférence argumenté.

1. **Prescripteurs assurantiels (courtiers, agents généraux, mutuelles régionales).** Qui paie : le courtier ou l'assureur, par dossier ou par abonnement. Pourquoi eux : l'outil réduit leur coût d'évaluation et arme leur conversation de renouvellement ; le wedge assurabilité de la Piste B teste exactement cette douleur. Condition de viabilité : que la tension assurantielle soit réellement ressentie par les PME en zone exposée (seuil déjà fixé : au moins 4 entretiens sur 8 confirmant douleur + déclencheur). Test : les entretiens Piste B, inchangés.
2. **Diagnostic subventionné via réseaux publics (CCI, ADEME, Bpifrance).** Qui paie : la puissance publique, l'opérateur étant référencé. Condition : compatibilité méthodologique avec OCARA PME (d'où la valeur du compagnonnage) et statut permettant le référencement. Test : une conversation avec un conseiller CCI transition écologique sur les critères de référencement.
3. **Module « dépendances matérielles » vendu seul aux directions achats d'ETI.** Qui paie : la direction achats, sur budget conformité (CSRD/VSME) ou continuité d'activité. C'est le terrain de Massiet du Biest et le prisme le plus original : il peut porter un produit autonome là où le radar complet serait trop lourd à vendre. Condition : que la grille 5 critères survive à la confrontation avec vingt ans de terrain achats. Test : l'échange demandé dans la note d'intention (ses trois questions sont déjà les bonnes).
4. **AMO adaptation pour collectivités et patrimoine public** (pont avec le Carnet ville-chaleur : diagnostic d'une place minérale + valeur des actifs riverains). Qui paie : la collectivité, sur budget études. Condition : une première référence montrable ; c'est exactement l'objectif O1. Test : le carnet n°1 lui-même.
5. **Formation / pédagogie outillée IA** (les « use-cases IA » notés pour l'oncle). Qui paie : cabinets et réseaux consulaires qui veulent monter en compétence. Revenu d'appoint, faible risque, faible plafond ; utile pour financer la traversée.
6. **Vente directe du diagnostic aux PME.** À garder en dernier : consentement à payer notoirement faible, concurrence gratuite (OCARA PME, ClimaDiag), coût commercial élevé. Ne devient viable qu'adossé au canal 1 ou 2.

**Recommandation** : instruire 1 et 3 en parallèle (les deux ont déjà leur test terrain planifié et leurs interlocuteurs identifiés), garder 2 et 4 comme structures de revenus à 12-18 mois, traiter 5 en opportuniste, ne pas investir 6.

## 5. Trames de présentation (les « plusieurs acteurs » de la note)

**Ordre retenu (décision du 6 juillet)** : 1. l'oncle (méthode, valide la nomenclature et P7-anneau) → 2. Massiet du Biest (barème P6) → 3. courtiers/CCI (après 2-3 entretiens Piste B, avec verbatims). Chaque étape produit l'artefact dont la suivante a besoin.

**Trame Massiet du Biest (prisme P6, 30 minutes)** : 1 image du radar → le principe d'écart au référentiel en une phrase → la grille 5 critères appliquée à UN intrant METRO réel (reprendre la note achats durables) → ses trois questions (déclencheurs réels de diversification ; achat durable alibi vs levier de résilience ; les 5-6 signaux qu'un acheteur surveille) → demande explicite : caler le barème, pas valider le plan.

**Trame oncle / méthode (Piste A, déjà cadrée le 22/06)** : garder le « qui possède quoi » (lui : méthode, terrain, crédibilité CSRD ; Johann : P7, pédagogie, outillage IA) et ajouter un point de ce dossier : la décision d'architecture P7 = anneau, pas rayon, à lui soumettre comme question de méthode.

**Trame générique tiers (courtier, CCI, collectivité, 10 minutes)** : la douleur d'abord (renouvellement d'assurance, dossier de crédit, actif exposé), le radar ensuite, jamais l'inverse ; conclure sur la traduction en euros (module hédonique) comme différenciateur mémorisable.

## 6. Limites et risques de l'outil lui-même (à dire avant qu'on nous les oppose)

1. **Un score non validé est une opinion dessinée en radar.** Tant que les pondérations et seuils ne sont pas étalonnés, présenter la Boussole comme « lecture structurée », jamais comme mesure. La consolidation Claude Science (section 7) est la réponse, pas la communication.
2. **Accès réel aux données.** « Banque de France » est un service rendu à l'entreprise (ODACC, cotation), pas une API ouverte pour un tiers : le modèle opérationnel doit prévoir que c'est l'entreprise qui apporte ses propres données BdF.
3. **Responsabilité du diagnostic.** Dire à une PME qu'elle est « résiliente » engage ; clause de périmètre et renvoi aux référentiels publics à prévoir dès le premier livrable payant.
4. **Dépendance au mentor** : risque déjà identifié en question vivante ; la parade est structurelle (P6, P7 et la couche valeur n'appartiennent qu'à Johann).
5. **Gratuité publique montante** : si l'État outille massivement les PME (tendance PNACC), la valeur migre du diagnostic vers l'interprétation et l'action ; les canaux 1, 3 et 4 y résistent, le 6 non. C'est un argument de plus pour l'ordre de préférence retenu.

## 7. Plan de consolidation scientifique (Claude Science, après la phase Fable 5)

1. **Validation de construit** : chaque prisme relié à la littérature (OCARA, TACCT, cadre exposition/sensibilité/capacité adaptative du GIEC) ; définition d'indicateurs et de seuils sourcés.
2. **Pondération** : élicitation structurée (Delphi court avec 3-5 experts : l'oncle, Massiet du Biest, un courtier) plutôt que pondérations décrétées.
3. **Backtesting** : le score P1-P5, calculé rétrospectivement sur des cas documentés (sinistralité CatNat, défaillances post-événement), discrimine-t-il mieux que le hasard ? Données CCR agrégées + cas d'école (dont le cas Renault déjà préparé).
4. **Fiabilité inter-évaluateurs** : deux personnes scorant la même PME doivent converger ; sinon la grille est sous-spécifiée.
5. **P7 opérationnalisé** : transformer « justice de l'adaptation » en liste de critères de maladaptation vérifiables (transfert du risque vers l'aval, vers plus vulnérable, verrouillage carbone), adossée à la littérature maladaptation.

Chaque étape produit un artefact montrable aux acteurs : c'est la boucle « présenter → durcir → représenter » qui fait converger le projet pro et le sérieux académique du M2.
