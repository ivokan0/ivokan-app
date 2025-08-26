# Intégration Clerk avec Supabase - Gestion de l'Autorisation

## Vue d'ensemble

Cette application utilise **Clerk** pour l'authentification et **Supabase** pour la base de données. Contrairement à une configuration Supabase Auth standard, nous devons gérer l'autorisation au niveau de l'application plutôt qu'au niveau de la base de données.

## Architecture d'Autorisation

### 1. Authentification (Clerk)
- **Gestion des utilisateurs** : Clerk gère l'inscription, la connexion, et les sessions
- **Tokens JWT** : Clerk fournit des tokens JWT pour l'authentification
- **User ID** : Chaque utilisateur a un ID unique géré par Clerk

### 2. Base de Données (Supabase)
- **RLS simplifié** : Politiques RLS basiques permettant l'accès aux utilisateurs authentifiés
- **Autorisation applicative** : Toutes les vérifications de permissions sont faites dans le code TypeScript
- **User ID mapping** : Les IDs Clerk sont stockés dans les tables Supabase

## Politiques RLS

### Approche Recommandée
```sql
-- Politique simple permettant l'accès à tous les utilisateurs authentifiés
CREATE POLICY "Allow all operations" ON trial_bookings
  FOR ALL USING (true);
```

### Alternative (RLS désactivé)
```sql
-- Si vous préférez gérer tout au niveau applicatif
ALTER TABLE trial_bookings DISABLE ROW LEVEL SECURITY;
```

## Vérifications d'Autorisation au Niveau Applicatif

### 1. Service `trialBookings.ts`

#### Création de Réservation
```typescript
export const createTrialBooking = async (
  bookingData: CreateTrialBookingData,
  currentUserId?: string
): Promise<ApiResponse<TrialBooking>> => {
  // Vérification que l'utilisateur crée une réservation pour lui-même
  if (currentUserId && currentUserId !== bookingData.student_id) {
    return { data: null, error: new Error('User can only create bookings for themselves') };
  }
  
  // Vérification que le cours d'essai appartient au tuteur
  const { data: trialLesson } = await supabase
    .from('trial_lessons')
    .select('id')
    .eq('id', bookingData.trial_lesson_id)
    .eq('tutor_id', bookingData.tutor_id)
    .single();
    
  if (!trialLesson) {
    return { data: null, error: new Error('Invalid trial lesson or tutor') };
  }
  
  // ... reste de la logique
};
```

#### Consultation des Réservations
```typescript
export const getStudentTrialBookings = async (
  studentId: string, 
  currentUserId?: string
): Promise<ApiResponse<TrialBooking[]>> => {
  // Vérification que l'utilisateur consulte ses propres réservations
  if (currentUserId && currentUserId !== studentId) {
    return { data: null, error: new Error('User can only view their own bookings') };
  }
  
  // ... requête à la base de données
};
```

### 2. Hooks d'Authentification

#### Utilisation dans les Composants
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { profile } = useAuth();
  
  const handleBooking = async () => {
    const result = await createTrialBooking(bookingData, profile?.user_id);
    // ...
  };
};
```

## Sécurité

### Avantages de cette Approche
1. **Flexibilité** : Contrôle total sur la logique d'autorisation
2. **Compatibilité** : Fonctionne avec n'importe quel fournisseur d'authentification
3. **Débogage** : Plus facile de tracer les problèmes d'autorisation
4. **Performance** : Moins de surcharge au niveau de la base de données

### Bonnes Pratiques
1. **Vérifications systématiques** : Toujours vérifier l'ID utilisateur avant les opérations
2. **Validation des relations** : Vérifier que les ressources appartiennent aux bons utilisateurs
3. **Gestion d'erreurs** : Retourner des messages d'erreur clairs pour les violations d'autorisation
4. **Logging** : Logger les tentatives d'accès non autorisées

## Migration depuis Supabase Auth

### Étapes de Migration
1. **Désactiver les politiques RLS complexes**
2. **Ajouter les vérifications applicatives**
3. **Tester toutes les fonctionnalités**
4. **Mettre à jour la documentation**

### Exemple de Migration
```sql
-- Avant (avec Supabase Auth)
CREATE POLICY "Students can view own trial bookings" ON trial_bookings
  FOR SELECT USING (auth.uid()::TEXT = student_id);

-- Après (avec Clerk)
CREATE POLICY "Allow all operations" ON trial_bookings
  FOR ALL USING (true);
```

```typescript
// Vérification applicative ajoutée
if (currentUserId && currentUserId !== studentId) {
  return { data: null, error: new Error('Unauthorized') };
}
```

## Tests

### Tests d'Autorisation
```typescript
describe('Trial Booking Authorization', () => {
  it('should allow students to create their own bookings', async () => {
    const result = await createTrialBooking(bookingData, studentId);
    expect(result.error).toBeNull();
  });
  
  it('should prevent students from creating bookings for others', async () => {
    const result = await createTrialBooking(bookingData, differentStudentId);
    expect(result.error).toBeTruthy();
  });
});
```

## Dépannage

### Problèmes Courants
1. **Erreur "Unauthorized"** : Vérifier que l'ID utilisateur est correctement passé
2. **Accès refusé** : Vérifier les politiques RLS dans Supabase
3. **Erreurs de relation** : Vérifier que les IDs correspondent entre les tables

### Debug
```typescript
// Ajouter des logs pour déboguer
console.log('Current user ID:', currentUserId);
console.log('Booking student ID:', bookingData.student_id);
console.log('Are they equal?', currentUserId === bookingData.student_id);
```

## Évolutions Futures

### Améliorations Possibles
1. **Middleware d'autorisation** : Créer un middleware pour centraliser les vérifications
2. **Cache des permissions** : Mettre en cache les vérifications fréquentes
3. **Rôles et permissions** : Système de rôles plus sophistiqué
4. **Audit trail** : Logging des actions d'autorisation
