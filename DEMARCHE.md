# Journal de démarche - MTL Vélo (Phase 1)

---

## Équipe et parcours

- **Équipe** : 17 - Membres : Omar Khudhair, Christian Junior Djomga
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

---

## Décision 3 - Choix du modèle AI (T1)

**Auteur** : Christian Junior Djomga - 2026-05-16

**Problème** :Vu qu'on a décidé de prendre le parcours avec AI, lequel serait le plus adéquat pour nous guider à la réalisation du projet et à une meilleure compréhension de celui-ci?

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| ChatGPT (Version gratuite) | C'est le modèle le plus populaire et il explique bien les erreurs de base. | Les requêtes sont limitées sur le meilleur modèle et il pert vide le plus si on lui donne beaucoup de fichiers. |
| GitHub Copilot | Peut être intégrer directement dans VS code et . | Il est moins bon pour expliquer les concepts de base et est payant. |
| Gemini Pro | Il possède une grande fenêtre de contexte et grace au fait qu'on est étudiant, on a un abonnement gratuit. | Nécessite de faire des copier-coller vu qu'il ne s'intègre pas avec vs code. |

**Choix retenu** : **Gemini Pro**.

**Justification** : C'était le choix le plus évident pour des raisons budgetaires et techniques. En tant qu'étudiants, on a accès gratuite à gemini Pro (le meilleure modèle de Gemini) et on avait aussi besoin d'une AI qui pouvait non seulement nous aider à terminer le projet actuel mais qui pourrait aussi nous accompagner pour le reste de la session. Gemini Pro avec sa grande fenêtre de contexte s'est avéré être le choix idéal.

---

## Décision 4 - Lecture des données CSV (T2)

**Auteur** : Omar Khudhair - 2026-05-22

**Problème** :Les données de la Ville de Montréal (compteurs, points d'intérêt, territoires) sont fournies en fichiers CSV. Comment les lire efficacement et proprement dans notre application React sans ralentir l'interface ?

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| Lire le fichier avec fetch et séparer avec .split(',') | Pas besoin d'installer de librairie externe. | C'est vraiment complexe à gérer et ça risque de créer des bugs. |
| Utiliser PapaParse | Gère parfaitement les virgules internes, les sauts de ligne et convertit automatiquement en objets JS. | Ajoute une nouvelle dépendance. |

**Choix retenu** : **PapaParse**.

**Justification** : C'est la solution la plus robuste. En créant un Custom Hook (useCSV), on a la possibilité de cacher la logique de PapaParse dans un seul fichier. Sur nos pages, on a juste besoin d'écrire const { data } = useCSV('/data/poi.csv'). Tout cela rend notre code plus simple à lire et à utiliser.

---

## Décision 5 - Intégration de la carte interactive (T1)

**Auteur** : Omar Khudhair - 2026-07-01

**Problème** : Comment afficher notre réseau cyclable (le fichier GeoJSON) sur une carte interactive sans trop alourdir notre application React ?

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| Google Maps API | Très connu, beaucoup de documentation en ligne. | C'est payant (clé d'API requise) et un peu lourd à charger. |
| Mapbox | Super fluide pour les grosses données géographiques. | Demande de créer un compte développeur, un peu complexe à configurer au début. |
| React-Leaflet | Gratuit, open-source, s'intègre super bien avec React et c'est en masse suffisant pour afficher notre GeoJSON. | La mise à jour dynamique des données peut bugger si on gère mal le state React. |

**Choix retenu** : **React-Leaflet** avec les cartes de base d'OpenStreetMap.

**Justification** : Pour un projet d'école, utiliser un outil gratuit et open-source fait amplement le travail. React-Leaflet est assez léger et ça fittait super bien avec notre structure de composants. On a juste eu un petit problème quand on essayait de filtrer les pistes : la carte ne se mettait pas à jour. On a dû ajouter une `key` dynamique pour forcer le composant à se recharger. À part ça, c'était de loin l'option la plus rapide à monter avec l'aide de l'IA.

---

## Décision 6 - Choix de la technologie Backend (T4)

**Auteur** : Omar Khudhair - 2026-07-01 - commit `702bda8`

**Problème** : Pour la tâche T4, il fallait choisir comment coder l'application dorsale (le serveur et l'API).

| Option | Avantages | Inconvénients |
|---|---|---|
| Python (Flask) | On a déjà le script Python fourni pour la BD, donc c'est familier. | Moins naturel à mixer avec notre code React, ça force à gérer deux langages différents. |
| Node.js natif | Zéro dépendance externe à installer. | Trop long à coder, on doit tout faire à la main (le routage, lire le JSON, etc.). |
| Node.js + Express | C'est le standard de l'industrie, le code est super court et propre. | Ajoute une dépendance (Express) dans le projet. |

**Choix retenu** : **Node.js avec Express**.

**Justification** : C'était la recommandation du prof et honnêtement ça fait beaucoup de sens puisqu'on utilise déjà Node.js pour faire tourner React. Avec Express, on a pu coder nos routes d'API en quelques lignes. Pour la BD, on a juste ajouté `sqlite3` et ça s'est connecté tout seul. C'était l'option la plus logique et rapide.

---

## Décision 7 - Outil de test pour l'API (C4)

**Auteur** : Omar Khudhair - 2026-07-01 - commit `702bda8`

**Problème** : Le livrable demande 3 tests exécutables pour prouver que notre API marche bien. 

| Option | Avantages | Inconvénients |
|---|---|---|
| Script bash (cURL) | S'exécute directement dans le terminal, pas besoin d'installer de logiciels. | Difficile à lire, syntaxe parfois capricieuse sous Windows (PowerShell). |
| Postman (Collection JSON) | Très visuel, facile à tester, on peut rajouter des scripts pour valider les codes d'erreur automatiquement. | Le correcteur doit avoir Postman installé pour l'essayer. |

**Choix retenu** : **Postman (Collection JSON)**.

**Justification** : C'est vraiment le meilleur outil pour tester une API. J'ai généré une collection (`MTL_Velo_API.postman_collection.json`) qui inclut 6 tests. En un clic, ça valide que nos routes renvoient bien un code 200 ou 400. C'est beaucoup plus lisible qu'un gros fichier bash rempli de requêtes cURL.

---

## Décision 8 - Choix de la librairie graphique (C4)

**Auteur** : Christian Junior Djomga - 2026-07-01 - commit `702bda8`

**Problème** : Pour le bouton « Passages » il fallait qu'on chosisse avec on devait faire le graphique.

| Option | Avantages | Inconvénients |
|---|---|---|
| Recharts  | Bonne intégration avec réact | Mnaque de documentation |
| Chart.js | très populaire et simple à utiliser | intégration un peu plus complexe avec réact(nécessité d'utiliser un objet) |

**Choix retenu** : **Chart.js**.

**Justification** : Vu qu'on ne maitrise pas trop le sujet, on voulait utiliser la librairie graphique la plus simple à utiliser et à faire fonctionner. Chart.js était donc le choix idéal

---

## Décision 7 - Affichage des points sur la carte en modale

**Auteur** : Christian Junior Djomga - 2026-07-01 - commit `702bda8`

**Problème** : Pour les bouton « Carte » il fallait décider la facon dont on devait présenter les points.

| Option | Avantages | Inconvénients |
|---|---|---|
| Marker  | Il a une image plus rapprocher d'une carte classique | À tendance à bugger |
| CircleMarker | Facilite le changement de la couleur ou la taille du point sélectionné et juste besoin de charger du svg.| Moins beau visuellement|

**Choix retenu** : **CircleMarker**.

**Justification** : On voulait choisir la solution la plus simple et si possible éviter les bugs classiques des icones par défaut. Avec CircleMarker, on a juste besoin de changer la couleur selon en fonction du point sélectionner ce qui est suffisant pour nous.

---

## Décision 8 - Architecture et intégration du Vélobot (T6)

**Auteur** : Omar Khudhair - 2026-07-25 - commit `8912121`

**Problème** : Pour la Tâche 6, on devait ajouter un chatbot (le Vélobot) pour répondre à des questions sur les pistes et les compteurs avec l'IA Gemini. Le gros défi c'était de s'assurer que l'IA donne les vrais chiffres de notre BD SQLite sans inventer de fausses données (critère T6.4). Il fallait aussi définir clairement ce que notre assistant peut comprendre (intentions), comment il doit répondre, et comment il gère les cas non reconnus (T7.3).

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| Demander à l'IA de générer du SQL | Super rapide à coder. | Très risqué. L'IA peut se tromper dans le code SQL, inventer des tables ou pire, effacer des données par erreur. |
| Utiliser les outils JSON (Function Calling) | L'IA ne touche pas à la BD. Elle nous donne juste les paramètres, et c'est notre serveur Node.js qui fait la vraie requête. | Ça prend plus de temps à coder parce qu'il faut définir les outils un par un et bien gérer la discussion avec l'IA. |

**Choix retenu** : L'approche avec les outils JSON (Function Calling) avec la librairie `@google/genai`.

**Justification de l'architecture** : C'est beaucoup plus sécuritaire et précis. En gros, j'ai donné 3 outils à l'IA pour ses requêtes. Quand on pose une question, l'IA choisit le bon outil, notre serveur exécute le vrai code SQL en arrière-plan et on renvoie le résultat brut (JSON) à l'IA pour qu'elle fasse sa phrase. Comme ça, c'est impossible qu'elle invente des chiffres. J'ai aussi mis tout ce code dans `src/utils/velobotService.js` pour garder mon `server.js` propre.

**Design de l'assistant (Intentions et Format) :**
- **Intentions reconnues (3 familles strictes)** :
  1. *Statistiques de passages* : Comprendre une demande de trafic sur une période de temps précise.
  2. *Infrastructures par arrondissement* : Trouver la longueur des pistes pour un arrondissement spécifique.
  3. *Comparaison* : Comparer le trafic de deux arrondissements sur une même période.
- **Format de réponse** : L'IA doit répondre en **texte brut uniquement**. Interdiction totale d'utiliser le formatage Markdown (pas de gras, pas d'italiques, pas de puces de liste) pour un rendu fluide dans notre interface.
- **Gestion des cas non reconnus** : Si un utilisateur pose une question hors-sujet (ex: "Quel temps fait-il ?"), l'IA n'invente rien. Elle refuse poliment et redirige l'utilisateur vers ses trois capacités principales.

**Exemples de questions-réponses testées :**

✅ **Traitée correctement (Intention reconnue - Statistiques)** :
- *Question* : "Peux-tu me donner le nombre total de passages de vélos enregistrés sur le réseau entre le 2022-07-01 et le 2022-07-31 ?"
- *Réponse* : "Entre le 1er juillet 2022 et le 31 juillet 2022, il y a eu un total de 11204464 passages de vélos enregistrés sur le réseau cyclable de Montréal."

❌ **Traitée incorrectement (Cas non reconnu)** :
- *Question* : "Quel est le meilleur magasin pour acheter un casque de vélo dans Rosemont ?"
- *Réponse* : "Je suis désolé, je n'ai pas accès aux informations sur les magasins de vélos. Je peux uniquement vous informer sur les statistiques de passages de compteurs ou sur la longueur des pistes cyclables des différents arrondissements."

---

## Décision 9 - Architecture globale de la Tâche 5 (Auth, Pagination et Pistes populaires)

**Auteur** : Omar Khudhair - 2026-07-26 - commit `...`

**Problème** : Pour la tâche 5, on devait tout attacher ensemble : l'authentification (T5.1/T5.2), la pagination (T5.3) et le calcul de popularité des pistes (T5.4). Le gros défi c'était de faire tout ça sans que l'application React devienne super lente ou compliquée à gérer.

**Alternatives envisagées** :

| Option | Avantages | Inconvénients |
|---|---|---|
| Tout faire côté Client (React) | Moins de code backend à écrire, on garde la logique où on est habitués. | Les performances seraient désastreuses (on téléchargerait toute la BD d'un coup) et l'authentification ne serait pas vraiment sécurisée. |
| Tout faire côté Serveur (SQL + JWT) | Sécurité maximale, l'app reste super rapide (on charge juste ce qu'on affiche), et le Frontend reste propre. | Demande de coder des requêtes SQL beaucoup plus avancées (`LIMIT`, `OFFSET`, calculs) et d'apprendre à gérer les tokens JWT. |

**Choix retenu** : **Faire tout le travail lourd dans le backend avec du SQL et utiliser des tokens JWT.**

**Justification** : 
Honnêtement, faire tout ça côté client aurait été un cauchemar pour les performances. 
1. **Auth** : On a décidé d'utiliser des jetons JWT pour l'authentification parce que ça fitte super bien avec le `AuthContext` de React (pas besoin de gérer des sessions compliquées sur le serveur). 
2. **Pagination** : On a utilisé `LIMIT` et `OFFSET` en SQLite. Au lieu d'envoyer 5000 éléments au navigateur, on en envoie juste 20, c'est super fluide.
3. **Pistes populaires** : C'est l'API qui fait le calcul lourd (`SUM/COUNT`) selon l'année, et React a juste à changer la couleur sur la carte. 
L'IA nous a vraiment sauvé du temps pour écrire et structurer ces grosses requêtes SQL d'un seul coup.