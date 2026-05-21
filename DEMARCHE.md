# DEMARCHE.md - Exemple

> Le journal de démarche est requis pour **les deux parcours**. Le parcours avec IA y déclare son choix et y consigne les décisions techniques qui ne passent pas par l'IA ; le parcours sans IA y consigne l'ensemble des décisions techniques significatives. Cet exemple illustre principalement le parcours sans IA.

---

## Équipe et parcours

- **Équipe** : 14 - Membres : D. Bouchard, E. Côté, F. Ouellet
- **Parcours déclaré** : **sans IA**
- **Date de déclaration** : 2026-02-03
- **Justification du choix** : nous trois venons d'apprendre HTML / CSS au cours précédent (LOG210) et nous voulons consolider les fondamentaux plutôt que déléguer immédiatement à un outil. Nous garderons la possibilité de réviser ce choix au début de la phase 2 si la complexité augmente, en le documentant ici.

---

## Décision 1 - Choix du cadriciel front-end (T1)

**Auteure** : D. Bouchard - 2026-02-04 - commit `e7a1b3c`

**Problème** : faut-il utiliser un cadriciel (React, Vue, Alpine, htmx) ou rester en JavaScript vanille ?

**Sources consultées** :
- MDN, *Tools and testing - Client-side JavaScript frameworks* - vue d'ensemble des cadriciels modernes.
- Article du blog `2ality.com` (Axel Rauschmayer), *Using web components in 2024*.
- Documentation officielle de Vue.js (section *Getting started*, partie *Without build tools*).

**Alternatives envisagées** :

| Option | Avantages | Inconvénients pour notre contexte |
|---|---|---|
| Vanille (zéro dépendance) | Aucun outil à apprendre. Code livré = code écrit. Aligne avec l'objectif « consolider les fondamentaux » de notre parcours. | Plus de code à écrire pour la réactivité (mise à jour du DOM à la main). |
| Vue.js sans étape de compilation (CDN) | Réactivité automatique, lisibilité accrue des templates. | Une dépendance externe à comprendre. Risque de masquer ce que nous voulons apprendre. |
| React | Très utilisé en industrie. | Demande JSX + une étape de compilation que nous n'avons pas le temps de mettre en place. Dépendances nombreuses. |

**Choix retenu** : **JavaScript vanille**, avec une petite couche de fonctions utilitaires (`render.js`) pour standardiser la mise à jour du DOM.

**Justification** : aligné avec notre décision de parcours. La phase 1 ne demande pas de réactivité complexe - le tableau et les filtres se mettent à jour sur clic ou input, sans état partagé global. Vanille suffit largement.

---

## Obstacle 1 - Filtres qui ne se mettaient pas à jour ensemble (T3)

**Auteur** : F. Ouellet - 2026-02-11 - commits `c1d4e2a` (problème), `b7f8c93` (correction)

**Problème rencontré** : le tri par colonne et la recherche textuelle fonctionnaient indépendamment, mais une fois la recherche active, cliquer pour trier réinitialisait le filtre. L'utilisateur perdait son contexte.

**Diagnostic** :
1. J'ai d'abord pensé que c'était un problème d'événements (le clic sur l'en-tête déclencherait un `input` sur la zone de recherche). Mise d'un `console.log` dans chaque handler - pas le cas.
2. Lu attentivement la fonction `trierParColonne` : elle réécrivait `tbody` à partir de `compteurs` (le tableau complet), pas à partir des résultats filtrés.

**Sources consultées** :
- MDN, *Array.prototype.filter* et *Array.prototype.sort* - pour confirmer que `sort` mute le tableau d'origine (donc trier `compteurs` aurait été un bug différent).

**Solutions envisagées** :
- Maintenir un tableau `compteursAffichés` séparé, recalculé chaque fois qu'un filtre change. Tri et recherche puisent dans ce tableau. **Choix retenu.**
- Variante : recalculer `filtre puis tri` à chaque action utilisateur, sans tableau intermédiaire. Plus simple mais recalcule deux fois - pour 64 compteurs c'est imperceptible, mais c'est une mauvaise habitude à prendre.

**Justification** : un tableau intermédiaire `compteursAffichés` rend l'ordre des opérations explicite (filtrer d'abord, trier ensuite) et facilite l'ajout de filtres supplémentaires en phase 2.

**Leçon** : avant de se lancer dans les `console.log`, relire la fonction soupçonnée. La source du bug était évidente dans la fonction `trierParColonne` elle-même.

---

## Décision 3 - Structure des fichiers JS (C1)

*(Cette entrée serait écrite plus tard dans la phase. Laissée en stub pour montrer la progression.)*

**Auteure** : D. Bouchard - 2026-02-17 - commit `e3a8f12`

**Problème** : à mesure que `main.js` grossit (au-delà de 250 lignes), nous voulons le diviser. Comment ?

*[À compléter : alternatives envisagées (par responsabilité, par page, par couche), choix retenu, justification.]*

---

## Réflexion sur la démarche (à étoffer au fil du projet)

*Quelques notes en vrac, à reprendre dans la section R4 du rapport :*

- La discipline de chercher avant de coder est inhabituelle pour nous - la tentation de « juste essayer » est forte. Mais la décision sur le cadriciel nous a évité plusieurs heures d'apprentissage de Vue qui n'aurait pas servi le projet.
- Vérifier les contrastes à la conception, pas après - refaire toute la palette en cours de phase aurait été coûteux.
- Documenter le bug du tri (Obstacle 1) prend cinq minutes ; le retrouver dans six mois prendrait des heures. Vrai gain.
