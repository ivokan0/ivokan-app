# Système de Réservation de Cours d'Essai - Documentation

## Vue d'ensemble

Le système de réservation de cours d'essai permet aux étudiants de réserver des cours d'essai avec des tuteurs en respectant les disponibilités, les fuseaux horaires et les délais minimum de préavis.

## Architecture

### 1. Base de Données

#### Table `trial_bookings`
```sql
CREATE TABLE trial_bookings (
  id UUID PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  trial_lesson_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  student_timezone TEXT NOT NULL,
  tutor_timezone TEXT NOT NULL,
  student_notes TEXT,
  tutor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);
```

#### Contraintes et Index
- **Contraintes de clés étrangères** : Liaison avec `profiles`, `trial_lessons`
- **Contraintes métier** : Vérification de l'ordre temporel, dates futures uniquement
- **Index de performance** : Sur `student_id`, `tutor_id`, `status`, `booking_date`

### 2. Fonctions SQL

#### `get_available_trial_slots`
```sql
FUNCTION get_available_trial_slots(
  p_tutor_id TEXT,
  p_trial_lesson_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_student_timezone TEXT
)
```

Cette fonction :
- Récupère la durée du cours d'essai
- Calcule les disponibilités effectives du tuteur
- Exclut les créneaux déjà réservés
- Filtre les créneaux selon la durée du cours
- Retourne les créneaux disponibles avec leur durée

#### `check_minimum_time_notice`
```sql
FUNCTION check_minimum_time_notice(
  p_tutor_id TEXT,
  p_booking_date DATE,
  p_start_time TIME
)
```

Cette fonction vérifie si la réservation respecte le délai minimum de préavis du tuteur.

#### `create_trial_booking_unavailability`
```sql
TRIGGER trial_booking_unavailability_trigger
```

Ce trigger automatique :
- Crée une indisponibilité quand une réservation est confirmée
- Supprime l'indisponibilité si la réservation est annulée

### 3. Service TypeScript

#### `trialBookings.ts`
Fonctions principales :
- `getAvailableTrialSlots()` : Récupère les créneaux disponibles
- `createTrialBooking()` : Crée une nouvelle réservation
- `updateTrialBooking()` : Met à jour une réservation
- `cancelTrialBooking()` : Annule une réservation
- `confirmTrialBooking()` : Confirme une réservation (tuteur uniquement)

#### Gestion des autorisations
- **Étudiants** : Peuvent créer/modifier leurs propres réservations
- **Tuteurs** : Peuvent voir/modifier les réservations les concernant
- **Vérifications applicatives** : Contrôle des permissions côté client

### 4. Interface Utilisateur

#### Écran de Réservation (`TrialBookingScreen.tsx`)
**Fonctionnalités :**
- Sélection du cours d'essai (durée, prix, description)
- Sélection de la date (selon disponibilités)
- Sélection de l'heure (selon créneaux disponibles)
- Affichage du fuseau horaire de l'étudiant
- Notes optionnelles pour le tuteur
- Information sur le délai minimum de préavis

**Interface :**
- Modales pour chaque sélection (cours, date, heure)
- Validation en temps réel
- Affichage des créneaux disponibles
- Gestion des états de chargement

#### Navigation
- **Accès** : Via le bouton "Réserver un cours d'essai" sur le profil du tuteur
- **Paramètres** : `tutorId` passé en paramètre de route
- **Retour** : Navigation automatique après réservation réussie

## Flux de Réservation

### 1. Initialisation
1. L'étudiant clique sur "Réserver un cours d'essai"
2. Chargement des cours d'essai disponibles du tuteur
3. Chargement du profil du tuteur (fuseau horaire, délai minimum)

### 2. Sélection du Cours
1. Affichage des cours d'essai disponibles
2. Sélection par l'étudiant (durée, prix, description)
3. Chargement automatique des créneaux disponibles

### 3. Sélection de la Date
1. Calcul des disponibilités effectives (disponibilités - indisponibilités)
2. Exclusion des créneaux déjà réservés
3. Filtrage selon la durée du cours sélectionné
4. Affichage des dates avec créneaux disponibles

### 4. Sélection de l'Heure
1. Affichage des créneaux horaires pour la date sélectionnée
2. Vérification du délai minimum de préavis
3. Sélection de l'heure par l'étudiant

### 5. Validation et Réservation
1. Vérification de tous les champs requis
2. Validation du délai minimum de préavis
3. Création de la réservation en base
4. Affichage du message de succès

## Gestion des Fuseaux Horaires

### Affichage
- **Interface** : Affichage dans le fuseau horaire de l'étudiant
- **Stockage** : Conservation des fuseaux horaires de l'étudiant et du tuteur
- **Conversion** : Fonction `convertTimeBetweenTimezones()` pour les conversions

### Détection Automatique
- **Étudiant** : Détection automatique via `Intl.DateTimeFormat()`
- **Tuteur** : Récupération depuis le profil
- **Fallback** : UTC en cas d'erreur

## Gestion des Indisponibilités

### Création Automatique
- **Déclencheur** : Confirmation d'une réservation
- **Action** : Création d'une indisponibilité partielle
- **Période** : Date et heures de la réservation

### Suppression Automatique
- **Déclencheur** : Annulation d'une réservation
- **Action** : Suppression de l'indisponibilité correspondante
- **Nettoyage** : Mise à jour des timestamps

## Sécurité et Validation

### Contraintes Base de Données
- **Unicité** : Un seul créneau par tuteur/date/heure
- **Intégrité** : Vérification des clés étrangères
- **Temporalité** : Dates futures uniquement

### Validation Applicative
- **Autorisations** : Vérification des permissions utilisateur
- **Métier** : Respect du délai minimum de préavis
- **Données** : Validation des champs requis

### RLS (Row Level Security)
- **Politique générale** : Accès autorisé pour tous les utilisateurs authentifiés
- **Autorisation applicative** : Contrôle des permissions au niveau de l'application
- **Vérifications** : Validation des relations et permissions dans le code TypeScript

## Messages d'Erreur

### Validation
- **Champs requis** : "Veuillez sélectionner tous les champs requis"
- **Délai minimum** : "Booking does not meet minimum time notice requirement"

### Réservation
- **Création** : "Impossible de créer la réservation. Veuillez réessayer."
- **Autorisation** : "User can only create bookings for themselves"

## Tests et Débogage

### Fonctions de Test SQL
```sql
-- Test de soustraction de créneaux
SELECT test_slot_subtraction('09:00', '17:00', '[{"start_time": "14:00", "end_time": "16:00"}]');

-- Test de vérification du délai minimum
SELECT check_minimum_time_notice('tutor_id', '2024-01-15', '14:00');
```

### Logs et Monitoring
- **Erreurs** : Logging des erreurs de création/modification
- **Performance** : Monitoring des requêtes de disponibilités
- **Utilisation** : Suivi des réservations créées/annulées

## Évolutions Futures

### Fonctionnalités Possibles
- **Notifications** : Email/SMS de confirmation
- **Paiement** : Intégration du système de paiement
- **Calendrier** : Synchronisation avec calendriers externes
- **Rappels** : Notifications de rappel avant le cours

### Optimisations
- **Cache** : Mise en cache des disponibilités
- **Pagination** : Chargement progressif des créneaux
- **Recherche** : Filtrage avancé des créneaux
- **API** : Endpoints REST pour intégrations externes
