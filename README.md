# Zebracorn OS

PWA mobile-first · Pattern B · React/Babel CDN + Dexie/IndexedDB · Vercel

## Run local
```bash
npx serve .
# ou : python3 -m http.server 8080
```
Ouvrir `http://localhost:8080` (pas file:// — Babel CDN a besoin d'un serveur).

## Deploy
```bash
vercel        # preview
vercel --prod # production
```

## Stack
- React 18 + Babel standalone (CDN, zéro build)
- Dexie.js 3 — IndexedDB wrapper
- PWA : manifest + service worker offline-first

## Architecture
```
index.html            shell + CDN loads
styles.css            design system (tokens + composants)
db.js                 Dexie schema + helpers
app.jsx               root App + tab nav (Maintenant ↔ Capture)
screens/
  Maintenant.jsx      rail, intention, tâches, routines, mini-tracker
  Capture.jsx         composer 1-tap + inbox persistée
manifest.webmanifest  PWA
sw.js                 service worker offline
```
