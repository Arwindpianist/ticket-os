-- Allow users to update their own profile for password-related fields
CREATE POLICY "Users can update own profile password fields"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

