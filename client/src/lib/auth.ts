import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { clearTourNinjaPreview } from "@/lib/tourNinjaPreview";

interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout");
      return response.json();
    },
    onSuccess: () => {
      // Dispatch synchronously so the mounted provider drops a draft before
      // the admin route initiates its SPA navigation.
      clearTourNinjaPreview(sessionStorage, () => {
        window.dispatchEvent(new Event("tour-ninja-release-preview-reset"));
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
  });
};

export const useUser = () => {
  return useQuery<User | null>({
    queryKey: ["/api/me"],
    retry: false,
  });
};

export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useUser();
  
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
