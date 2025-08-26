# Soustraction des Créneaux - Documentation

## Vue d'ensemble

Le système de soustraction des créneaux a été entièrement refactorisé pour être géré directement dans Supabase, offrant de meilleures performances et une cohérence garantie.

## Architecture

### 1. Fonction de Soustraction de Base

```sql
CREATE OR REPLACE FUNCTION subtract_time_ranges(
  p_start_time TIME,
  p_end_time TIME,
  p_unavailable_start TIME,
  p_unavailable_end TIME
)
RETURNS JSONB
```

Cette fonction gère la soustraction d'une période indisponible d'un créneau disponible :

- **Aucun chevauchement** : Retourne le créneau original
- **Chevauchement complet** : Retourne un tableau vide
- **Chevauchement partiel** : Divise le créneau en parties avant/après

### 2. Vue Améliorée

```sql
CREATE OR REPLACE VIEW tutor_availability_view
```

Cette vue utilise une approche récursive pour appliquer toutes les indisponibilités partielles à chaque créneau hebdomadaire.

### 3. Fonction de Disponibilité Effective

```sql
CREATE OR REPLACE FUNCTION get_tutor_effective_availability(
  p_tutor_id TEXT,
  p_date DATE,
  p_end_date DATE
)
```

Cette fonction retourne les créneaux disponibles après soustraction de toutes les indisponibilités.

## Exemples de Soustraction

### Scénario 1 : Soustraction Simple
```
Créneau disponible : 09:00 - 17:00
Indisponibilité : 14:00 - 16:00
Résultat : [09:00-14:00, 16:00-17:00]
```

### Scénario 2 : Indisponibilités Multiples
```
Créneau disponible : 09:00 - 18:00
Indisponibilités : [11:00-12:00, 14:00-16:00]
Résultat : [09:00-11:00, 12:00-14:00, 16:00-18:00]
```

### Scénario 3 : Chevauchement Complet
```
Créneau disponible : 14:00 - 16:00
Indisponibilité : 14:00 - 16:00
Résultat : []
```

## Utilisation dans l'Application

### 1. Service TypeScript

```typescript
// Utiliser la fonction Supabase directement
const { data: effectiveData, error } = await getEffectiveAvailability(
  tutorId,
  startDate,
  endDate
);
```

### 2. Structure de Données

```typescript
interface EffectiveAvailability {
  date_actual: string;
  available_slots: { start_time: string; end_time: string }[];
}
```

### 3. Affichage dans le Calendrier

Le composant `TutorCalendarView` utilise directement les données de Supabase sans calcul côté client.

## Avantages du Nouveau Système

### 1. Performance
- **Calculs optimisés** : Tous les calculs se font dans la base de données
- **Moins de transfert** : Seules les données finales sont envoyées au client
- **Indexation** : Utilisation des index de base de données

### 2. Cohérence
- **Source unique de vérité** : Tous les calculs utilisent la même logique
- **Pas de duplication** : Élimination du code de calcul côté client
- **Transactions** : Garantie de cohérence des données

### 3. Maintenabilité
- **Logique centralisée** : Toute la logique de soustraction est dans Supabase
- **Tests automatisés** : Possibilité de tester directement en SQL
- **Évolutivité** : Facile d'ajouter de nouvelles règles

## Migration

### 1. Ancien Système (Déprécié)
```typescript
// ❌ Ne plus utiliser
const { data } = await calculateEffectiveAvailability(tutorId, startDate, endDate);
```

### 2. Nouveau Système
```typescript
// ✅ Utiliser cette fonction
const { data } = await getEffectiveAvailability(tutorId, startDate, endDate);
```

## Tests

### Script de Test SQL
Le fichier `test_slot_subtraction.sql` contient des tests complets pour vérifier :

- Soustraction de base
- Cas d'edge (début/fin de créneau)
- Indisponibilités multiples
- Chevauchements complexes

### Exécution des Tests
```bash
# Dans Supabase SQL Editor
\i test_slot_subtraction.sql
```

## Cas d'Usage Avancés

### 1. Indisponibilités Recouvrantes
Le système gère automatiquement les indisponibilités qui se chevauchent en appliquant la soustraction de manière séquentielle.

### 2. Créneaux Multiples par Jour
Si un tuteur a plusieurs créneaux hebdomadaires le même jour, chaque créneau est traité indépendamment.

### 3. Indisponibilités Multiples
Le système peut gérer un nombre illimité d'indisponibilités partielles par jour.

## Monitoring et Debugging

### 1. Logs SQL
```sql
-- Vérifier les créneaux disponibles pour un tuteur
SELECT * FROM get_tutor_effective_availability('tutor_id', '2024-01-15', '2024-01-15');

-- Vérifier les indisponibilités
SELECT * FROM tutor_availability 
WHERE tutor_id = 'tutor_id' 
  AND type = 'unavailability' 
  AND start_date <= '2024-01-15' 
  AND end_date >= '2024-01-15';
```

### 2. Debugging
```sql
-- Tester la soustraction manuellement
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '17:00'::TIME,
  '[{"start_time": "14:00", "end_time": "16:00"}]'::JSONB
);
```

## Limitations et Considérations

### 1. Performance
- Les calculs récursifs peuvent être coûteux pour de nombreuses indisponibilités
- Recommandation : Limiter à 10-15 indisponibilités partielles par jour

### 2. Précision Temporelle
- Tous les calculs se font au niveau de la minute
- Pas de gestion des secondes

### 3. Fuseaux Horaires
- Les calculs se font dans le fuseau horaire de la base de données
- Considérer les changements d'heure d'été

## Évolutions Futures

### 1. Optimisations Possibles
- Cache des résultats calculés
- Calculs asynchrones pour les gros volumes
- Index spécialisés pour les requêtes temporelles

### 2. Fonctionnalités Étendues
- Gestion des créneaux de pause
- Règles de disponibilité complexes
- Intégration avec les réservations existantes
