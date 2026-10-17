import { describe, expect, it } from 'vitest';
import { categoryFormSchema } from './categorySchema';

describe('categoryFormSchema', () => {
  it('chấp nhận nhóm chỉ có tên', () => {
    expect(categoryFormSchema.parse({ name: ' Quán ăn ', prompt: null, icon: null })).toEqual({
      name: 'Quán ăn',
      prompt: null,
      icon: null,
    });
  });

  it('tên rỗng hoặc quá dài báo đúng câu lỗi', () => {
    const empty = categoryFormSchema.safeParse({ name: '   ', prompt: null, icon: null });
    expect(empty.error?.issues[0]?.message).toBe('Tên nhóm phải từ 1 đến 50 ký tự.');
    const tooLong = categoryFormSchema.safeParse({
      name: 'a'.repeat(51),
      prompt: null,
      icon: null,
    });
    expect(tooLong.error?.issues[0]?.message).toBe('Tên nhóm phải từ 1 đến 50 ký tự.');
  });

  it('câu gợi ý toàn khoảng trắng thành null, có chữ thì được trim', () => {
    expect(
      categoryFormSchema.parse({ name: 'Du lịch', prompt: '   ', icon: null }).prompt,
    ).toBeNull();
    expect(
      categoryFormSchema.parse({ name: 'Du lịch', prompt: '  Đi đâu?  ', icon: null }).prompt,
    ).toBe('Đi đâu?');
  });

  it('câu gợi ý quá 120 ký tự thì lỗi', () => {
    const result = categoryFormSchema.safeParse({
      name: 'Du lịch',
      prompt: 'a'.repeat(121),
      icon: null,
    });
    expect(result.error?.issues[0]?.message).toBe('Câu gợi ý tối đa 120 ký tự');
  });

  it('biểu tượng ngoài danh sách thì lỗi', () => {
    expect(categoryFormSchema.safeParse({ name: 'X', prompt: null, icon: 'rocket' }).success).toBe(
      false,
    );
    expect(categoryFormSchema.safeParse({ name: 'X', prompt: null, icon: 'cafe' }).success).toBe(
      true,
    );
  });
});
