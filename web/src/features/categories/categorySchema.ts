import { z } from 'zod';
import { nameErrorMessage } from '../../shared/text/nameValidation';
import { CATEGORY_ICON_KEYS } from './categoryIcons';

/** Độ dài tối đa của tên nhóm (khớp `check` của cột `categories.name`). */
export const CATEGORY_NAME_MAX_LENGTH = 50;

/** Độ dài tối đa của câu gợi ý (khớp `check` của cột `categories.prompt`). */
export const CATEGORY_PROMPT_MAX_LENGTH = 120;

/**
 * Zod schema cho form thêm/sửa nhóm (mục 4.8 PLAN-UI-1.md): tên bắt buộc, câu gợi ý và biểu
 * tượng tuỳ chọn (kiểu C — M1). Câu gợi ý được trim, chuỗi rỗng thành `null`. Trùng tên kiểm
 * riêng bằng `validateName` (cần danh sách nhóm hiện có).
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, nameErrorMessage('empty', 'nhóm', CATEGORY_NAME_MAX_LENGTH))
    .max(CATEGORY_NAME_MAX_LENGTH, nameErrorMessage('too_long', 'nhóm', CATEGORY_NAME_MAX_LENGTH)),
  prompt: z
    .string()
    .nullable()
    .transform((value) => (value === null || value.trim() === '' ? null : value.trim()))
    .refine((value) => value === null || value.length <= CATEGORY_PROMPT_MAX_LENGTH, {
      message: `Câu gợi ý tối đa ${CATEGORY_PROMPT_MAX_LENGTH} ký tự`,
    }),
  icon: z.enum(CATEGORY_ICON_KEYS).nullable(),
});

/** Giá trị form nhóm trước khi kiểm (dữ liệu nhập). */
export type CategoryFormValues = z.input<typeof categoryFormSchema>;

/** Giá trị đã kiểm của form nhóm — dữ liệu gửi lên `categoryRepository`. */
export type CategoryInput = z.output<typeof categoryFormSchema>;
