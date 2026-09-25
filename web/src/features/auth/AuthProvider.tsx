import type { Session, User } from '@supabase/supabase-js';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';

export type AuthStatus = 'loading' | 'signed_in' | 'signed_out';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Cung cấp trạng thái đăng nhập hiện tại cho toàn app qua React context.
 *
 * Giai đoạn A (khung web + Spike): chỉ theo dõi `session`/`status`. Việc gọi
 * `seedDefaultTags()` khi vừa đăng nhập và trạng thái `driveLinked` được
 * thêm ở Giai đoạn C (bước 67 PLAN.md) — Spike không cần đến hai việc này.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setSession(data.session);
      setStatus(data.session ? 'signed_in' : 'signed_out');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? 'signed_in' : 'signed_out');
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    status,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
