# Journal de démarche - MTL Vélo (Phase 1)

---

## Équipe et parcours

- **Équipe** : Omar Khudhair, Christian Junior Djomga
- **Parcours déclaré** : **avec IA**
- **Date de déclaration** : 14 mai 2026
- **Justification du choix** : On a choisi d'utiliser l'IA pour aller plus vite sur la création de l'interface et pouvoir se concentrer sur la logique du projet. Ça nous permet de pratiquer comment bien utiliser l'IA (faire les bons prompts, vérifier le code) tout en préparant un code propre pour la suite.

---

## Décision 1 - Choix du framework front-end (T1)

**Auteur** : Omar Khudhair - 2026-05-14

**Problème** : Est-ce qu'on fait juste du HTML/JS de base ou on prend le temps de monter un vrai framework pour l'interface ?

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| JS de base (Vanilla) | Rien à installer. On commence tout de suite. | Gérer le code à la main va devenir trop compliqué et long pour les phases 2 et 3. |
| React via CDN | Facile à ajouter sans rien installer. | Plus dur pour bien séparer nos fichiers, gérer les pages et les données globales. |
| React + Vite | Code propre et réutilisable, système de pages facile (React Router), bon environnement de travail. Parfait pour la suite du projet. | Demande de faire des commandes d'installation au début (Node.js/npm) et de bien organiser ses dossiers. |

**Choix retenu** : **React avec Vite**, et Tailwind CSS v4 pour le style.

**Justification** : Même si on aurait pu faire la Phase 1 avec du JS de base, c'est mieux de penser à tout le projet. Pour la Phase 2, on va devoir connecter un backend (Express) et des cartes interactives. Pour la Phase 3, des trucs plus poussés comme la connexion et le bot. React et Vite nous aident à bien organiser tout ça dès le début. Ça prend un peu plus de temps à configurer, mais l'IA nous aide à écrire le code de base très vite pour compenser.

---

## Décision 2 - Choix de la technologie CSS (T1)

**Auteur** : Christian Junior Djomga - 2026-05-16

**Problème** : Comment styler notre application ? Est-ce qu'on fait tout à la main en CSS pur, on utilise un truc tout fait comme Bootstrap, ou bien Tailwind ?

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| CSS pur | On contrôle absolument tout. Aucun outil à installer. | Très long à écrire. C'est dur de garder un style uniforme et de gérer le responsive sur plein de pages. |
| Bootstrap | Facile à utiliser, plein de composants déjà prêts (boutons, cartes). | Le site finit par ressembler à tous les autres sites Bootstrap. Difficile à modifier si on veut un design précis. |
| Tailwind CSS | Très rapide, on style directement dans nos fichiers React. Parfait pour le responsive. | Le code HTML peut devenir un peu chargé à lire avec toutes les classes. |

**Choix retenu** : **Tailwind CSS v4**.

**Justification** : On voulait aller vite sans pour autant être bloqués par un design imposé comme avec Bootstrap. Tailwind marche super bien avec React : au lieu de changer de fichier à chaque fois pour faire du CSS, on met les classes directement dans nos composants. C'est beaucoup plus naturel et rapide pour nous, surtout quand on génère des bouts de code avec l'IA.