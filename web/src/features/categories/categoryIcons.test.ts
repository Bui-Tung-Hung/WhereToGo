import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ICON_KEYS,
  CATEGORY_ICON_LABELS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_PROMPT,
  resolveCategoryIcon,
  resolveCategoryPrompt,
} from './categoryIcons';

describe('categoryIcons', () => {
  it('có đúng 20 khoá, mỗi khoá có icon và nhãn tiếng Việt', () => {
    expect(CATEGORY_ICON_KEYS).toHaveLength(20);
    for (const key of CATEGORY_ICON_KEYS) {
      expect(CATEGORY_ICONS[key]).toBeTruthy();
      expect(CATEGORY_ICON_LABELS[key]).toBeTruthy();
    }
  });

  it('khoá null hoặc không hợp lệ thì dùng biểu tượng mặc định', () => {
    expect(resolveCategoryIcon(null)).toBe(DEFAULT_CATEGORY_ICON);
    expect(resolveCategoryIcon('khong-co')).toBe(DEFAULT_CATEGORY_ICON);
    expect(resolveCategoryIcon('cafe')).toBe(CATEGORY_ICONS.cafe);
  });

  it('câu gợi ý null thì dùng câu mặc định', () => {
    expect(resolveCategoryPrompt(null)).toBe(DEFAULT_CATEGORY_PROMPT);
    expect(resolveCategoryPrompt('Chán cơm thì ăn gì?')).toBe('Chán cơm thì ăn gì?');
  });
});
