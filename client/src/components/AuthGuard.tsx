import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { ComponentLoading } from '@/components/ui/loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, requireAuth, isAuthenticated, setLocation]);

  if (isLoading) {
    return <ComponentLoading text="Loading..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <ComponentLoading text="Redirecting to login..." />;
  }

  return <>{children}</>;
}