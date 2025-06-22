// Simplified public authentication for showcase site
// This replaces the Replit authentication system

export const useIsAuthenticated = () => {
  return {
    isAuthenticated: false, // Always false for public site
    isLoading: false,
    user: null
  };
};

export const useUser = () => {
  return {
    data: null,
    isLoading: false,
    error: null
  };
};

export const useLogin = () => {
  return {
    mutate: () => {
      // No-op for public site
    },
    isPending: false
  };
};

export const useLogout = () => {
  return {
    mutate: () => {
      // No-op for public site  
    },
    isPending: false
  };
};