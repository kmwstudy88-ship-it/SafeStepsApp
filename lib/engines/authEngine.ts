import { supabase } from "../supabaseClient";

export type RegisterWithEmailInput = {
  displayName: string;
  email: string;
  password: string;
};

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function registerWithEmail(input: RegisterWithEmailInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        display_name: input.displayName.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
