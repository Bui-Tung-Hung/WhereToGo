import { IonIcon, IonSkeletonText } from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { ApiError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { getCachedThumbnail, putThumbnail, type ThumbnailSize } from './thumbnailCache';

export interface AuthedImageProps {
  driveFileId: string;
  size: ThumbnailSize;
  alt: string;
  className?: string;
}

type LoadState = 'loading' | 'loaded' | 'error' | 'not_ready';

const MAX_NOT_READY_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/** Mở file ảnh gốc trên Google Drive trong tab mới. */
function openInDrive(driveFileId: string): void {
  window.open(`https://drive.google.com/file/d/${driveFileId}/view`, '_blank', 'noopener,noreferrer');
}

/**
 * Ảnh lấy qua endpoint thumbnail của server (tra Cache Storage trước), chỉ
 * tải khi phần tử lọt vào màn hình. Ảnh chưa có bản xem trước (Drive chưa
 * xử lý xong) tự thử lại tối đa 3 lần, cách nhau 5 giây (mục 6.6 PLAN.md).
 */
export function AuthedImage({ driveFileId, size, alt, className }: AuthedImageProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<LoadState>('loading');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Chỉ tải khi phần tử lọt vào màn hình.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Tải ảnh (cache trước, rồi server), có thử lại khi Drive chưa có preview.
  useEffect(() => {
    if (!isVisible) {
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function load(attempt: number): Promise<void> {
      setState('loading');

      const cached = await getCachedThumbnail(driveFileId, size);
      if (cancelled) {
        return;
      }
      if (cached) {
        setObjectUrl(URL.createObjectURL(cached));
        setState('loaded');
        return;
      }

      try {
        const blob = await apiClient.getBlob(`/api/photos/${driveFileId}/thumbnail?size=${size}`);
        if (cancelled) {
          return;
        }
        await putThumbnail(driveFileId, size, blob);
        setObjectUrl(URL.createObjectURL(blob));
        setState('loaded');
      } catch (error) {
        if (cancelled) {
          return;
        }
        const isNotReady = error instanceof ApiError && error.code === 'thumbnail_not_ready';
        if (isNotReady && attempt < MAX_NOT_READY_RETRIES) {
          retryTimer = setTimeout(() => void load(attempt + 1), RETRY_DELAY_MS);
          return;
        }
        if (isNotReady) {
          setState('not_ready');
          return;
        }
        logger.error('authed_image_load_failed', { driveFileId, size });
        setState('error');
      }
    }

    void load(0);

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [isVisible, driveFileId, size]);

  // Giải phóng object URL khi đổi ảnh hoặc unmount.
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return (
    <div ref={containerRef} className={className}>
      {state === 'loading' && <IonSkeletonText animated aria-label="Đang tải ảnh" />}
      {state === 'loaded' && objectUrl && <img src={objectUrl} alt={alt} />}
      {state === 'error' && (
        <IonIcon icon={imageOutline} aria-label="Không tải được ảnh" />
      )}
      {state === 'not_ready' && (
        <button
          type="button"
          className="wtg-tap-target"
          onClick={() => openInDrive(driveFileId)}
          aria-label="Chưa có ảnh xem trước, chạm để mở trên Google Drive"
        >
          <IonIcon icon={imageOutline} />
          <span className="wtg-caption">Chưa có ảnh xem trước</span>
        </button>
      )}
    </div>
  );
}
