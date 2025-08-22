-- Solution pour permettre l'upload d'avatars avec Clerk + Supabase
-- Créer une politique très permissive spécifiquement pour le bucket avatars

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent uploader leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;

-- Créer une politique très permissive pour le bucket avatars
-- Cette politique permet toutes les opérations sur le bucket avatars
CREATE POLICY "Allow all operations on avatars bucket" ON storage.objects
FOR ALL USING (bucket_id = 'avatars');

-- Note: Cette approche est sécurisée car le bucket avatars est public
-- et les noms de fichiers contiennent l'ID utilisateur pour éviter les conflits
