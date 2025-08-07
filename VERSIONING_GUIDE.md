# Guide de Versioning et Changelog - Kifekoi

## 📋 Vue d'ensemble

Ce guide explique le processus de gestion des versions et de génération du changelog pour le projet Kifekoi, validant la compétence RNCP C4.3.2.

## 🎯 Objectifs

- **Traçabilité** : Documenter toutes les évolutions du logiciel
- **Communication** : Informer les utilisateurs des changements
- **Maintenance** : Faciliter le debugging et les rollbacks
- **Compliance** : Respecter les standards de l'industrie

## 📦 Système de Versioning

### Semantic Versioning (SemVer)

Le projet utilise le [Semantic Versioning](https://semver.org/lang/fr/) :

```
MAJOR.MINOR.PATCH
```

- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs compatibles

### Exemples de versions

| Version | Type | Description |
|---------|------|-------------|
| `1.0.0` | Major | Première version stable |
| `1.1.0` | Minor | Nouvelles fonctionnalités |
| `1.1.1` | Patch | Correction de bugs |
| `2.0.0` | Major | Refonte majeure |

## 📝 Convention de Commits

### Format des messages

```
type(scope): description courte

Description détaillée (optionnelle)

Impact: impact sur l'utilisateur
Tests: tests effectués
Fixes: #123
```

### Types de commits

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat: ajouter authentification Google` |
| `fix` | Correction de bug | `fix: corriger crash sur iOS` |
| `docs` | Documentation | `docs: mettre à jour README` |
| `style` | Formatage | `style: corriger indentation` |
| `refactor` | Refactorisation | `refactor: simplifier logique auth` |
| `perf` | Performance | `perf: optimiser requêtes API` |
| `test` | Tests | `test: ajouter tests unitaires` |
| `chore` | Maintenance | `chore: mettre à jour dépendances` |
| `breaking` | Changement majeur | `breaking: refactoriser API auth` |
| `security` | Sécurité | `security: corriger vulnérabilité XSS` |

### Exemples de commits

```bash
# Nouvelle fonctionnalité
feat: ajouter système de notifications push

- Intègre Expo Notifications
- Support iOS et Android
- Configuration automatique

Impact: Les utilisateurs reçoivent des rappels d'événements
Tests: Tests d'intégration passent
Fixes: #456

# Correction de bug
fix: corriger crash lors de la navigation

- Gestion des états de chargement
- Validation des paramètres
- Fallback en cas d'erreur

Impact: Plus de crash lors de la navigation
Tests: Tests unitaires ajoutés
Fixes: #789
```

## 🚀 Processus de Release

### 1. Développement

```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer et commiter
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Pousser la branche
git push origin feature/nouvelle-fonctionnalite
```

### 2. Tests et Validation

```bash
# Lancer les tests
npm run lint
npm test

# Vérifier la qualité du code
npm run check-deps
```

### 3. Merge et Versioning

```bash
# Merger dans main
git checkout main
git merge feature/nouvelle-fonctionnalite

# Incrémenter la version
npm run version:patch  # ou minor/major
```

### 4. Génération du Changelog

```bash
# Générer automatiquement
npm run generate-changelog

# Ou manuellement
node scripts/generate-changelog.js
```

### 5. Release

```bash
# Créer le tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Pousser le tag
git push origin v1.1.0
```

## 🔧 Outils Automatisés

### Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run generate-changelog` | Générer le changelog |
| `npm run version:patch` | Incrémenter version patch |
| `npm run version:minor` | Incrémenter version minor |
| `npm run version:major` | Incrémenter version major |

### Workflow GitHub Actions

Le workflow `.github/workflows/version-management.yml` automatise :

1. **Vérification des versions** : Détecte si une mise à jour est nécessaire
2. **Mise à jour automatique** : Incrémente la version selon les commits
3. **Génération du changelog** : Crée automatiquement le changelog
4. **Création de release** : Génère une release GitHub
5. **Notifications** : Informe l'équipe

### Utilisation du Workflow

1. **Manuel** : Via l'interface GitHub Actions
2. **Automatique** : Sur push vers main avec changements détectés

## 📄 Structure du Changelog

### Format du fichier CHANGELOG.md

```markdown
# Changelog - Application Kifekoi

## [Unreleased]
### Added
- Fonctionnalités en cours de développement

## [1.1.0] - 2025-01-04
### ✨ Added
- Nouvelle fonctionnalité A
- Nouvelle fonctionnalité B

### 🐛 Fixed
- Correction du bug X
- Amélioration de la performance Y

### 🔒 Security
- Correction de la vulnérabilité Z

## [1.0.0] - 2024-12-15
### ✨ Added
- Version initiale
```

### Catégories utilisées

- **✨ Added** : Nouvelles fonctionnalités
- **🐛 Fixed** : Corrections de bugs
- **🔒 Security** : Corrections de sécurité
- **⚠️ Breaking Changes** : Changements incompatibles
- **📚 Documentation** : Mise à jour de la documentation
- **🔧 Changed** : Modifications de fonctionnalités existantes
- **🗑️ Removed** : Suppression de fonctionnalités

## 📊 Rapports de Release

### Fichier de rapport

Chaque release génère un fichier `release-report-{version}.json` :

```json
{
  "version": "1.1.0",
  "date": "2025-01-04",
  "summary": {
    "breaking": 0,
    "security": 1,
    "features": 3,
    "fixes": 2,
    "docs": 1,
    "other": 0,
    "total": 7
  },
  "commits": {
    "features": [...],
    "fixes": [...],
    "security": [...]
  }
}
```

## 🎯 Bonnes Pratiques

### Pour les développeurs

1. **Messages de commit clairs** : Utiliser le template fourni
2. **Commits atomiques** : Un commit = une modification logique
3. **Tests systématiques** : Tester avant de commiter
4. **Documentation** : Documenter les changements importants

### Pour les releases

1. **Tests complets** : Valider avant chaque release
2. **Changelog à jour** : Documenter tous les changements
3. **Communication** : Informer l'équipe et les utilisateurs
4. **Rollback plan** : Préparer un plan de rollback

### Pour la maintenance

1. **Tags Git** : Créer des tags pour chaque version
2. **Branches de maintenance** : Maintenir les versions LTS
3. **Documentation** : Maintenir la documentation à jour
4. **Monitoring** : Surveiller les performances post-release

## 🔍 Monitoring et Analytics

### Métriques de suivi

- **Fréquence des releases** : Temps entre les versions
- **Qualité des commits** : Respect des conventions
- **Temps de résolution** : Délai de correction des bugs
- **Satisfaction utilisateur** : Feedback post-release

### Outils recommandés

- **GitHub Insights** : Analytics des commits et releases
- **Conventional Commits** : Validation des messages
- **Release Drafter** : Génération automatique de changelog
- **Semantic Release** : Automatisation complète

## ✅ Validation de la Compétence C4.3.2

### Critères validés

- ✅ **Journal des versions** : CHANGELOG.md complet et structuré
- ✅ **Documentation des correctifs** : Traçabilité des bugs et corrections
- ✅ **Suivi des évolutions** : Historique complet des modifications
- ✅ **Automatisation** : Workflows GitHub Actions
- ✅ **Standards** : Respect des conventions SemVer et Conventional Commits

### Compétences démontrées

1. **Gestion de versions** : Semantic Versioning maîtrisé
2. **Documentation** : Changelog structuré et informatif
3. **Automatisation** : Workflows CI/CD pour la gestion des versions
4. **Communication** : Processus clair pour l'équipe et les utilisateurs
5. **Maintenance** : Outils et processus de suivi

---

**Dernière mise à jour** : 4 janvier 2025  
**Responsable** : Équipe de développement Kifekoi  
**Compétence RNCP** : C4.3.2 - Journal des versions
