# PROMPTS.md - Exemple

## Équipe et parcours

- **Équipe** : 17 - Membres : Omar Khudhair, Christian Junior Djomga
- **Parcours déclaré** : avec IA
- **Outils utilisés ce trimestre** : Gemini Pro, Claude Sonnet 4.6

---

## Entrée 1 - Ajout des boutons pour voir la carte, des limites de page et des données de réseau

**Auteur** : Christian Junior Djomga - 2026-06-03 - commit `8c6ae234a4b3afb8d4053c39fdadfb1039a5c859` et `82f20d3d19d6c6e2f6ee6250609e7c7f6740e819`

**Prompt** (Claude Sonnet 4.6) :

> aide moi à faire ces parties:T2.4: Pour chaque élément, ajouter un bouton « Voir sur la carte » ouvrant sa position dans Google Maps ou OpenStreetMap à partir des coordonnées. T2.5: Limiter l'affichage des points d'intérêt à 20 par page (pagination ou défilement). T2.6: À partir de reseau_cyclable.geojson, calculer et afficher le nombre total de pistes et leur longueur cumulée (km) sur la page « Réseau cyclable ». 

**Sortie** : Les pages POI.jsx, Statistiques.jsx, Réseau.jsx et APP.jsx avec les fonctionnalités demandées implémentées.

**Modifications apportées** :
- **Rejet quasi total**: Réécriture complète des fonctionnalités à cause du manque de lisibilité et clarté du code.

**Justification du jugement critique** :
- **Rejeté** : Bien que la structure générale des pages respectait les attentes, le code était beaucoup trop long et difficile à comprendre.
- **Leçon** : préciser dans le prompt son propre niveau de compétence et ajouter des précisions quant à la qualité du code attendu.

---

## Entrée 2 - Filtre par arrondissement (T3.3)

**Auteur** : Christian Junior Djomga - 2026-06-03 - commit `42ba90f9898c8017192a4a5638f0e10da759f4e5`

**Prompt** (Gemini Pro) :

> Aide moi à implémenter les fonctionnalités suivantes. Je veux que tu ajoutes le nécessaire pour la réalisation des fonctionnalités sans supprimer ce qui est déjà présent si possible. Le nouveau code produit doit être le plus simple et court possible, mets y juste le strict nécessaire pour le fonctionnement des fonctionnalités en commentant le plus possible. Voici les fonctionnalités : Pour chaque élément, ajouter un bouton « Voir sur la carte » ouvrant sa position dans Google Maps ou OpenStreetMap à partir des coordonnées. Limiter l'affichage des points d'intérêt à 20 par page. À partir de reseau_cyclable.geojson, calculer et afficher le nombre total de pistes et leur longueur cumulée (km) sur la page « Réseau cyclable ».

**Sortie** : Une version simplifiée de l'implémentation des pages POI.jsx, Statistiques.jsx et Réseau.jsx.

**Modifications apportées** :
- Suppression des fonctions haversineKm et lineLength et modification de la méthode de calcul de totalkm.
- Ajout de commentaires.

**Justification du jugement critique** :
- **Accepté** : Le fait qu'on utilise `useMemo` facilite beaucoup le calcul de longueur.
- **Modifié**: Les méthodes utilisées pour le calcul de totalkm sont inutiles et encombrent le code.
- **Leçon** : Donner à l'IA tous les fichiers concernant la tâche demandée pour éviter qu'elle fasse de mauvaises estimations.

---

## Entrée 3 - Thème de couleurs et accessibilité (T1.3)

**Auteur** : Omar Khudhair - 2026-06-04 - commit `7ba70b7`

**Prompt** (Gemini Pro) :

> Aide-moi à faire un thème de couleurs avec Tailwind pour mon app React. J'ai besoin de 3 couleurs (primaire, secondaire, fond) qui respectent la norme WCAG 2.1 AA (contraste de 4.5:1). Comment j'intègre ça partout dans mes composants (navbar, boutons, etc.) ?

**Sortie** : Gemini a donné le code pour définir les variables CSS dans `index.css` et a montré comment utiliser les nouvelles classes Tailwind (comme `bg-mtl-primaire`). Il a fourni les codes hex et des exemples de code.

**Modifications apportées** :
- J'ai vérifié manuellement les couleurs sur le site WebAIM Contrast Checker.
- J'ai dû modifier un peu une des couleurs parce que le contraste avec le fond blanc n'atteignait pas exactement le vrai ratio de 4.5:1.
- J'ai ajouté ces nouvelles classes (`text-mtl-primaire`, `bg-mtl-survol`) dans toutes les pages pour que le design soit pareil partout.

**Justification du jugement critique** :
- **Accepté** : Le code des themes de couleurs custom avec Tailwind est super propre, ça évite de créer plein de fichiers CSS.
- **Modifié** : L'IA n'est vraiment pas bonne pour calculer les vrais ratios de contraste avec des chiffres. Il ne fallait pas lui faire confiance à l'aveugle.
- **Leçon** : Pour des critères stricts (comme l'accessibilité), l'IA donne une bonne base pour commencer, mais il faut absolument tout revérifier soi-même avec des vrais outils (comme WebAIM).

---

## Entrée 4 - Refactorisation avec Custom Hooks et composants modulaires (T2.1, T1.4)

**Auteur** : Omar Khudhair - 2026-06-01 - commit `903aa92`

**Prompt** (Gemini Pro) :

> solid et dry principle ya trop de repetition de code que tu peux rendre modulaire

**Sortie** : Gemini a compris que le premier code qu'il m'avait donné était trop répétitif. Il a proposé de séparer la logique dans des Custom Hooks (`useCSV.js` pour lire les données, `useSort.js` pour le tri) et de créer des composants réutilisables (`PageLayout.jsx` et `DataTable.jsx`) pour ne pas copier-coller le même HTML dans les pages `Statistiques` et `POI`.

**Modifications apportées** :
- J'ai structuré les dossiers proprement (`src/hooks/` et `src/components/`).
- J'ai fait attention à bien utiliser la bonne extension de fichier (`.js` pour la logique pure des hooks, et `.jsx` pour ce qui affiche du HTML).
- J'ai connecté ces nouveaux composants nettoyés dans mon `App.jsx` pour que le routage fonctionne bien.

**Justification du jugement critique** :
- **Accepté** : La nouvelle architecture proposée était super propre. Ça a complètement réglé le problème du code dupliqué et ça rend les pages beaucoup plus faciles à lire.
- **Modifié** : L'IA a fourni les blocs de code, mais j'ai dû m'assurer moi-même que la séparation entre fichiers `.js` et `.jsx` respectait les vrais standards de l'industrie pour React.
- **Leçon** : Un code généré par l'IA qui "marche" à l'écran n'est pas forcément un "bon" code en arrière-plan. C'est super important de la challenger sur des concepts d'architecture (comme le principe DRY ou SOLID) pour éviter de finir avec du code spaghetti.

---

## Entrée 5 - Filtre par arrondissement et algorithme GeoJSON (T2.3)

**Auteur** : Omar Khudhair - 2026-06-03 - commit `baa21bf`

**Prompt** (Gemini Pro) :

> T2.3: Ajouter un filtre par arrondissement (menu déroulant, alimenté par territoires.csv) sur les pages « Statistiques » et « Points d'intérêt ».
> *(Puis, suite à une erreur de l'IA)* : non regarde ce que les donne csv ont [...] il n'y a pas la colonne arrondissement dans les compteurs. la recherche par arrondisement dans ma page de statistique ne fonctionne pas.

**Sortie** : Au début, Gemini m'a donné un code de filtre classique. Quand je lui ai prouvé que la colonne n'existait pas dans `compteurs.csv`, il a complètement changé d'approche. Il a proposé d'utiliser le fichier `territoires.geojson` et a généré un algorithme mathématique (Ray-Casting avec `isPointInPolygon`) pour déduire l'arrondissement de chaque compteur grâce à sa Latitude et sa Longitude.

**Modifications apportées** :
- J'ai modifié le hook `useCSV.js` pour qu'il accepte des paramètres supplémentaires (comme `header: false`), car le fichier `territoires.csv` n'avait pas d'en-tête.
- J'ai intégré la logique mathématique complexe dans `Statistiques.jsx` pour croiser les GPS avec les polygones.
- J'ai ajouté le menu déroulant (`<select>`) dans l'interface des deux pages pour que le filtre s'applique sur les données.

**Justification du jugement critique** :
- **Accepté** : La solution d'utiliser le `.geojson` pour calculer géographiquement la donnée manquante était brillante. Ça m'a permis de respecter la maquette exigée sans devoir modifier le fichier CSV original.
- **Modifié** : J'ai dû rattraper l'IA qui codait un peu "à l'aveugle". Elle avait inventé une colonne "Arrondissement" dans ma table de compteurs alors que je ne lui avais pas confirmé sa présence.
- **Leçon** : L'IA assume souvent que les données sont parfaites ou qu'elles ont une structure standard. Il faut toujours lui fournir un échantillon ou la liste exacte des colonnes de nos fichiers pour qu'elle donne une solution qui marche du premier coup.

---

## Entrée 6 - Menu de navigation mobile (Hamburger) (T1.2, T1.4)

**Auteur** : Omar Khudhair - 2026-06-03 - commit `5d60b5e`

**Prompt** (Gemini Pro) :

> Lorsque l’affichage passe en mode mobile, affiche une icône de menu (trois lignes) à droite de la barre de navigation. Au clic sur cette icône, les liens vers les différentes pages doivent apparaître dans un menu déroulant. Après la sélection d’une page, le menu doit se refermer automatiquement. Ce comportement doit être appliqué uniquement en mode mobile.

**Sortie** : L'IA a mis à jour le code de mon composant `Navbar.jsx`. Elle a ajouté le hook `useState` pour contrôler si le menu est ouvert ou fermé, des icônes SVG pour faire les trois lignes (hamburger), et des classes Tailwind (comme `md:hidden`) pour gérer l'affichage mobile versus PC.

**Modifications apportées** :
- J'ai fusionné son code avec ma barre de navigation existante.
- J'ai fait une passe pour m'assurer que les liens utilisaient bien mes couleurs personnalisées (`bg-mtl-primaire`, etc.) dans les fonctions `getLinkClass` et `getMobileLinkClass`.
- J'ai dû poser des questions supplémentaires à l'IA sur le fonctionnement de Tailwind car tout le style était mélangé dans les balises HTML et je n'étais pas familier avec cette approche.

**Justification du jugement critique** :
- **Accepté** : La logique pour fermer le menu automatiquement quand on clique sur un lien en appelant `onClick={closeMenu}` marchait numéro un. L'utilisation de Tailwind pour cacher/afficher des éléments selon la taille de l'écran était super efficace pour régler l'exigence T1.4.
- **Modifié** : J'ai refusé d'utiliser le code sans piger comment le "responsive" fonctionnait. J'ai donc forcé l'IA à m'expliquer ses choix de syntaxe pour m'assurer que je pouvais modifier l'interface moi-même par la suite.
- **Leçon** : C'est facile de se laisser impressionner par un beau menu généré par l'IA, mais si elle utilise une technologie ou un cadriciel qu'on ne maîtrise pas à 100% (comme Tailwind CSS), c'est indispensable de lui demander de vulgariser le code généré.

---

## Entrée 7 - Refactorisation globale et standards de commentaires

**Auteur** : Omar Khudhair - 2026-06-04 - commit `f8b5c23`

**Prompt** (Gemini Pro) :

> Refais la page au complet. Je veux que tu changes le code pour qu'il soit lisible et facile à comprendre lorsqu'on le survole. Enlève tout le code de Tailwind CSS qui ne sert à rien. Ajoute des commentaires minimalistes par cas.

**Sortie** : L'IA a fourni la version refactorisée de tous les composants (`POI.jsx`, `Statistiques.jsx`, `DataTable.jsx`, `PageLayout.jsx`, `Navbar.jsx` et les hooks). Le code était beaucoup plus court, les variables mieux nommées, et les commentaires respectaient les exigences liées aux tâches du TP (ex: T1.4, T2.1).

**Modifications apportées** :
- J'ai dû forcer l'IA à me redonner le code complet de chaque fichier, car elle avait la mauvaise habitude de ne générer que des petits morceaux de code difficiles à intégrer.
- J'ai réajusté le style visuel avec l'IA. Son premier "nettoyage" de Tailwind avait rendu l'interface trop carrée et fade. J'ai exigé de ramener des bords arrondis (`rounded-lg`, `rounded-full`) et des ombres pour garder un aspect moderne.
- J'ai ajouté une condition logique dans `PageLayout.jsx` pour faire disparaître le panneau latéral si aucun filtre n'est passé en paramètre.

**Justification du jugement critique** :
- **Accepté** : La base de refactorisation était solide. Les commentaires ajoutés expliquent très bien le rôle des paramètres dans les hooks et les composants réutilisables, ce qui rend le projet professionnel.
- **Modifié** : J'ai refusé de sacrifier l'expérience utilisateur (UI) au profit d'un code "minimaliste". J'ai donc exigé un compromis pour avoir un beau design tout en gardant un code épuré.
- **Leçon** : Quand on demande à une IA de "nettoyer", elle peut parfois supprimer des éléments de design essentiels. Il faut être ultra précis et directif (ex: "donne-moi le fichier entier", "ne fais pas de listes numérotées") pour obtenir exactement le résultat voulu sans perdre de temps.

## Entrée 8 - Correctifs finaux de la Phase 1 (Pages manquantes, Thème, Erreurs réseau)

**Auteur** : Omar Khudhair - 2026-06-30 - commit `7b76ace`

**Prompt** (Gemini Pro) :

> Implémente les pages manquantes ("Accueil" et "À propos") en te basant sur la grille de correction et les maquettes fournies dans l'annexe de la phase 1. Assure-toi également de corriger toutes les autres lacunes soulevées par le correcteur.
>
> De plus, j'ai remarqué l'utilisation de couleurs génériques de Tailwind (comme bg-slate-800). Utilise strictement les 3 variables de couleurs personnalisées définies dans le fichier index.css pour l'ensemble du projet.

**Sortie** : L'IA a créé les pages manquantes (`Accueil.jsx`, `APropos.jsx`) conformes aux maquettes, ajouté la gestion des erreurs réseau manquantes sur les hooks, et remplacé toutes les couleurs génériques de Tailwind par les variables CSS de notre thème dans l'ensemble des fichiers.

**Modifications apportées** :
- Intégration directe des correctifs dans `App.jsx`, `Statistiques.jsx`, `POI.jsx`, et `Reseau.jsx`.
- Vérification que l'assistant n'a pas inclus de mention des fonctionnalités de la Phase 2 et 3 dans la page "À propos" prématurément.

**Justification du jugement critique** :
- **Accepté** : Le gain de temps pour repasser sur l'ensemble de l'interface et uniformiser les couleurs selon les tokens stricts du fichier CSS était immense. L'IA a très bien compris comment jouer avec les opacités (ex: `text-mtl-texte/70`).
- **Modifié** : L'IA avait inclus une section sur le backend et des membres fictifs dans la page "À propos". Il a fallu exiger qu'elle utilise nos vrais noms et se limite aux technologies de la Phase 1.
- **Leçon** : Même lors d'une simple passe de correction de bogues, l'IA peut déborder et anticiper des fonctionnalités futures si on ne restreint pas explicitement son champ d'action au contexte actuel.

## Entrée 9 - Implémentation de la carte interactive (T1)

**Auteur** : Omar Khudhair - 2026-07-01 - commit `f1257ea`

**Prompt** (Claude Sonnet 4.6) :

> Aide-moi à implémenter la carte interactive pour la tâche T1 de mon projet React. Je veux utiliser React-Leaflet avec OpenStreetMap. Il faut que tu crées les filtres pour les types de pistes cyclables et un filtre 4 saisons qui mettent la carte à jour en temps réel. Assure-toi de respecter le principe SOLID : sépare bien la logique de calcul des couleurs dans un fichier à part et utilise un custom hook pour les filtres. N'oublie pas d'ajouter une légende.

**Sortie** : L'IA a généré tous les composants nécessaires (`MapNetwork.jsx`, `NetworkFilters.jsx`, `MapLegendModal.jsx`) ainsi que le hook `useMapFilters.js` pour gérer l'état.

**Modifications apportées** :
- J'ai dû corriger un bug silencieux d'affichage. L'IA n'avait pas réalisé que `react-leaflet` ne met pas à jour la couche GeoJSON automatiquement quand l'état change. J'ai ajouté un attribut `key` dynamique lié aux filtres pour forcer la mise à jour visuelle.

**Justification du jugement critique** :
- **Accepté** : Le code était super propre et bien découpé en plusieurs petits composants. La séparation de la logique des couleurs dans un fichier à part respecte bien les bonnes pratiques.
- **Modifié** : L'interface ne réagissait pas aux clics sur les filtres à cause d'une subtilité de la librairie Leaflet que l'IA avait oubliée.
- **Leçon** : L'IA peut écrire un code React qui a l'air parfait théoriquement, mais elle oublie souvent les petits bugs ou comportements bizarres des librairies externes. C'est pour ça qu'il faut toujours tester l'interface soi-même.

---

## Entrée 10 - Audit global et correctifs WCAG (Livrable 2)

**Auteur** : Omar Khudhair - 2026-07-01 - commit `87fab3c`

**Prompt** (Claude Sonnet 4.6) :

> Faisons un audit global de tout le projet actuel. Réévalue tout le code de façon très critique et objective, agis comme un correcteur sévère qui cherche la moindre faille. Assure-toi que l'application respecte à 100% tous les critères de correction du livrable 2, et mets une attention particulière sur les exigences d'accessibilité (WCAG). Propose-moi les correctifs nécessaires.

**Sortie** : Un plan d'implémentation très détaillé listant 5 erreurs d'accessibilité à corriger dans plusieurs fichiers (manque de balises h1, problème de focus dans la légende, attributs aria manquants).

**Modifications apportées** :
- J'ai approuvé le plan et appliqué les correctifs suggérés partout dans le code (ex: changer le h2 en h1 dans `PageLayout.jsx`, ajouter `aria-hidden` sur les emojis, et sécuriser les liens `window.open`).

**Justification du jugement critique** :
- **Accepté** : L'IA a trouvé des petits détails sémantiques que j'avais complètement oublié de vérifier (comme les titres de page pour les lecteurs d'écran). 
- **Leçon** : Demander à l'IA de prendre le rôle d'un correcteur ultra sévère est une super bonne stratégie pour trouver les petites erreurs d'accessibilité qu'on laisse souvent passer quand on se concentre juste sur le visuel.

---

## Entrée 11 - Génération des tests d'API avec Postman (T5.A.4)

**Auteur** : Omar Khudhair - 2026-07-01 - commit `702bda8`

**Prompt** (Claude Sonnet 4.6) :

> Je veux d'abord tester la tâche 4, il y avait des consignes supplémentaires sur les curl et des tests à faire. Donne-moi le plan puis génère une collection Postman avec plusieurs tests valides et invalides pour notre API.

**Sortie** : L'IA a généré un fichier `MTL_Velo_API.postman_collection.json` contenant 6 requêtes, avec des petits scripts intégrés pour valider automatiquement les statuts HTTP (200, 400).

**Modifications apportées** :
- J'ai pris le fichier tel quel. J'ai juste importé la collection dans mon propre Postman pour vérifier que les tests passaient bien tous au vert (surtout les tests de sécurité avec les mauvaises dates).

**Justification du jugement critique** :
- **Accepté** : Le fichier généré marchait du premier coup. L'IA a même pensé à ajouter des tests d'erreurs (400) pour vérifier qu'on bloquait bien les mauvaises requêtes sans faire crasher le serveur.
- **Leçon** : Demander à l'IA de générer directement un fichier Postman au format JSON est beaucoup plus efficace que de s'acharner à écrire des scripts cURL qui vont finir par planter sous Windows.

---

## Entrée 12 - Boutons carte et passages (T.2)

**Auteur** : Christian Junior Djomga - 2026-07-01 - commit `9c70349`

**Prompt** (Claude Sonnet 4.6) :

> aide moi à faire ceci en suivant les instructions de codage précédentes : Bouton « Carte » dans la vue « Statistiques » : ouvre une modale présentant tous les compteurs sur une carte, le compteur cliqué initialement est mis en évidence. Bouton « Passages » sur chaque ligne de compteur : ouvre une modale avec sélection de période et affiche un graphique du nombre de passages journaliers. Bouton « Carte » dans la vue « Points d'intérêt » : modale présentant les POI actuellement listés, avec mise en évidence du point cliqué. Prend le rôle d'un étudiant, code le plus simple possible, cas de base seulement, donne-moi juste le code à ajouter, je l'exécute moi-même.

**Sortie** : Le code nécessaire pour l'implémentation de chaque partie séparé en petits blocs pour le rendre plus lisible.

**Modifications apportées** :
- Aucune, le code fournit à été conservé comme il était.

**Justification du jugement critique** :
- **Accepté** : En précisant explicitement le type de code que je voulais, l'IA m'a donné un contenu qui répondait à mes attentes.
- **Leçon** : Contextualiser l'IA et préciser autant que possible la qualité du résultat attendu évite que celui ci ne donne du code imutilement complexe.

---

## Entrée 13 - Synchronisation carte-menu déroulant pour l'arrondissement (T.3)

**Auteur** : Christian Junior Djomga - 2026-07-01 - commit `2d889f7`

**Prompt** (Claude Sonnet 4.6) :

> aide moi à faire ceci en suivant les instructions de codage précédentes: Sur les vues « Réseau cyclable », « Statistiques » et « Points d'intérêt », l'utilisateur peut sélectionner un arrondissement de deux manières synchronisées: par clic sur le polygone correspondant sur une carte des territoires (alimentée par territoires.geojson) ou via le menu déroulant déjà en place depuis la phase 1. La sélection met le polygone en surbrillance et filtre effectivement les données affichées: pistes situées dans l'arrondissement, compteurs locaux, points d'intérêt locaux.

**Sortie** : L'IA m'a donné le code pour un composant `TerritoiresMap.jsx` pouvant être utilisé sur les 3 pages et l'ajout d'un filtre sur la page réseau cyclable en utilisant un algorithme qui était déja dans `Statistiques.jsx`.

**Modifications apportées** :
- Pas de modifications apportés, mais on a demandé à l'IA de justifier son implémentation avant de l'accepter.

**Justification du jugement critique** :
- **Accepté** : Contrairement à la phase 1 ou l'IA avait tendence à halluciné le contenu du jeu de donné à cause d'une mauvaise contextualisation, cette fois il a vraiment vérifier le contenu des données fournies avant de générer le code. Cela nous à permis d'obtenir une solution correcte du premier coup.
- **Leçon** : Il est toujours important de fournir à l'IA autant de données pertinantes que possible pour l'aider à fournir un meilleur résultat.

---

## Hallucinations rencontrées 

- **Tailwind CSS inventé et excessif** : L'IA a souvent tendance à "halluciner" du code de style. Elle ajoutait régulièrement des tonnes de classes Tailwind CSS (des ombres complexes, des marges inutiles, des couleurs non demandées) qui alourdissaient le code pour rien sans que je le demande.
- **Invention de données CSV inexistantes** : L'IA assume parfois que nos données sont parfaites. Lors du filtre par arrondissement, elle a généré du code en assumant qu'il y avait une colonne "Arrondissement" dans le fichier `compteurs.csv`, ce qui était totalement faux. Elle a inventé la structure de données au lieu de vérifier.

---

## Réflexion globale sur l'évolution de nos prompts

*Cette réflexion est attendue dans la section R4 du rapport, pas ici, mais vous pouvez ajouter quelques notes.*