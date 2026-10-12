import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-wrap"><div className="card"><p className="muted">Carregando…</p></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
