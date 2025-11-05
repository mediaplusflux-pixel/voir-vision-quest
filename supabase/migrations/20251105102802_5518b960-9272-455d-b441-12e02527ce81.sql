-- Create RLS policies for the media-library storage bucket

-- Allow anyone to upload files to the media-library bucket
CREATE POLICY "Anyone can upload to media-library"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media-library');

-- Allow anyone to view files in the media-library bucket
CREATE POLICY "Anyone can view media-library files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media-library');

-- Allow anyone to update files in the media-library bucket
CREATE POLICY "Anyone can update media-library files"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'media-library');

-- Allow anyone to delete files from the media-library bucket
CREATE POLICY "Anyone can delete from media-library"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'media-library');