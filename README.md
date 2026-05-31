# 🚴 MTL Vélo - Projet GTI525

Application web pour la gestion et la visualisation des données cyclables de Montréal.

---

# 🚀 Installation et démarrage

Assurez-vous d’avoir installé [Node.js](https://nodejs.org/) sur votre machine.

## 1. Accéder au projet

```bash
cd mtl-velo
```

## 2. Installer les dépendances

```bash
npm install
```

## 3. Lancer le serveur de développement

```bash
npm run dev
```

## 4. Accéder à l’application

Ouvrez votre navigateur à l’adresse indiquée dans le terminal  
(généralement : `http://localhost:5173/`).

---

# 🎨 Choix des couleurs et accessibilité (T1.3)

Le choix des couleurs respecte les standards d’accessibilité **WCAG 2.1 AA** afin d’assurer une bonne lisibilité et un contraste minimal de **4.5:1**.

| Usage | Couleur | Pourquoi ce choix ? |
|---|---|---|
| Couleur principale | `#15803D` | Représente le réseau cyclable et la mobilité durable. |
| Fond de page | `#F1F5F9` | Fond clair réduisant la fatigue visuelle. |
| Texte standard | `#0F172A` | Texte sombre offrant une excellente lisibilité. |

## ✅ Validation

Les contrastes ont été validés avec **WebAIM Contrast Checker**.

- Contraste du texte blanc sur `#15803D` : **5.01:1**
- Conforme au niveau **WCAG 2.1 AA**