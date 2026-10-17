import { IonIcon } from '@ionic/react';
import { AuthedImage } from '../photos/AuthedImage';
import type { PhotoRef } from '../places/types';

/** Số ảnh tối đa trong cụm (U3). */
export const CLUSTER_PHOTO_LIMIT = 5;

export interface PhotoClusterProps {
  /** Tối đa 5 ảnh mới nhất của nhóm (ảnh đầu tiên nằm ở ô giữa lớn nhất). */
  photos: readonly PhotoRef[];
  /** Số địa điểm của nhóm, hiện thành nhãn "+N". */
  count: number;
  /** Biểu tượng nhóm, dùng khi nhóm có địa điểm nhưng chưa có ảnh nào (P21). */
  fallbackIcon: string;
}

/** Cụm ảnh tròn chồng nhau trên thẻ nhóm của trang chủ (vị trí theo Stitch — mục 6.3 PLAN-UI-1.md). */
export function PhotoCluster({
  photos,
  count,
  fallbackIcon,
}: PhotoClusterProps): React.JSX.Element {
  const visible = photos.slice(0, CLUSTER_PHOTO_LIMIT);
  return (
    <div className="wtg-cluster" aria-hidden="true">
      {visible.length === 0 ? (
        <div className="wtg-cluster-fallback">
          <IonIcon icon={fallbackIcon} />
        </div>
      ) : (
        visible.map((photo, index) => (
          <AuthedImage
            key={photo.id}
            driveFileId={photo.driveFileId}
            size={400}
            alt=""
            className={`wtg-cluster-photo wtg-cluster-photo--${index + 1}`}
          />
        ))
      )}
      <span className="wtg-cluster-pill">+{count}</span>
    </div>
  );
}
