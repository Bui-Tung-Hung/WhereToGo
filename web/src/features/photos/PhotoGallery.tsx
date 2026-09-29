import { IonIcon } from '@ionic/react';
import { imageOutline, openOutline, trashOutline } from 'ionicons/icons';
import type { PhotoRef } from '../places/types';
import { AuthedImage } from './AuthedImage';

export interface PhotoGalleryProps {
  photos: readonly PhotoRef[];
  /** Chế độ sửa: hiện thêm nút xoá trên từng ảnh (mục 6.6 PLAN.md). */
  editable?: boolean;
  onRemove?: (photo: PhotoRef) => void;
}

/** Mở file ảnh gốc trên Google Drive trong tab mới. */
function openInDrive(driveFileId: string): void {
  window.open(
    `https://drive.google.com/file/d/${driveFileId}/view`,
    '_blank',
    'noopener,noreferrer',
  );
}

/**
 * Hàng ảnh của một địa điểm, cuộn ngang với scroll-snap, tỉ lệ 4:3, dùng
 * ảnh thu nhỏ 1600px (mục 6.6 PLAN.md). Mỗi ảnh có nút "Mở trong Google
 * Drive"; ở chế độ sửa (`editable`) có thêm nút xoá.
 */
export function PhotoGallery({
  photos,
  editable = false,
  onRemove,
}: PhotoGalleryProps): React.JSX.Element {
  if (photos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: 160,
          borderRadius: 16,
          background: 'var(--ion-color-light)',
        }}
      >
        <IonIcon icon={imageOutline} color="medium" aria-hidden="true" />
        <span className="wtg-caption" style={{ color: 'var(--ion-color-medium)' }}>
          Chưa có ảnh
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
      {/* AuthedImage chỉ nhận `className` (không có `style`) — dùng style tag để ảnh bên trong
          phủ kín khung 4:3 (object-fit: cover) mà không phải đụng tới theme/global.css. */}
      <style>{`
        .wtg-gallery-frame { width: 100%; height: 100%; display: block; }
        .wtg-gallery-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
      `}</style>
      {photos.map((photo) => (
        <div
          key={photo.id}
          style={{
            position: 'relative',
            flex: '0 0 85%',
            aspectRatio: '4 / 3',
            scrollSnapAlign: 'start',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--ion-border-color)',
          }}
        >
          <AuthedImage
            driveFileId={photo.driveFileId}
            size={1600}
            alt="Ảnh địa điểm"
            className="wtg-gallery-frame"
          />
          <button
            type="button"
            className="wtg-tap-target"
            aria-label="Mở trong Google Drive"
            onClick={() => openInDrive(photo.driveFileId)}
            style={{
              position: 'absolute',
              top: 8,
              right: editable ? 52 : 8,
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 8,
            }}
          >
            <IonIcon icon={openOutline} color="light" aria-hidden="true" />
          </button>
          {editable && (
            <button
              type="button"
              className="wtg-tap-target"
              aria-label="Xoá ảnh"
              onClick={() => onRemove?.(photo)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 8,
              }}
            >
              <IonIcon icon={trashOutline} color="light" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
