# Configuration de l'authentification Clerk

## Prérequis

1. Créer un compte sur [Clerk.com](https://clerk.com)
2. Créer une nouvelle application dans le dashboard Clerk
3. Configurer les providers OAuth (Google et Apple)

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Supabase Configuration (pour la table Profiles)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Configuration Clerk

### 1. Configuration OAuth

Dans le dashboard Clerk, allez dans **User & Authentication** > **Social Connections** et configurez :

#### Google OAuth
1. Activez Google
2. Ajoutez vos domaines autorisés
3. Configurez les URLs de redirection pour React Native :
   - `exp://localhost:8081/--/sso-callback` (pour le développement)
   - `exp://192.168.x.x:8081/--/sso-callback` (pour les tests sur appareil physique)
   - `your-app-scheme://sso-callback` (pour la production)



### 2. Configuration des URLs de redirection

Dans **User & Authentication** > **Redirect URLs**, ajoutez :
- `exp://localhost:8081/--/sso-callback`
- `exp://192.168.x.x:8081/--/sso-callback` (remplacez par votre IP locale)
- `your-app-scheme://sso-callback` (pour la production)

### 3. Configuration pour React Native

Pour que l'OAuth fonctionne correctement dans React Native, assurez-vous que :

1. **expo-web-browser** est installé (déjà inclus dans les dépendances)
2. Les URLs de redirection utilisent le bon format Expo
3. Pour la production, configurez un scheme d'application personnalisé

## Configuration Supabase

### 1. Créer la table Profiles

Exécutez le script SQL dans `supabase/migrations/001_create_profiles_table.sql` dans votre base de données Supabase.

### 2. Corriger les politiques RLS

Si vous avez déjà créé la table avec les anciennes politiques RLS, exécutez également le script de correction :

```sql
-- Exécutez ce script dans votre base de données Supabase
-- pour corriger les politiques RLS qui ne fonctionnent pas avec Clerk
```

Ou utilisez le fichier `supabase/migrations/002_fix_rls_policies.sql`.

### 3. Configuration RLS

Les politiques RLS sont configurées pour permettre le développement. En production, vous devriez implémenter une sécurité plus stricte.

## Fonctionnalités implémentées

### Authentification
- ✅ Connexion par email/mot de passe
- ✅ Inscription par email/mot de passe
- ✅ Connexion avec Google
- ✅ Gestion des erreurs d'authentification

### Profils utilisateurs
- ✅ Table Profiles avec les champs requis
- ✅ Détection automatique du fuseau horaire
- ✅ Remplissage automatique des noms pour les connexions OAuth
- ✅ Demande des noms pour les inscriptions par email

### Comportement spécifique

#### Inscription par Email
- Les champs `first_name` et `last_name` sont demandés à l'utilisateur
- Le fuseau horaire est détecté automatiquement

#### Inscription par Google
- Les champs `first_name` et `last_name` sont automatiquement remplis depuis les informations du compte Google
- Le fuseau horaire est détecté automatiquement

## Structure de la base de données

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Dépendances ajoutées

- `@clerk/clerk-expo`: SDK Clerk pour React Native
- `expo-location`: Pour la détection du fuseau horaire

## Utilisation

L'authentification est maintenant gérée par Clerk et les profils utilisateurs sont stockés dans Supabase. Le contexte d'authentification (`useAuth`) fournit toutes les méthodes nécessaires :

```typescript
const { 
  user, 
  profile, 
  isSignedIn, 
  signIn, 
  signUp, 
  signInWithGoogle, 
  signOut 
} = useAuth();
```

## Notes importantes

1. **Sécurité** : Les clés publiques Clerk sont sécurisées pour être utilisées côté client
2. **Performance** : Les profils sont mis en cache localement et synchronisés avec Supabase
3. **UX** : L'interface utilisateur est entièrement traduite en français et anglais
4. **Compatibilité** : Compatible avec Expo et React Native
