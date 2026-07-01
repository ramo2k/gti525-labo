# 🚴 MTL Vélo - Projet GTI525

Application web pour la gestion et la visualisation des données cyclables de Montréal (Phase 2).

---

## 🚀 Installation et démarrage

Assurez-vous d’avoir installé [Node.js](https://nodejs.org/) et [Python 3](https://www.python.org/) sur votre ordinateur.

### 1. Accéder au projet

Ouvrez un terminal et placez-vous dans le dossier principal du projet (`mtl-velo`) :

```bash
cd mtl-velo
```

### 2. Création de la base de données (Obligatoire)

Les données des compteurs sont trop grosses pour être mises sur GitHub. Il faut donc générer la base de données SQLite sur votre ordinateur avant de lancer le serveur.

Depuis le dossier `mtl-velo`, exécutez le script Python qui va lire les fichiers CSV et créer le fichier de base de données :

```bash
python public/data/import_sqlite.py
```
*(Le script va prendre quelques secondes pour insérer les données et créer le fichier `comptage_velo.db` dans le dossier `public/data/`)*

### 3. Installer les dépendances Node

Toujours dans le dossier `mtl-velo`, installez les paquets requis (Express, SQLite3, React, etc.) :

```bash
npm install
```

### 4. Compiler l'interface web (React)

Notre serveur Express (Backend) est configuré pour afficher la version "finale" de l'interface React. Il faut donc la compiler (la builder) dans un dossier `/dist` :

```bash
npm run build
```

### 5. Lancer le serveur web et l'API (Tâche T4)

Une fois la base de données créée et le front-end compilé, vous pouvez démarrer le serveur :

```bash
npm start
```

Le serveur Node.js va démarrer et écouter sur le port **8080**.
Allez sur votre navigateur à l’adresse : [http://localhost:8080/](http://localhost:8080/) pour voir l'application complète !

> **Tester l'API (Tâche 4 et Critère C4) :**
> Notre API REST est accessible sous l'adresse `http://localhost:8080/gti525/v1/...`
> Nous avons inclus un fichier nommé `MTL_Velo_API.postman_collection.json` à la racine du projet. Vous pouvez l'importer dans le logiciel Postman pour exécuter automatiquement nos 6 tests d'API !

---

## 🎨 Choix des couleurs et accessibilité (T1.3)

Le choix des couleurs respecte les standards d’accessibilité **WCAG 2.1 AA** afin d’assurer une bonne lisibilité et un contraste minimal de **4.5:1**.

| Usage | Couleur | Pourquoi ce choix ? |
|---|---|---|
| Couleur principale | `#15803D` | Représente le réseau cyclable et la mobilité durable. |
| Fond de page | `#F1F5F9` | Fond clair réduisant la fatigue visuelle. |
| Texte standard | `#0F172A` | Texte sombre offrant une excellente lisibilité. |

### ✅ Validation

Les contrastes ont été validés avec **WebAIM Contrast Checker**.

- Contraste du texte blanc sur `#15803D` : **5.01:1**
- Conforme au niveau **WCAG 2.1 AA**