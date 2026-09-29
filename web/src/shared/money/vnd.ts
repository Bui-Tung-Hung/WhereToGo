/** Giá trị VNĐ lớn nhất chấp nhận khi nhập tay (D20 PLAN.md). */
const MAX_VND = 2_000_000_000;

const vndFormatter = new Intl.NumberFormat('vi-VN');

/**
 * Định dạng một số nguyên VNĐ để hiển thị, ví dụ `150000` → `"150.000 ₫"`.
 *
 * @param amount - Số tiền (VNĐ), không âm.
 * @returns Chuỗi đã định dạng, có hậu tố `" ₫"`.
 */
export function formatVnd(amount: number): string {
  return `${vndFormatter.format(amount)} ₫`;
}

/**
 * Định dạng khoảng giá để hiển thị (D20 PLAN.md):
 * - Có cả hai → `"150.000 ₫ – 300.000 ₫"`.
 * - Chỉ có giá thấp nhất → `"Từ 150.000 ₫"`.
 * - Chỉ có giá cao nhất → `"Đến 300.000 ₫"`.
 * - Không có gì → `null`.
 *
 * @param min - Giá thấp nhất (VNĐ) hoặc `null`.
 * @param max - Giá cao nhất (VNĐ) hoặc `null`.
 * @returns Chuỗi khoảng giá đã định dạng, hoặc `null` khi không có giá nào.
 */
export function formatVndRange(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) {
    return `${formatVnd(min)} – ${formatVnd(max)}`;
  }
  if (min !== null) {
    return `Từ ${formatVnd(min)}`;
  }
  if (max !== null) {
    return `Đến ${formatVnd(max)}`;
  }
  return null;
}

/**
 * Phân tích chuỗi người dùng gõ thành số VNĐ: chỉ giữ lại chữ số, bỏ qua
 * mọi ký tự khác (dấu chấm ngăn cách, "đ", khoảng trắng, ...).
 *
 * @param text - Chuỗi người dùng đã nhập.
 * @returns Số VNĐ, hoặc `null` khi rỗng hoặc vượt quá {@link MAX_VND}.
 */
export function parseVndInput(text: string): number | null {
  const digits = text.replace(/\D/g, '');
  if (digits === '') {
    return null;
  }
  const value = Number(digits);
  if (value > MAX_VND) {
    return null;
  }
  return value;
}

/**
 * Định dạng chuỗi đang gõ dở thành dạng có dấu chấm ngăn cách hàng nghìn,
 * để hiển thị lại trong ô nhập trong lúc người dùng gõ.
 *
 * @param text - Chuỗi người dùng đang gõ.
 * @returns Chuỗi đã định dạng dấu chấm ngăn cách hàng nghìn (không có hậu tố "₫").
 */
export function formatVndInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits === '') {
    return '';
  }
  return vndFormatter.format(Number(digits));
}
