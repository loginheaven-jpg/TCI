import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../ui/Loading';

export default function AuthGuard({ children, fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loading size="large" text="인증 확인 중..." />
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  return children;
}
