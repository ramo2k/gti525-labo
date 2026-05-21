# PROMPTS.md - Exemple

## Équipe et parcours

- **Équipe** : 07 - Membres : A. Tremblay, B. Lavoie, C. Singh
- **Parcours déclaré** : avec IA
- **Outils utilisés ce trimestre** : Claude 4.6 Sonnet (web), GitHub Copilot dans VS Code

---

## Entrée 1 - Génération du tri par colonne (T3.1)

**Auteure** : A. Tremblay - 2026-02-10 - commit `a3f1b2c`

**Prompt** (Claude Sonnet 4.6) :

> J'ai un tableau HTML qui affiche des compteurs de vélo (id, nom, statut, année). Je veux que cliquer sur l'en-tête d'une colonne trie le tableau selon cette colonne, en alternant ascendant / descendant. Le tableau est rempli depuis un tableau JS `compteurs`. Je préfère du JS moderne sans dépendances. Pas de jQuery. Donne-moi le code de la fonction de tri et l'attache des événements.

**Sortie** : 42 lignes de JS - fonction `sortByColumn(key)` + boucle d'attache des `addEventListener` sur les `<th>`. Voir le commit pour la version brute (avant modifications).

**Modifications apportées** :
- Renommé `sortByColumn` en `trierParColonne` pour cohérence avec le reste du code en français.
- Ajouté un indicateur visuel (▲ / ▼) dans l'en-tête de la colonne triée - la sortie ne le faisait pas.
- Remplacé `arr.sort((a,b) => a[key] > b[key] ? 1 : -1)` par une comparaison stable qui gère les nombres et les chaînes différemment (la version générée triait `"10"` avant `"2"` pour la colonne année).

**Justification du jugement critique** :
- **Accepté** : la structure générale (état `sortAsc` partagé, attache des événements) - claire et idiomatique.
- **Modifié** : le tri sur les nombres était incorrect (comparaison lexicographique). C'est exactement le genre d'erreur silencieuse qu'on attend qu'un humain attrape. Sans l'indicateur visuel, l'utilisateur ne sait pas quelle colonne est triée - exigence T1.1 implicite.
- **Leçon** : préciser dans le prompt « les colonnes contiennent des nombres et des chaînes » aurait probablement évité l'erreur.

---

## Entrée 2 - Filtre par arrondissement (T3.3)

**Auteur** : B. Lavoie - 2026-02-12 - commit `f9c0d4e`

**Prompt** (Copilot, complétion inline) :

> // Filtrer la liste des points d'intérêt selon l'arrondissement sélectionné
> // dans le menu déroulant #filtre-arr. Mettre à jour le tableau et le compteur de résultats.

**Sortie** : Copilot a proposé une fonction `filtrerParArrondissement()` qui filtre `pointsInteret` et réécrit le tableau via `innerHTML += ...`.

**Modifications apportées** :
- **Rejet quasi total**. Réécrit la fonction de zéro en utilisant `tbody.replaceChildren(...)` au lieu de `innerHTML += ...`.

**Justification du jugement critique** :
- **Rejeté** : `innerHTML += ...` avec des données externes est un vecteur d'injection XSS (les noms d'arrondissements viennent d'un fichier qu'on contrôle ici, mais c'est une habitude à ne pas prendre, et T2.1 mentionne déjà que les données du POI peuvent contenir des caractères spéciaux). De plus, `+=` reparse l'intégralité du `tbody` à chaque appel - comportement quadratique sur les listes longues.
- **Leçon** : Copilot, sans contexte sur la sécurité, propose souvent le chemin le plus court. À surveiller pour toute manipulation du DOM avec des données externes.

---

## Hallucinations rencontrées 

*À compléter si rencontré.*

---

## Réflexion globale sur l'évolution de nos prompts

*Cette réflexion est attendue dans la section R4 du rapport, pas ici, mais vous pouvez ajouter quelques notes.*


