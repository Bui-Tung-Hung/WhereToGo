import { describe, expect, it } from 'vitest';
import { getAvatarInfo } from './avatarInfo';

describe('getAvatarInfo', () => {
  it('ưu tiên avatar_url, rồi picture', () => {
    expect(
      getAvatarInfo({
        user_metadata: { avatar_url: 'https://a/1.jpg', picture: 'https://a/2.jpg' },
      }).imageUrl,
    ).toBe('https://a/1.jpg');
    expect(getAvatarInfo({ user_metadata: { picture: 'https://a/2.jpg' } }).imageUrl).toBe(
      'https://a/2.jpg',
    );
    expect(getAvatarInfo({ user_metadata: { avatar_url: '' } }).imageUrl).toBeNull();
  });

  it('chữ cái đầu lấy từ full_name, rồi name, rồi email', () => {
    expect(getAvatarInfo({ user_metadata: { full_name: 'hùng', name: 'X' } }).initial).toBe('H');
    expect(getAvatarInfo({ user_metadata: { name: 'an' } }).initial).toBe('A');
    expect(getAvatarInfo({ email: 'bui@example.com', user_metadata: {} }).initial).toBe('B');
  });

  it('user null thì không có ảnh và chữ "?"', () => {
    expect(getAvatarInfo(null)).toEqual({ imageUrl: null, initial: '?' });
  });
});
