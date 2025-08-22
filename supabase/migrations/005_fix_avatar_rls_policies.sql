-- Supprimer les anciennes politiques RLS pour les avatars
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent uploader leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres avatars" ON storage.objects;

-- Créer de nouvelles politiques RLS plus permissives pour les avatars
-- Permettre à tous les utilisateurs authentifiés d'uploader dans le bucket avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Permettre à tous les utilisateurs de voir les avatars
CREATE POLICY "Allow public to view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Permettre aux utilisateurs authentifiés de mettre à jour leurs avatars
CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Permettre aux utilisateurs authentifiés de supprimer leurs avatars
CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
