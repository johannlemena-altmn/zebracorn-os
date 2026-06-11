# R0 · Mettre en place l'Intercept — guide pas-à-pas (niveau débutant)

*Phase R0 de la refonte (cf. `REVUE_REFONTE_v1.md`). Une soirée, zéro code. Ce guide
détaille TOUT, y compris le patron générique en fin de fichier : il servira de modèle
pour toutes tes automatisations futures.*

## Le principe en une phrase
Une automatisation iPhone = **un déclencheur** (il se passe X) + **une action** (alors
fais Y) + **un réglage** (sans me demander confirmation). C'est tout. Tout le reste est
de la variation.

## Étape 0 · Prérequis (5 min)
1. Ouvre **Safari** → va sur ton URL Zebracorn OS (Vercel) → bouton **Partager** (carré
   avec flèche, en bas) → fais défiler → **« Sur l'écran d'accueil »** → Ajouter.
   → Une icône « Z » apparaît : c'est la PWA installée. Ouvre-la une fois depuis
   l'icône (pas depuis Safari) pour vérifier qu'elle s'ouvre en plein écran.
2. Trouve l'app **Raccourcis** (pré-installée par Apple ; si tu l'as supprimée,
   re-télécharge-la sur l'App Store). Ouvre-la : trois onglets en bas :
   « Raccourcis », « Automatisation », « Galerie ». Tout se passe dans **Automatisation**.

## A · Intercept du réveil (le plus important, 5 min)
1. Raccourcis → onglet **Automatisation** → bouton **⊕** (ou « Nouvelle automatisation »).
2. Dans la liste des déclencheurs, choisis **« Alarme »**.
3. Coche **« Est arrêtée »** (pas « est répétée » : sinon ça se déclenche au snooze)
   et « N'importe laquelle ». En bas, sélectionne **« Exécuter immédiatement »**
   (c'est LE réglage qui évite la demande de confirmation). → Suivant.
4. Choisis l'action : tape « ouvrir » dans la recherche → **« Ouvrir l'app »** →
   tape « Zebracorn » → sélectionne la PWA. (Si elle n'apparaît pas dans la liste :
   prends l'action **« Ouvrir les URL »** à la place, et colle ton URL Vercel.)
5. OK. Test : règle une alarme dans 2 minutes, arrête-la → l'app doit s'ouvrir seule.

## B · Question-rail avant les réseaux (10 min, à répéter par app)
⚠️ **Piège testé le 11 juin** : l'action « Ouvrir l'app » crée une **boucle infinie**
(revenir vers Instagram re-déclenche l'automatisation, qui rouvre Zebracorn, etc.).
La bonne action est un **menu** : l'automatisation se termine quand tu choisis, donc
revenir à Insta après avoir choisi « continuer » ne boucle pas (le menu réapparaîtra
seulement à la PROCHAINE ouverture, ce qui est le but).

1. Automatisation → ⊕ → déclencheur **« App »** → **« Est ouverte »** → coche
   **Instagram** (une automatisation par app : refaire pour YouTube, TikTok…).
   **« Exécuter immédiatement »** → Suivant.
2. Action : cherche **« Choisir dans le menu »**. Invite : tape ta question-rail
   (ex. « Tu cherches quoi, là ? »). Deux options :
   - **« 30 s d'intention »** → glisse SOUS cette option l'action **« Ouvrir l'app »**
     → Zebracorn OS.
   - **« Continuer »** → ne mets RIEN sous cette option (l'automatisation se termine,
     Instagram reste ouvert).
3. OK. Test : ouvre Instagram → le menu apparaît → « Continuer » te laisse sur Insta
   sans boucle ; « 30 s d'intention » t'emmène au rail.

*Variante encore plus douce si le menu t'agace : action « Afficher la notification »
avec la question-rail en texte (aucune interruption, juste le rappel). Commence par le
menu ; passe à la notification si tu « continues » plus de 8 fois sur 10.*

## C · Vérifier la capture depuis partout (2 min)
Depuis Safari ou YouTube : bouton Partager → cherche **« Zebracorn OS »** dans la liste
→ partage un lien → il doit apparaître dans l'inbox Flux. S'il n'est pas dans la liste :
supprime la PWA de l'écran d'accueil et refais l'étape 0.1 (le manifest a changé).

## Definition of Done de R0
- [ ] Demain matin, arrêter l'alarme ouvre Zebracorn OS.
- [ ] Ouvrir Instagram déclenche le détour par le rail.
- [ ] Partager un lien depuis Safari crée une capture.
- [ ] À J+3 : au moins 2 intentions posées et 3 captures. Sinon on en reparle :
  signal produit, pas une faute.

## 📐 Le patron générique (à retenir pour toute automatisation future)
| Brique | Question à se poser | Exemples |
|---|---|---|
| **Déclencheur** | « Quand quoi ? » | alarme arrêtée · app ouverte · heure du jour · arrivée à un lieu · branchement chargeur · NFC |
| **Action** | « Alors quoi ? » | ouvrir app/URL · lancer un raccourci · envoyer un message · régler un mode Focus |
| **Confirmation** | « Sans me demander ? » | « Exécuter immédiatement » = OUI (sinon iOS demande à chaque fois et tu désactiveras) |
| **Test** | « Comment je vérifie dans les 2 min ? » | déclenche le trigger artificiellement tout de suite |

Idées futures avec le même patron : chargeur branché le soir → ouvrir le tracker
lecture ; arrivée à la salle → ouvrir Reprise-Sport ; tag NFC sur le carnet →
ouvrir la capture Croquis ; 22 h 30 → activer Focus Sommeil + rappel journal.
