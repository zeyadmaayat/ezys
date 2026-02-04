-- Create storage bucket for POD (Proof of Delivery) documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('pod', 'pod', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload POD to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pod' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own POD files
CREATE POLICY "Users can view own POD files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pod' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own POD files
CREATE POLICY "Users can update own POD files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pod' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own POD files
CREATE POLICY "Users can delete own POD files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pod' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins full access to all POD files
CREATE POLICY "Admins can manage all POD files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'pod' AND
  has_role(auth.uid(), 'admin'::app_role)
);