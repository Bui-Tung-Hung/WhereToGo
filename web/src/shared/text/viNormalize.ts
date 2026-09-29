/**
 * Chuẩn hoá một chuỗi tiếng Việt để so khớp/tìm kiếm không phân biệt hoa
 * thường và dấu: chữ thường → tách tổ hợp Unicode (NFD) → xoá các dấu tổ
 * hợp (U+0300–U+036F) → đổi `đ` thành `d` → gộp khoảng trắng liên tiếp →
 * cắt khoảng trắng đầu/cuối (mục 6.5 PLAN.md).
 *
 * @param text - Chuỗi cần chuẩn hoá.
 * @returns Chuỗi đã chuẩn hoá, chỉ gồm chữ thường không dấu.
 */
export function normalizeVi(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}
