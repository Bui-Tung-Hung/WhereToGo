import { useEffect, useState } from 'react';

/**
 * Trạng thái online/offline hiện tại của trình duyệt.
 *
 * Lấy giá trị ban đầu từ `navigator.onLine`, sau đó cập nhật theo sự kiện
 * `online`/`offline` của `window` (mục 6.5 PLAN.md).
 *
 * @returns `true` khi trình duyệt đang online, `false` khi offline.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    function handleOnline(): void {
      setIsOnline(true);
    }
    function handleOffline(): void {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
