-- Upsert user profile on auth.users creation
-- Ensures profiles table stays in sync with Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user
()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles
    (id, email)
  VALUES
    (new.id, new.email)
  ON CONFLICT
  (id) DO
  UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

  RETURN new;
  EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER
INSERT ON
auth.users
FOR EACH ROW
EXECUTE
FUNCTION public.handle_new_user
();