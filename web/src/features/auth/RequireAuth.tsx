import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Bọc quanh các route cần đăng nhập. Chưa đăng nhập → điều hướng về
 * `#/login`; đang xác định trạng thái → không render gì (tránh nháy màn
 * hình đăng nhập trong lúc `AuthProvider` còn đang tải session).
 */
export function RequireAuth({ children }: RequireAuthProps): React.JSX.Element | null {
  const { status } = useAuth();

  if (status === 'loading') {
    return null;
  }
  if (status === 'signed_out') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
