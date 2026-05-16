
/*
  # Allow service role to insert into assets bucket
*/

CREATE POLICY "Service role insert for assets"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'assets');
