import { supabase } from './supabaseClient';

export const ensureAdminInDB = async () => {
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  // Check if admin exists in profiles
  const { data: existingAdmin } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', ADMIN_EMAIL)
    .single();

  // If admin already exists => stop
  if (existingAdmin) return;

  // Create admin user inside auth (if not already exists)
  const { data: signupData, error } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (error && !error.message.includes("already registered")) {
    console.error("Admin creation error:", error);
    return;
  }

  // If admin exists from before -> fetch id
  const adminId =
    signupData?.user?.id ||
    (
      await supabase
        .from('profiles')
        .select('id')
        .eq('email', ADMIN_EMAIL)
        .single()
    ).data?.id;

  if (!adminId) return;

  // Insert admin profile
  await supabase.from('profiles').insert({
    id: adminId,
    email: ADMIN_EMAIL,
    role: 'admin',
  });
};
