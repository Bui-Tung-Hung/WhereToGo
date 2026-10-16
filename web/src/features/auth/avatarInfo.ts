/** Phần thông tin user cần để vẽ avatar (khớp các trường của `User` trong supabase-js). */
export interface AvatarUser {
  email?: string;
  user_metadata?: Record<string, unknown>;
}

/** Thông tin để vẽ avatar: link ảnh Google (nếu có) và chữ cái đầu dự phòng. */
export interface AvatarInfo {
  imageUrl: string | null;
  initial: string;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/**
 * Lấy link ảnh đại diện Google và chữ cái đầu từ user đăng nhập (U2): ảnh = `avatar_url`, không
 * có thì `picture`; chữ cái đầu lấy từ `full_name`, rồi `name`, rồi `email`, không có thì "?".
 */
export function getAvatarInfo(user: AvatarUser | null): AvatarInfo {
  const metadata = user?.user_metadata ?? {};
  const imageUrl = nonEmptyString(metadata.avatar_url) ?? nonEmptyString(metadata.picture);
  const displayName =
    nonEmptyString(metadata.full_name) ?? nonEmptyString(metadata.name) ?? nonEmptyString(user?.email);
  const initial = displayName ? displayName.trim().charAt(0).toUpperCase() : '?';
  return { imageUrl, initial };
}
