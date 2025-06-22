// PUBLIC SITE ONLY - NO AUTHENTICATION
// All authentication functions disabled for public showcase

export const useLogin = () => ({
  mutate: () => console.warn('Authentication disabled - public site'),
  isPending: false,
  error: null
});

export const useLogout = () => ({
  mutate: () => console.warn('Authentication disabled - public site'),
  isPending: false,
  error: null
});

export const useUser = () => ({
  data: null,
  isLoading: false,
  error: null
});

export const useIsAuthenticated = () => ({
  isAuthenticated: false,
  isLoading: false,
  user: null
});
