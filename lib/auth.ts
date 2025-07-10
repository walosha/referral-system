import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

export async function signUp(email: string, password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        name,
        password_hash: hashedPassword,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  return user;
}

export async function getCurrentUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
