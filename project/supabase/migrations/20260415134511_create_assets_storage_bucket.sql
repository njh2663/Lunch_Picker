
/*
  # Create public assets storage bucket

  1. New Storage Bucket
    - `assets` bucket for storing public static files like thumbnails
    - Public access enabled so files can be accessed via URL without auth
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'assets');
