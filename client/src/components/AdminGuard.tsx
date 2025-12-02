import { useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/contexts/TranslationContext';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [, setLocation] = useLocation();
  const { translations } = useTranslation();
  
  const adminT = translations?.admin || {};
  const loginT = adminT?.login || {};
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (error || (!isLoading && !user)) {
      setLocation('/admin-login');
    }
  }, [user, isLoading, error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            {loginT?.redirecting || "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            {loginT?.redirecting || "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}