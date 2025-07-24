# TP – Estimation du coût d'une infrastructure cloud AWS

## Projet fil rouge : Application mobile d'événements culturels (SaaS)

---

## 1. Estimation du volume d'utilisateurs et de leur utilisation

| Type d'utilisateur | Volume estimé à 12 mois | Fréquence d'utilisation | Actions typiques |
|-------------------|------------------------|------------------------|------------------|
| Utilisateurs classiques | 5 000 | 3-5 fois / semaine | Recherche, consultation d'événements, réservation |
| Organisateurs | 200 | 1-3 fois / semaine | Création/modification d'événements |
| Administrateurs | 3-5 | Occasionnelle | Supervision, modération |

**Estimation moyenne de trafic :**
- Environ 600 utilisateurs actifs par jour
- Pic estimé : 1 200 utilisateurs/jour (week-ends)

---

## 2. Scénarios d'utilisation

| Scénario | Description | Contexte |
|----------|-------------|-----------|
| Minimal | Application en version bêta privée (tests internes + quelques utilisateurs réels) | ~100 utilisateurs actifs / mois |
| Nominal | MVP en ligne avec communication modérée | ~5 000 utilisateurs enregistrés – 600/jour |
| Maximal | Lancement national avec marketing actif | ~50 000 utilisateurs – jusqu'à 5 000/jour |

---

## 3. Ressources nécessaires par scénario

| Ressource | Minimal | Nominal | Maximal |
|-----------|---------|---------|---------|
| EC2 (serveur applicatif) | 1 t3.small | 2 t3.medium | 4 t3.large avec load balancer |
| RDS (PostgreSQL) | db.t3.micro, 10 Go | db.t3.medium, 50 Go | db.t3.large, 200 Go + read replica |
| S3 (stockage fichiers) | 5 Go | 50 Go | 500 Go |
| CloudFront (CDN) | Non utilisé | 100 Go/mois | 1 To/mois |
| Elastic Load Balancer | Non utilisé | 1 ALB | 1 ALB |
| Route 53 (DNS) | Domaine + gestion DNS | Idem | Idem |
| Notifications (SNS) | Faible volume (~100/j) | ~2 000/jour | Jusqu'à 20 000/jour |
| Data transfer (sortant) | < 1 Go/mois | ~50 Go/mois | ~500 Go/mois |
| CloudWatch (logs) | Basic | Standard | Standard + alarmes personnalisées |

---

## 4. Estimation du coût via AWS Calculator

> ⚠️ Les chiffres suivants sont des ordres de grandeur mensuels. Les prix réels peuvent varier légèrement.

| Scénario | Coût mensuel estimé |
|----------|---------------------|
| Minimal | ~ 25 à 30 € / mois |
| Nominal | ~ 180 à 250 € / mois |
| Maximal | ~ 850 à 1 200 € / mois |

➡️ Calculs faits via : [AWS Calculator](https://calculator.aws)

---

## 5. Conclusion : politique tarifaire de l'application

### 🎯 Objectif : rentabiliser l'infrastructure dès la phase nominale

| Source de revenus | Politique |
|-------------------|-----------|
| Accès gratuit utilisateur final | Oui |
| Commission sur chaque réservation | 5 à 10 % |
| Abonnement mensuel pour organisateurs | 9,99 € à 29,99 € selon le niveau |
| Publicité ciblée (phase 2+) | Optionnelle |

👉 **Seuil de rentabilité visé :** ~50 événements réservés/mois ou ~15 organisateurs abonnés en offre standard dès le scénario nominal.

---

> 💬 Ce modèle d'infrastructure AWS est dimensionné pour grandir progressivement avec l'usage réel de l'application, tout en maintenant une maîtrise des coûts.