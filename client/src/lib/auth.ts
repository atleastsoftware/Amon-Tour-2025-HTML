import { apiRequest } from "./queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['/api/me'],
    retry: false,
    enabled: false, // Disable automatic queries
    queryFn: () => null, // Return null instead of making API calls
  });
};

export const useIsAuthenticated = () => {
  return {
    isAuthenticated: false, // Always return false for public site
    isLoading: false,
    user: null
  };
};
