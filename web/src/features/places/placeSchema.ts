import { z } from 'zod';
import { isSupportedMapsUrl } from '../maps-link/parseGoogleMapsUrl';
import { validateWeek, type OpeningHours } from '../opening-hours/openingHours';

/** `PlaceStatus` lặp lại dưới dạng literal (thay vì import từ `./types`) để tránh vòng lặp
 * import `types.ts` → `placeSchema.ts` → `types.ts` (`types.ts` tái xuất `PlaceInput` từ đây). */
const PLACE_STATUSES = ['interested', 'not_visited', 'visited'] as const;

/** Giá VNĐ: số nguyên không âm, hoặc `null` khi chưa nhập (D20 PLAN.md). */
const vndAmountSchema = z.number().int().min(0).nullable();

/**
 * Zod schema cho form địa điểm (mục 6.6 PLAN.md). Đây là NGUỒN CHUẨN cho
 * kiểu `PlaceInput` (`./types.ts` tái xuất `PlaceFormValues` bên dưới) —
 * tránh hai định nghĩa kiểu trôi dạt khỏi nhau.
 *
 * Quy ước: các trường text tuỳ chọn (`address`, `googleMapsUrl`,
 * `googlePlaceRef`, `notes`) dùng `null` cho "chưa nhập", giống cột DB
 * tương ứng — nơi hiển thị (form) tự quy đổi `null` ⇄ `''` khi cần, cùng
 * cách `PriceRangeInput` đã làm với `number | null`.
 */
export const placeFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên không được để trống').max(200, 'Tên tối đa 200 ký tự'),
    address: z.string().max(500, 'Địa chỉ tối đa 500 ký tự').nullable(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    googleMapsUrl: z
      .string()
      .max(2000)
      .nullable()
      .refine((value) => !value || isSupportedMapsUrl(value), {
        message: 'Link Google Maps không hợp lệ',
      }),
    googlePlaceRef: z.string().max(300).nullable(),
    rating: z.number().int().min(1).max(5).nullable(),
    priceMinVnd: vndAmountSchema,
    priceMaxVnd: vndAmountSchema,
    notes: z.string().max(5000, 'Ghi chú tối đa 5000 ký tự').nullable(),
    status: z.enum(PLACE_STATUSES),
    openingHours: z
      .custom<OpeningHours | null>()
      .nullable()
      .refine((value) => value === null || validateWeek(value), {
        message: 'Giờ mở cửa không hợp lệ',
      }),
    tagIds: z.array(z.string().uuid()),
  })
  .refine((data) => (data.latitude === null) === (data.longitude === null), {
    message: 'Cần nhập đủ vĩ độ và kinh độ, hoặc để trống cả hai',
    path: ['latitude'],
  })
  .refine(
    (data) =>
      data.priceMinVnd === null ||
      data.priceMaxVnd === null ||
      data.priceMinVnd <= data.priceMaxVnd,
    { message: 'Giá thấp nhất phải nhỏ hơn hoặc bằng giá cao nhất', path: ['priceMinVnd'] },
  );

/** Giá trị đã qua kiểm định của form địa điểm — nguồn chuẩn cho `PlaceInput` (`./types.ts`). */
export type PlaceFormValues = z.infer<typeof placeFormSchema>;
