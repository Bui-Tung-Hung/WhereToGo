import { useNavigate } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';

/** Nút avatar 44×44 ở góc phải trên của trang chủ và trang vuốt thẻ; bấm mở Cài đặt (U2). */
export function AvatarButton(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="wtg-tap-target wtg-avatar-button"
      aria-label="Cài đặt"
      onClick={() => navigate('/settings')}
    >
      <UserAvatar size={28} />
    </button>
  );
}
