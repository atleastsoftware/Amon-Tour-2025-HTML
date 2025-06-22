// Public site - no authentication needed
// This file provides dummy authentication hooks for components that still reference them

export const useLogin = () => {
  return {
    mutate: () => {},
    isPending: false,
    error: null
  };
};

export const useLogout = () => {
  return {
    mutate: () => {},
    isPending: false,
    error: null
  };
};

export const useUser = () => {
  return {
    data: null,
    isLoading: false,
    error: null
  };
};

export const useIsAuthenticated = () => {
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null
  };
};
