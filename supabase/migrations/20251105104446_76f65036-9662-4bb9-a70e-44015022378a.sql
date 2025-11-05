-- Supprimer la contrainte de clé étrangère vers auth.users
ALTER TABLE public.media_library 
DROP CONSTRAINT IF EXISTS media_library_user_id_fkey;

-- Rendre user_id nullable pour permettre les uploads anonymes
ALTER TABLE public.media_library 
ALTER COLUMN user_id DROP NOT NULL;