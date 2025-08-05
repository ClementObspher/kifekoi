# Gestion des Dépendances - Compétence RNCP C4.1.1

## Vue d'ensemble

Ce projet utilise des workflows GitHub Actions pour automatiser la gestion des dépendances.

## Workflows Disponibles

### 🔒 Workflow Principal
**Fichier :** `.github/workflows/dependency-management.yml`

**Fonctionnalités :**
- Vérification automatique des vulnérabilités
- Mise à jour sécurisée des dépendances
- Création de Pull Requests automatiques
- Tests de validation

**Utilisation :**
1. Allez dans **Actions** de votre repository
2. Sélectionnez **"Gestion des Dépendances"**
3. Cliquez sur **"Run workflow"**
4. Choisissez le type de mise à jour :
   - `security` : Vulnérabilités uniquement
   - `all` : Toutes les dépendances

### 🔍 Workflow de Vérification
**Fichier :** `.github/workflows/dependency-check.yml`

**Fonctionnalités :**
- Vérification quotidienne rapide
- Création d'issues pour vulnérabilités critiques

**Déclenchement :** Automatique quotidien à 9h00 UTC

## Configuration

### Labels GitHub Requis
Créez ces labels dans votre repository :
- `security` (rouge #d73a4a)
- `dependencies` (bleu #0366d6)
- `urgent` (orange #d93f0b)
- `automated` (bleu #1d76db)

## Compétence RNCP C4.1.1

**Validée avec :**
- ✅ Surveillance régulière automatisée
- ✅ Évaluation des impacts des mises à jour
- ✅ Intégration sécurisée avec sauvegarde
- ✅ Maintenance à jour avec Pull Requests

**Rapport complet :** `COMPETENCE_C4.1.1_VALIDATION.md` 