import type { Session, User } from '@supabase/supabase-js';
import { IonButton } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { onGoogleReauthRequired } from '../../lib/apiClient';
import { GoogleReauthRequiredError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { supabase } from '../../lib/supabaseClient';
import { getDriveAccessToken } from '../google/googleTokenService';
import { QUERY_KEYS } from '../places/placeQueries';
import { seedDefaultTags } from '../tags/tagRepository';
import { signInWithGoogle } from './authService';

export type AuthStatus = 'loading' | 'signed_in' | 'signed_out';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  /**
   * `null` = chưa xác định được; `true` = đã kết nối Google Drive; `false` =
   * cần đăng nhập lại Google để cấp lại quyền Drive (mục 6.6 PLAN.md).
   */
  driveLinked: boolean | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

/** Chờ trước lần thử đầu, để `forwardProviderRefreshToken` (chạy bất đồng bộ ngay sau khi đăng
 * nhập) có thời gian gửi refresh token lên server trước khi ta thăm dò `driveLinked`. */
const DRIVE_LINK_PROBE_DELAY_MS = 1200;
/** Khoảng chờ trước khi thử thăm dò lại một lần nữa, nếu lần đầu báo cần đăng nhập lại. */
const DRIVE_LINK_RETRY_DELAY_MS = 2000;

/**
 * Cung cấp trạng thái đăng nhập hiện tại cho toàn app qua React context.
 *
 * Khi `status` chuyển sang `signed_in`: gọi `seedDefaultTags()` đúng một lần
 * mỗi lần mở app rồi làm mới cache `['tags']`, và thăm dò trạng thái kết nối
 * Google Drive (`driveLinked`) qua `getDriveAccessToken()` — `false` khi
 * server báo `GoogleReauthRequiredError` (không có/hỏng refresh token),
 * `true` khi lấy được access token, giữ `null` (chưa rõ) với các lỗi khác
 * (ví dụ mất mạng) để không báo nhầm banner khi chỉ đang offline.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  // Kết quả thăm dò Drive của lần đăng nhập gần nhất; chỉ có ý nghĩa khi
  // `status === 'signed_in'` (xem `driveLinked` suy ra bên dưới) — tách riêng
  // để không phải gọi `setState` đồng bộ ngay trong thân effect khi `status`
  // chuyển sang `signed_out` (vi phạm quy tắc `react-hooks/set-state-in-effect`).
  const [driveLinkedProbe, setDriveLinkedProbe] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const hasSeededTagsRef = useRef(false);

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

  // Seed 4 nhãn mặc định một lần mỗi lần mở app, ngay khi vừa xác định đã đăng nhập.
  useEffect(() => {
    if (status !== 'signed_in' || hasSeededTagsRef.current) {
      return;
    }
    hasSeededTagsRef.current = true;
    void seedDefaultTags()
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
      })
      .catch((error: unknown) => {
        logger.error('seed_default_tags_failed', {
          message: error instanceof Error ? error.message : String(error),
        });
      });
  }, [status, queryClient]);

  // Thăm dò trạng thái kết nối Google Drive — chỉ chạy khi vừa đăng nhập.
  useEffect(() => {
    if (status !== 'signed_in') {
      return;
    }
    let cancelled = false;

    async function probe(remainingAttempts: number): Promise<void> {
      try {
        await getDriveAccessToken();
        if (!cancelled) {
          setDriveLinkedProbe(true);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof GoogleReauthRequiredError) {
          if (remainingAttempts > 0) {
            setTimeout(() => void probe(remainingAttempts - 1), DRIVE_LINK_RETRY_DELAY_MS);
          } else {
            setDriveLinkedProbe(false);
          }
          return;
        }
        // Lỗi khác (mạng, v.v.): chưa rõ trạng thái Drive, không báo nhầm banner.
      }
    }

    const timer = setTimeout(() => void probe(1), DRIVE_LINK_PROBE_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status]);

  // Bất kỳ lời gọi API nào sau đó trả GoogleReauthRequiredError (vd. khi upload
  // ảnh) cũng làm hiện banner "Cần kết nối lại Google Drive" (mục 6.6 PLAN.md).
  useEffect(() => onGoogleReauthRequired(() => setDriveLinkedProbe(false)), []);

  // Suy ra trực tiếp từ `status` thay vì tự reset `driveLinkedProbe` bằng một
  // effect riêng: ngoài `signed_in` (đang tải, đã đăng xuất) luôn coi là
  // "chưa rõ" (`null`), không hiện banner sai.
  const driveLinked = status === 'signed_in' ? driveLinkedProbe : null;

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    status,
    driveLinked,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Thanh báo "Cần kết nối lại Google Drive" (mục 6.6 PLAN.md), kèm nút kết
 * nối lại. Không hiển thị gì khi `driveLinked` khác `false`. Dùng
 * `useContext(AuthContext)` trực tiếp (thay vì `./useAuth`) để tránh vòng lặp
 * import giữa `AuthProvider.tsx` và `useAuth.ts`.
 */
export function DriveReauthBanner(): React.JSX.Element | null {
  const context = useContext(AuthContext);
  if (!context || context.driveLinked !== false) {
    return null;
  }
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '12px 16px',
        marginBottom: 16,
        background: 'var(--ion-color-light)',
        border: '1px solid var(--ion-border-color)',
        borderRadius: 16,
      }}
    >
      <span className="wtg-caption">Cần kết nối lại Google Drive</span>
      <IonButton
        className="wtg-tap-target"
        size="small"
        fill="clear"
        onClick={() => void signInWithGoogle()}
      >
        Kết nối lại
      </IonButton>
    </div>
  );
}
