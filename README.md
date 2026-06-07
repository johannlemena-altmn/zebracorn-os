# Zebracorn OS

PWA mobile-first · **Pattern B** (zéro build) · Preact + htm + Dexie/IndexedDB · Vercel

Infra perso de discipline + capture + mémoire cumulative. Voir `JOURNAL.md` pour
l'historique des décisions, et `.claude/skills/atelier-produit/` pour la méthode.

## Run local
```bash
python3 -m http.server 4242
# puis ouvrir http://localhost:4242 (pas file:// — les ES modules ont besoin d'un serveur)
```

## Deploy
Connecté à Vercel via GitHub → chaque push sur `main` se déploie tout seul.

## Stack (no-build)
- **Preact 10 + htm** (ES modules via esm.sh) — JSX en template literals, zéro Babel.
- **Dexie 3** — wrapper IndexedDB (données locales par appareil).
- **Supabase** (client, lazy-load) — sync cloud optionnelle, pas de backend.
- PWA : manifest + service worker **network-first** (frais en ligne, cache offline).

> Note : on a quitté React+Babel CDN (race conditions de scope) pour Preact+htm.
> Tout le JSX est **inline dans `index.html`** (un seul `<script type="module">`).

## Architecture
```
index.html            shell + tout le JSX (Maintenant · Semaine · Capturer · Réglages)
styles.css            design system (tokens papier/encre/terracotta + dark mode)
db.js                 Dexie schema + helpers + seed + export/import  (global window.db)
sync.js               module ES : sync Supabase (push/pull, lazy SDK)
manifest.webmanifest  PWA
sw.js                 service worker (network-first)
icons/                icon-192.png · icon-512.png (terracotta)
```

## Sync cloud — setup Supabase (5 min, à faire une fois)

L'app marche 100 % en local sans ça. Pour synchroniser plusieurs appareils :

1. Crée un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Dans **SQL Editor**, exécute :
   ```sql
   create table zebracorn_sync (
     space_id   text not null,
     table_name text not null,
     payload    jsonb,
     updated_at timestamptz default now(),
     primary key (space_id, table_name)
   );
   alter table zebracorn_sync enable row level security;
   create policy "espace ouvert" on zebracorn_sync
     for all using (true) with check (true);
   ```
3. Dans **Project Settings → API**, copie l'**URL** et la clé **anon public**.
4. Dans l'app → onglet **Réglages** → colle URL + clé + un **espace privé**
   (une phrase longue, ta clé secrète) → *Enregistrer*.
5. Sur l'appareil à jour : **↑ Pousser**. Sur l'autre : **↓ Tirer**.

**Sécurité v1** : la sécurité repose sur le secret de ton `space_id` (la clé anon
est publique par nature). Pas de chiffrement bout-en-bout. OK pour usage perso ;
à durcir (auth Supabase / RLS par utilisateur) avant tout multi-utilisateur.

**Filet de sécurité** : Réglages → *Exporter / Importer* (snapshot JSON local),
fonctionne hors-ligne, indépendant du cloud.
