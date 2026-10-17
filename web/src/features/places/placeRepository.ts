import { supabase } from '../../lib/supabaseClient';
import { assertNoError, unwrap } from '../../lib/supabaseResult';
import type { OpeningHours } from '../opening-hours/openingHours';
import type { Place, PlaceInput, PlaceStatus, PlaceWithRelations } from './types';

interface PlaceColumnsRow {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  google_place_ref: string | null;
  rating: number | null;
  price_min_vnd: number | null;
  price_max_vnd: number | null;
  notes: string | null;
  story: string | null;
  status: string;
  opening_hours: OpeningHours | null;
  interest_score: number;
  favorited_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PlaceRelationsRow extends PlaceColumnsRow {
  place_categories: { category_id: string }[];
  place_tags: { tag_id: string }[];
  photos: { id: string; drive_file_id: string; position: number; created_at: string }[];
  visits: { visited_on: string }[];
}

const PLACE_COLUMNS =
  'id, user_id, name, address, latitude, longitude, google_maps_url, google_place_ref, ' +
  'rating, price_min_vnd, price_max_vnd, notes, story, status, opening_hours, interest_score, ' +
  'favorited_at, created_at, updated_at';

const PLACE_WITH_RELATIONS_COLUMNS = `${PLACE_COLUMNS}, place_categories(category_id), place_tags(tag_id), photos(id, drive_file_id, position, created_at), visits(visited_on)`;

/** Bảng nối giữa địa điểm và nhóm/nhãn, cùng tên cột id phía bên kia. */
type JoinTable = 'place_tags' | 'place_categories';
type JoinColumn = 'tag_id' | 'category_id';

function mapPlaceColumns(row: PlaceColumnsRow): Place {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    googleMapsUrl: row.google_maps_url,
    googlePlaceRef: row.google_place_ref,
    rating: row.rating,
    priceMinVnd: row.price_min_vnd,
    priceMaxVnd: row.price_max_vnd,
    notes: row.notes,
    story: row.story,
    status: row.status as PlaceStatus,
    openingHours: row.opening_hours,
    interestScore: row.interest_score,
    favoritedAt: row.favorited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Đổi một dòng `places` (kèm quan hệ `place_categories`/`place_tags`/`photos`/`visits` đã
 * join) sang `PlaceWithRelations`.
 *
 * LUÔN tự sắp `photos` theo `position` tăng dần và `visitDates` giảm dần
 * ngay tại đây, KHÔNG dựa vào thứ tự PostgREST trả về (dù truy vấn đã có
 * `order`, PostgREST không đảm bảo thứ tự của các bảng con được nhúng).
 */
export function mapPlaceRow(row: PlaceRelationsRow): PlaceWithRelations {
  return {
    ...mapPlaceColumns(row),
    categoryIds: row.place_categories.map((placeCategory) => placeCategory.category_id),
    tagIds: row.place_tags.map((placeTag) => placeTag.tag_id),
    photos: [...row.photos]
      .sort((a, b) => a.position - b.position)
      .map((photo) => ({
        id: photo.id,
        driveFileId: photo.drive_file_id,
        position: photo.position,
        createdAt: photo.created_at,
      })),
    visitDates: row.visits.map((visit) => visit.visited_on).sort((a, b) => b.localeCompare(a)),
  };
}

/**
 * Chuyển các trường của `PlaceInput` (camelCase) sang tên cột của bảng `places` (snake_case).
 * Form không bao giờ ghi `interest_score` (DB tự cập nhật) và `favorited_at` (nút sao).
 */
function toColumns(
  input: PlaceInput,
): Omit<
  PlaceColumnsRow,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'interest_score' | 'favorited_at'
> {
  return {
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    google_maps_url: input.googleMapsUrl,
    google_place_ref: input.googlePlaceRef,
    rating: input.rating,
    price_min_vnd: input.priceMinVnd,
    price_max_vnd: input.priceMaxVnd,
    notes: input.notes,
    story: input.story,
    status: input.status,
    opening_hours: input.openingHours,
  };
}

/**
 * Danh sách địa điểm của user hiện tại (RLS lọc theo `auth.uid()`), kèm
 * quan hệ, sắp theo `updated_at` giảm dần.
 */
export async function listPlaces(): Promise<PlaceWithRelations[]> {
  const rows = await unwrap<PlaceRelationsRow[]>(
    supabase
      .from('places')
      .select(PLACE_WITH_RELATIONS_COLUMNS)
      .order('updated_at', { ascending: false }),
  );
  return (rows ?? []).map(mapPlaceRow);
}

/** Một địa điểm theo id, kèm quan hệ. */
export async function getPlace(id: string): Promise<PlaceWithRelations> {
  const row = await unwrap<PlaceRelationsRow>(
    supabase.from('places').select(PLACE_WITH_RELATIONS_COLUMNS).eq('id', id).single(),
  );
  return mapPlaceRow(row);
}

/** Tạo một địa điểm mới (chưa gắn nhóm/nhãn/ảnh — xem `placeService.createPlace`). */
export async function insertPlace(input: PlaceInput): Promise<Place> {
  const row = await unwrap<PlaceColumnsRow>(
    supabase.from('places').insert(toColumns(input)).select(PLACE_COLUMNS).single(),
  );
  return mapPlaceColumns(row);
}

/** Cập nhật các trường của một địa điểm đã có (không đụng tới nhóm/nhãn/ảnh/lần đi). */
export async function updatePlace(id: string, input: PlaceInput): Promise<Place> {
  const row = await unwrap<PlaceColumnsRow>(
    supabase.from('places').update(toColumns(input)).eq('id', id).select(PLACE_COLUMNS).single(),
  );
  return mapPlaceColumns(row);
}

/**
 * Đặt hoặc bỏ Yêu thích: cập nhật đúng một cột `favorited_at` (nên không chạy trigger
 * `updated_at`, quán không nhảy lên "Mới cập nhật").
 *
 * @returns Giá trị `favorited_at` server đã lưu.
 */
export async function updatePlaceFavorite(
  id: string,
  favoritedAt: string | null,
): Promise<string | null> {
  const row = await unwrap<{ favorited_at: string | null }>(
    supabase
      .from('places')
      .update({ favorited_at: favoritedAt })
      .eq('id', id)
      .select('favorited_at')
      .single(),
  );
  return row.favorited_at;
}

/** Xoá một địa điểm (`on delete cascade` tự xoá nhóm/nhãn/ảnh/lần đi/lượt vuốt liên quan). */
export async function deletePlaceRow(id: string): Promise<void> {
  await assertNoError(supabase.from('places').delete().eq('id', id));
}

/**
 * Đồng bộ các dòng của một bảng nối về đúng danh sách `ids`: xoá các dòng
 * thừa, chèn các dòng còn thiếu (không đụng tới các dòng đã đúng sẵn).
 */
async function replaceJoinRows(
  table: JoinTable,
  column: JoinColumn,
  placeId: string,
  ids: readonly string[],
): Promise<void> {
  const existingRows = await unwrap<Record<string, string>[]>(
    supabase.from(table).select(column).eq('place_id', placeId),
  );
  const existingIds = new Set(
    (existingRows ?? []).map((row) => row[column]).filter((id): id is string => id !== undefined),
  );
  const nextIds = new Set(ids);

  const idsToRemove = [...existingIds].filter((id) => !nextIds.has(id));
  const idsToAdd = [...nextIds].filter((id) => !existingIds.has(id));

  if (idsToRemove.length > 0) {
    await assertNoError(
      supabase.from(table).delete().eq('place_id', placeId).in(column, idsToRemove),
    );
  }
  if (idsToAdd.length > 0) {
    await assertNoError(
      supabase.from(table).insert(idsToAdd.map((id) => ({ place_id: placeId, [column]: id }))),
    );
  }
}

/** Đồng bộ nhãn của một địa điểm về đúng danh sách `tagIds`. */
export async function replacePlaceTags(placeId: string, tagIds: readonly string[]): Promise<void> {
  await replaceJoinRows('place_tags', 'tag_id', placeId, tagIds);
}

/** Đồng bộ nhóm của một địa điểm về đúng danh sách `categoryIds`. */
export async function replacePlaceCategories(
  placeId: string,
  categoryIds: readonly string[],
): Promise<void> {
  await replaceJoinRows('place_categories', 'category_id', placeId, categoryIds);
}
