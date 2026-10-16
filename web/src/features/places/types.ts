import type { OpeningHours } from '../opening-hours/openingHours';
import type { PlaceFormValues } from './placeSchema';

/** Trạng thái của một địa điểm (D16 PLAN.md), loại trừ lẫn nhau. */
export type PlaceStatus = 'interested' | 'not_visited' | 'visited';

/**
 * Một địa điểm, các cột của bảng `public.places` đổi sang camelCase
 * (mục 4.1, 6.6 PLAN.md). Các trường tuỳ chọn dùng `null` giống cột DB
 * tương ứng (không phải `undefined`).
 */
export interface Place {
  id: string;
  userId: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  googlePlaceRef: string | null;
  rating: number | null;
  priceMinVnd: number | null;
  priceMaxVnd: number | null;
  notes: string | null;
  /** Câu chuyện về địa điểm, khác Ghi chú (U25 UI-REDESIGN.md). */
  story: string | null;
  status: PlaceStatus;
  /** `null` = "chưa rõ giờ" (D18). */
  openingHours: OpeningHours | null;
  /** Điểm hứng thú cộng dồn từ các lượt vuốt (U23, U37); DB tự cập nhật, form không ghi. */
  interestScore: number;
  /** Thời điểm đánh dấu Yêu thích (ISO); `null` = không yêu thích (U24). */
  favoritedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Một ảnh của địa điểm — chỉ các trường cần cho hiển thị/thao tác danh sách ảnh. */
export interface PhotoRef {
  id: string;
  driveFileId: string;
  position: number;
  /** Thời điểm thêm ảnh (ISO), dùng để chọn "ảnh mới thêm gần đây" (U3). */
  createdAt: string;
}

/**
 * Một địa điểm kèm các quan hệ của nó, dùng để hiển thị (danh sách, chi
 * tiết): nhóm, nhãn đã gắn, ảnh, và ngày của các lần đi.
 *
 * `photoRepository.mapPlaceRow` LUÔN trả `photos` đã sắp theo `position`
 * tăng dần và `visitDates` giảm dần — không phụ thuộc thứ tự server trả về.
 */
export interface PlaceWithRelations extends Place {
  /** Id các nhóm của địa điểm (mỗi địa điểm có ít nhất một nhóm, U42). */
  categoryIds: string[];
  tagIds: string[];
  photos: PhotoRef[];
  visitDates: string[];
}

/**
 * Các trường form của một địa điểm (tạo/sửa) — chính là kiểu đã kiểm định
 * bởi `placeFormSchema` (`./placeSchema.ts`), tái xuất ở đây để phần còn lại
 * của app (`placeRepository`, `placeService`, `PlaceFormPage`) chỉ cần biết
 * đến một cái tên duy nhất, `PlaceInput`.
 */
export type PlaceInput = PlaceFormValues;
