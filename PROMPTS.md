# PROMPTS.md - Exemple

## Équipe et parcours

- **Équipe** : 07 - Membres : Omar Khudhair, Christian Junior Djomga
- **Parcours déclaré** : avec IA
- **Outils utilisés ce trimestre** : Gemini Pro

---

## Entrée 1 - Ajout des boutons pour voir la carte, des limites de page et des données de réseau

**Auteure** : Christian Junior Djomga - 2026-06-03 - commit `8c6ae234a4b3afb8d4053c39fdadfb1039a5c859` et `82f20d3d19d6c6e2f6ee6250609e7c7f6740e819`

**Prompt** (Claude Sonnet 4.6) :

> aide moi à faire ces parties:T2.4: Pour chaque élément, ajouter un bouton « Voir sur la carte » ouvrant sa position dans Google Maps ou OpenStreetMap à partir des coordonnées. T2.5: Limiter l'affichage des points d'intérêt à 20 par page (pagination ou défilement). T2.6: À partir de reseau_cyclable.geojson, calculer et afficher le nombre total de pistes et leur longueur cumulée (km) sur la page « Réseau cyclable ». 



**Sortie** : Les pages POI.jsx, Statistiques.jsx, Réseau.jsx et APP.jsx avec les fonctionnalités demandées inplémentées.

**Modifications apportées** :
- **Rejet quasi total**: Réécriture complète des fonctionnalités à cause du manque de lisibilé et clarté du code.

**Justification du jugement critique** :
- **Rejeté** : Bien que la structure générale des pages respectait les attentes, le code était beaucoup trop long et difficile à comprendre.
- **Leçon** : préciser dan sle prompt son propre niveau de compétence et ajouter des précision quant à la qualité du code attendu

---

## Entrée 2 - Filtre par arrondissement (T3.3)

**Auteur** : Christian Junior Djomga - 2026-06-03 - commit `42ba90f9898c8017192a4a5638f0e10da759f4e5`

**Prompt** (Gemini Pro) :

>Aide moi à implémenter les fonctionnalités suivantes. Je veux que tu ajoutes le nécessaire pour la réalisation des fonctionnalités sans supprimer ce qui est déjà présent si possible. Le nouveau code produit doit être le plus simple et court possible, mets y juste le strict nécessaire pour le fonctionnement des fonctionnalités en commentant le plus possible. Voici les fonctionnalités : Pour chaque élément, ajouter un bouton « Voir sur la carte » ouvrant sa position dans Google Maps ou OpenStreetMap à partir des coordonnées. Limiter l'affichage des points d'intérêt à 20 par page. À partir de reseau_cyclable.geojson, calculer et afficher le nombre total de pistes et leur longueur cumulée (km) sur la page « Réseau cyclable ».

**Sortie** : Une version simplifiée de l'implémentation des pages POI.jsx, Statistiques.jsx et Réseau.jsx.

**Modifications apportées** :
- suppression des fonctions haversineKm et lineLength et modification de la méthode de calcul de totalkm
- Ajout de commentaires.

**Justification du jugement critique** :
- **Accepté** : Le fait qu'on utilise `usememo` facilite beaucoup le calcul de longueur.
-**Modifié**: Les méthodes utilisées pour le calcul de totalkm sont inutiles et encombre le code.
- **Leçon** : Donner à l'AI tous les fichiers concernant la tache demandée pour éviter qu'il fasse de mauvaise estimation.

---

## Hallucinations rencontrées 

*À compléter si rencontré.*

---

## Réflexion globale sur l'évolution de nos prompts

*Cette réflexion est attendue dans la section R4 du rapport, pas ici, mais vous pouvez ajouter quelques notes.*


