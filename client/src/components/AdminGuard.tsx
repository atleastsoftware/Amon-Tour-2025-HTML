import { useTranslation } from 'react-i18next';
import { useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
interface AdminGuardProps {
  children: ReactNode;
}
export function AdminGuard({
  children
}: AdminGuardProps) {
  const {
    t: t
  } = useTranslation();
  const [, setLocation] = useLocation();
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  useEffect(() => {
    // If not authenticated, redirect to admin login
    if (error || !isLoading && !user) {
      setLocation('/admin-login');
    }
  }, [user, isLoading, error, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('V\xE9rification de l\'authentification...', {
            defaultValue: 'V\xE9rification de l\'authentification...'
          })}</p>
        </div>
      </div>;
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}