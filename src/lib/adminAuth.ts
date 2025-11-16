const ADMIN_EMAIL = 'admin@chickenmarket.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure';

export const isAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};

export const getAdminCredentials = () => ({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
});
