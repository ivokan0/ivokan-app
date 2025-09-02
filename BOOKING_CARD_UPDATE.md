# Mise à jour du composant BookingCard

## Vue d'ensemble

Le composant `BookingCard` a été mis à jour pour prendre en compte les deux types de réservations (trial et subscription) et afficher des informations supplémentaires comme la langue, la durée, les notes et les documents.

## Changements principaux

### 1. Interface unifiée

- **Nouveau fichier** : `src/utils/bookingUtils.ts`
- **Interface** : `UnifiedBooking` qui unifie les types `TrialBooking` et `SubscriptionBooking`
- **Fonctions utilitaires** : Conversion automatique entre les types de réservations

### 2. Nouveaux champs affichés

- **Langue** : Affichage du nom de la langue (ex: "English", "French")
- **Durée** : Calcul automatique de la durée en heures/minutes (ex: "1h", "45min")
- **Notes** : Affichage des notes de l'étudiant et du tuteur
- **Documents** : Liste des documents de cours avec icônes cliquables

### 3. Support des deux types de réservations

- **Trial Bookings** : Cours d'essai avec `isTrial: true`
- **Subscription Bookings** : Cours d'abonnement avec `isTrial: false`
- **Affichage adaptatif** : Le composant s'adapte automatiquement au type

## Structure des fichiers

```
src/
├── components/
│   ├── BookingCard.tsx          # Composant principal mis à jour
│   └── __tests__/
│       └── BookingCard.test.tsx # Tests unitaires
├── utils/
│   ├── bookingUtils.ts          # Utilitaires de conversion
│   └── index.ts                 # Exports
└── translations/
    ├── en.json                  # Traductions anglaises
    └── fr.json                  # Traductions françaises
```

## Utilisation

### Dans le ScheduleScreen des étudiants

```typescript
import { 
  UnifiedBooking, 
  convertTrialBookingToUnified, 
  convertSubscriptionBookingToUnified,
  calculateDurationMinutes 
} from '../../utils/bookingUtils';

// Conversion des réservations trial
const unifiedTrial = convertTrialBookingToUnified(trialBooking, durationMinutes);

// Conversion des réservations subscription
const unifiedSubscription = convertSubscriptionBookingToUnified(subscriptionBooking, durationMinutes);

// Utilisation dans le composant
<BookingCard
  booking={unifiedBooking}
  tutorName={tutorName}
  tutorAvatar={tutorAvatar}
  language={language}
/>
```

### Fonctions utilitaires disponibles

- `convertTrialBookingToUnified(trialBooking, durationMinutes?)` : Convertit une réservation trial
- `convertSubscriptionBookingToUnified(subscriptionBooking, durationMinutes?)` : Convertit une réservation subscription
- `calculateDurationMinutes(startTime, endTime)` : Calcule la durée en minutes
- `isTrialBooking(booking)` : Vérifie si c'est une réservation trial
- `isSubscriptionBooking(booking)` : Vérifie si c'est une réservation subscription

## Nouvelles traductions

### Anglais
- `booking.studentNotes`: "Student Notes"
- `booking.tutorNotes`: "Tutor Notes"
- `booking.documents`: "Documents"
- `booking.document`: "Document"
- `booking.subscriptionLesson`: "Subscription Lesson"

### Français
- `booking.studentNotes`: "Notes de l'étudiant"
- `booking.tutorNotes`: "Notes du tuteur"
- `booking.documents`: "Documents"
- `booking.document`: "Document"
- `booking.subscriptionLesson`: "Cours d'abonnement"

## Styles mis à jour

- **Notes** : Section avec icône et texte formaté
- **Documents** : Liste avec icônes PDF et compteur
- **Durée** : Affichage compact (ex: "1h30min")
- **Langue** : Intégrée dans l'en-tête avec le type de cours

## Tests

Le composant inclut des tests unitaires complets qui vérifient :
- Affichage des réservations trial
- Affichage des réservations subscription
- Gestion des champs optionnels
- Rendu correct des notes et documents

## Compatibilité

- ✅ **Rétrocompatible** : Les anciennes utilisations continuent de fonctionner
- ✅ **TypeScript** : Types complets et vérification de type
- ✅ **Internationalisation** : Support complet i18n
- ✅ **Thème** : Intégration avec react-native-paper
- ✅ **Accessibilité** : Icônes et textes descriptifs

## Exemple d'utilisation complète

```typescript
// Dans un écran de planning
const renderBookingItem = ({ item }: { item: BookingWithTutor }) => (
  <BookingCard
    booking={item}
    tutorName={item.tutorName}
    tutorAvatar={item.tutorAvatar}
    language={item.language}
  />
);
```

Le composant s'adapte automatiquement et affiche toutes les informations disponibles de manière claire et organisée.
