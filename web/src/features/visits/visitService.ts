import { mapPostgrestError, OfflineError } from '../../lib/errors';
import { supabase } from '../../lib/supabaseClient';
import type { PlaceStatus } from '../places/types';
import { deleteVisit, insertVisit, type InsertVisitInput, type Visit } from './visitRepository';

function assertOnline(): void {
  if (!navigator.onLine) {
    throw new OfflineError();
  }
}

/**
 * Thêm một lần đi. Nếu trạng thái hiện tại của địa điểm chưa phải "Đã đi"
 * thì tự chuyển sang "Đã đi" (D16 PLAN.md). Chỉ cập nhật đúng cột `status`
 * (không dùng `placeRepository.updatePlace`, vốn cần toàn bộ `PlaceInput`
 * mà nơi gọi không có sẵn ở đây).
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function addVisit(
  input: InsertVisitInput,
  currentStatus: PlaceStatus,
): Promise<Visit> {
  assertOnline();
  const visit = await insertVisit(input);
  if (currentStatus !== 'visited') {
    const { error } = await supabase
      .from('places')
      .update({ status: 'visited' satisfies PlaceStatus })
      .eq('id', input.placeId);
    if (error) {
      throw mapPostgrestError(error);
    }
  }
  return visit;
}

/**
 * Xoá một lần đi. KHÔNG bao giờ đổi trạng thái của địa điểm (D16 — chỉ đổi
 * thủ công trong form).
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function removeVisit(id: string): Promise<void> {
  assertOnline();
  await deleteVisit(id);
}
