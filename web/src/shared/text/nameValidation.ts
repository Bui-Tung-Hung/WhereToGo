import { normalizeVi } from './viNormalize';

/** Kết quả kiểm tên của một nhãn/nhóm. */
export type NameValidation =
  { kind: 'ok'; name: string } | { kind: 'empty' } | { kind: 'too_long' } | { kind: 'duplicate' };

/** Tuỳ chọn cho {@link validateName}. */
export interface ValidateNameOptions {
  /** Độ dài tối đa sau khi trim. */
  maxLength: number;
  /** Tên đang sửa (bỏ qua khi kiểm trùng) — dùng khi đổi tên. */
  excludeName?: string;
}

/**
 * Kiểm tên nhãn/nhóm: trim, không rỗng, không quá `maxLength`, không trùng tên đã có (so bằng
 * `normalizeVi`, nên khác dấu hoặc hoa thường vẫn tính là trùng).
 *
 * @param existingNames - Tên của các nhãn/nhóm hiện có.
 */
export function validateName(
  rawName: string,
  existingNames: readonly string[],
  options: ValidateNameOptions,
): NameValidation {
  const name = rawName.trim();
  if (name.length === 0) {
    return { kind: 'empty' };
  }
  if (name.length > options.maxLength) {
    return { kind: 'too_long' };
  }
  const normalized = normalizeVi(name);
  const excluded = options.excludeName === undefined ? null : normalizeVi(options.excludeName);
  const isDuplicate = existingNames.some((existing) => {
    const normalizedExisting = normalizeVi(existing);
    return normalizedExisting !== excluded && normalizedExisting === normalized;
  });
  if (isDuplicate) {
    return { kind: 'duplicate' };
  }
  return { kind: 'ok', name };
}

/**
 * Câu lỗi hiển thị cho một kết quả kiểm tên không hợp lệ.
 *
 * @param noun - Tên loại đối tượng viết thường, ví dụ `'nhãn'`, `'nhóm'`.
 */
export function nameErrorMessage(
  kind: Exclude<NameValidation['kind'], 'ok'>,
  noun: string,
  maxLength: number,
): string {
  if (kind === 'duplicate') {
    return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} này đã tồn tại.`;
  }
  return `Tên ${noun} phải từ 1 đến ${maxLength} ký tự.`;
}
