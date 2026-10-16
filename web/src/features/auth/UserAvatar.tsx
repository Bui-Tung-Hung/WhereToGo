import { useState } from 'react';
import { getAvatarInfo } from './avatarInfo';
import { useAuth } from './useAuth';

export interface UserAvatarProps {
  /** Đường kính avatar (px). */
  size: number;
}

/**
 * Ảnh đại diện Google của user đang đăng nhập (U2); không có ảnh hoặc ảnh lỗi (ví dụ offline)
 * thì hiện vòng tròn chữ cái đầu. Chỉ để trang trí (`alt=""`) — nút bọc ngoài có `aria-label`.
 */
export function UserAvatar({ size }: UserAvatarProps): React.JSX.Element {
  const { user } = useAuth();
  const { imageUrl, initial } = getAvatarInfo(user);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const circleStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'block',
    flexShrink: 0,
  };

  if (imageUrl && failedUrl !== imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        referrerPolicy="no-referrer"
        style={{ ...circleStyle, objectFit: 'cover' }}
        onError={() => setFailedUrl(imageUrl)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        ...circleStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--wtg-chip-bg)',
        color: 'var(--wtg-chip-text)',
        fontSize: size * 0.45,
        fontWeight: 600,
      }}
    >
      {initial}
    </span>
  );
}
