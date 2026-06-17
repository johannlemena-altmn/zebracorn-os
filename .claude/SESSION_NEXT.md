# Prompt — prochaine session Zebracorn OS

> À copier-coller tel quel en ouverture de la prochaine session Claude Code.
> Méthode : 10-80-10 · skill `atelier-produit` + `impeccable` · 1-2 features max entre vérifs

---

## Contexte projet (à lire avant d'ouvrir un seul fichier)

Zebracorn OS est une PWA vanilla (~131 KB index.html monolithique) — stack Preact/htm/Dexie.  
Répertoire : `~/Desktop/zebracorn-os/`  
Serveur de dev : `python3 -m http.server 4242` (config dans `.claude/launch.json`)  
Design system (tokens dans `styles.css`) :
- Couleurs : `--bg/#faf8f3`, `--ink/#24211c`, `--ac/#c2552f` (vermillon), `--ac2/#8a6d2f`, `--ok/#3f7d5a`
- Typos : `--fs` Fraunces (titres), `--fb` Inter (corps), `--fm` JetBrains Mono (labels mono)
- Radius : `--r:12px`, `--rl:18px`
- Motion : `--t-tap:90ms`, `--t-state:280ms`, `--t-page:240ms`, `--ease-out`, `--ease-spring`
- Dark mode via `@media(prefers-color-scheme:dark)` uniquement

**Contraintes dures** : zéro nouvelle dépendance · CSS-only animations sauf si impossible · local-only · commit sur `main` après chaque tranche vérifiée · JOURNAL.md tenu.

---

## Tâche 1 — Quick-win : cartes livre cliquables (flip 3D)

### Objectif
Les `livre-card` dans la section Bibliothèque (onglet Mémoire) flippent en 3D au tap/clic,  
révélant un verso avec info supplémentaire + bouton « → Ouvrir ». Sur desktop, hover suffit.

### Structure actuelle des cartes (index.html, ~l. 1601)
```js
const livrCard = l => html`<div class="livre-card" onClick=${()=>ouvrirLivre(l.id)} key=${l.id}>
  <div class="ch-top">
    <span class="ch-ti">${l.titre}</span>
    <span class="livre-statut" style="color:...">À lire / En cours / ✓ Lu</span>
  </div>
  // auteur, progress, intention, tags pills
</div>`;
```
Le `onClick` actuel ouvre directement FicheLivre — **à remplacer** par le mécanisme flip.

### Mécanique flip (inspirée de la video "3D Flip Card Hover Effect Under 5 Minutes")
```
.lv-flip-wrap          perspective + position:relative
  .lv-flip-inner       transform-style:preserve-3d · transition:0.35s ease
    .lv-face-front     backface-visibility:hidden (contenu actuel)
    .lv-face-back      backface-visibility:hidden · transform:rotateY(-180deg)
                       position:absolute · inset:0

.lv-flip-wrap.flipped .lv-flip-inner → transform:rotateY(180deg)
```

### Comportement
- **Mobile (tap)** : clic sur le wrapper → `setFlippedLivrId(id)` (toggle) ; tap hors carte → unflip
- **Desktop (hover)** : `@media(hover:hover){ .lv-flip-wrap:hover .lv-flip-inner { transform:rotateY(180deg); } }` — pas de JS nécessaire
- Clic sur « → Ouvrir » au verso → `ouvrirLivre(l.id)` (stopPropagation)

État Preact à ajouter dans le composant parent :
```js
const [flippedLivrId, setFlippedLivrId] = useState(null);
```

### Contenu du verso (face back)
- Background : `--ink` (inverse) · texte : `--bg`
- Radius : `36px 0 36px 0` (miroir du cartouche FicheLivre `0 36px 0 36px`)
- Si `l.amorces?.concept` : afficher 1re amorce (concept transférable) en italic 12 px
- Sinon si `l.intention` : afficher intention tronquée à 80 car.
- Badge statut en haut à droite (même palette couleur)
- Bouton vermillon centré « → Ouvrir » → `ouvrirLivre(l.id)`

### CSS à ajouter dans `styles.css`
```css
.lv-flip-wrap { perspective: 800px; position: relative; }
.lv-flip-inner { transform-style: preserve-3d; transition: transform 0.35s var(--ease-out); position: relative; }
.lv-face-front { backface-visibility: hidden; }
.lv-face-back {
  position: absolute; inset: 0; backface-visibility: hidden;
  transform: rotateY(-180deg);
  background: var(--ink); color: var(--bg); border-radius: 36px 0 36px 0;
  padding: 14px 14px 12px; overflow: hidden; display: flex; flex-direction: column; gap: 8px;
}
.lv-flip-wrap.flipped .lv-flip-inner { transform: rotateY(180deg); }
@media(hover:hover){
  .lv-flip-wrap:hover .lv-flip-inner { transform: rotateY(180deg); }
}
.lv-back-am { font-size: 12px; color: var(--bg2); font-style: italic; line-height: 1.5; flex: 1; }
.lv-back-open { /* bouton verso */ }
```

### Vérification attendue
- Preview : clic/hover sur une carte → flip 3D visible
- « → Ouvrir » au verso ouvre FicheLivre
- Aucune régression Chantiers/autres cards
- Console : zéro erreur

---

## Tâche 2 — §6.3 Planning/agenda bidirectionnel

### Entrée en session
Invoquer le skill `methode-app` pour le cadrage JTBD **avant** d'écrire une ligne de code.  
Questions à trancher avec Johann :
- Qui déclenche la vue agenda ? (Maintenant ? Nouvel onglet ?)
- Import `.ics` read-only d'abord ou bi-directionnel d'emblée ?
- AMWAP = champ de saisie fin de journée ou juste heatmap automatique ?

### Architecture proposée (à affiner avec le JTBD)
- **Nouveau type de carte** : `evenements` table Dexie (id, titre, dateDebut, dateFin, type, source)
- **Import `.ics`** : parser basique natif (regex sur VEVENT), no lib → stocke dans `evenements`
- **Export `.ics`** : stringify des tâches Zebracorn OS → fichier téléchargeable / lien `webcal://`
- **Vue agenda** : composant Agenda avec scroll jour/semaine dans onglet Maintenant (section dépliable)
- **AMWAP** : mini-log 2-3 lignes en fin de journée → heatmap dans Régl.

### Contraintes
- Pas d'OAuth (trop complexe) → import/export fichiers `.ics` seulement dans un 1er temps
- `#nudges-éthiques` : blocs de focus « protégés » (non interrompus par captures urgentes), zéro notif culpabilisante
- Même design system, zéro nouvelle dépendance

### Ressources
- `JOURNAL.md` (section `§6.3`, 2026-06-17) : notes d'architecture de la session précédente
- Skill `methode-app` : cadrage JTBD + story mapping

---

## Rappels de méthode
- Invoquer `atelier-produit` + `impeccable` en ouverture
- 10-80-10 : planifier l'archi → exécuter tranche par tranche → vérifier dans le preview
- 1-2 features max entre `preview_screenshot` de vérification
- Commiter après chaque tranche (pas à la fin)
- JOURNAL.md mis à jour avant de clore la session
- Contexte estimé ~60-70 % en ouverture → gérer la fenêtre, ne pas repartir de zéro
