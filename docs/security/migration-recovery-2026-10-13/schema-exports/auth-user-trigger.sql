-- Supplemental trigger metadata: public/application-schema dumps exclude the
-- trigger owned by auth.users. Restore only after public functions are present.
-- The exact trigger and function were catalog-verified on both hosted targets.
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
