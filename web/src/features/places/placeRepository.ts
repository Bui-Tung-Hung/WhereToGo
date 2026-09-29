import type { PostgrestError } from '@supabase/supabase-js';
import { mapPostgrestError } from '../../lib/errors';
import { supabase } from '../../lib/supabaseClient';
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
  status: string;
  opening_hours: OpeningHours | null;
  created_at: string;
  updated_at: string;
}

interface PlaceRelationsRow extends PlaceColumnsRow {
  place_tags: { tag_id: string }[];
  photos: { id: string; drive_file_id: string; position: number }[];
  visits: { visited_on: string }[];
}

const PLACE_COLUMNS =
  'id, user_id, name, address, latitude, longitude, google_maps_url, google_place_ref, ' +
  'rating, price_min_vnd, price_max_vnd, notes, status, opening_hours, created_at, updated_at';

const PLACE_WITH_RELATIONS_COLUMNS = `${PLACE_COLUMNS}, place_tags(tag_id), photos(id, drive_file_id, position), visits(visited_on)`;

/** Đọc `{ data, error }` của supabase-js, ném `ApiError` (qua `mapPostgrestError`) nếu có lỗi. */
async function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    throw mapPostgrestError(error);
  }
  return data as T;
}

/** Chỉ kiểm tra lỗi của một lời gọi supabase-js không trả dữ liệu (ví dụ `delete`). */
async function assertNoError(
  promise: PromiseLike<{ error: PostgrestError | null }>,
): Promise<void> {
  const { error } = await promise;
  if (error) {
    throw mapPostgrestError(error);
  }
}

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
    status: row.status as PlaceStatus,
    openingHours: row.opening_hours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Đổi một dòng `places` (kèm quan hệ `place_tags`/`photos`/`visits` đã
 * join) sang `PlaceWithRelations`.
 *
 * LUÔN tự sắp `photos` theo `position` tăng dần và `visitDates` giảm dần
 * ngay tại đây, KHÔNG dựa vào thứ tự PostgREST trả về (dù truy vấn đã có
 * `order`, PostgREST không đảm bảo thứ tự của các bảng con được nhúng).
 */
export function mapPlaceRow(row: PlaceRelationsRow): PlaceWithRelations {
  return {
    ...mapPlaceColumns(row),
    tagIds: row.place_tags.map((placeTag) => placeTag.tag_id),
    photos: [...row.photos]
      .sort((a, b) => a.position - b.position)
      .map((photo) => ({
        id: photo.id,
        driveFileId: photo.drive_file_id,
        position: photo.position,
      })),
    visitDates: row.visits.map((visit) => visit.visited_on).sort((a, b) => b.localeCompare(a)),
  };
}

/** Chuyển các trường của `PlaceInput` (camelCase) sang tên cột của bảng `places` (snake_case). */
function toColumns(
  input: PlaceInput,
): Omit<PlaceColumnsRow, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
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

/** Tạo một địa điểm mới (chưa gắn nhãn/ảnh — xem `placeService.createPlace`). */
export async function insertPlace(input: PlaceInput): Promise<Place> {
  const row = await unwrap<PlaceColumnsRow>(
    supabase.from('places').insert(toColumns(input)).select(PLACE_COLUMNS).single(),
  );
  return mapPlaceColumns(row);
}

/** Cập nhật các trường của một địa điểm đã có (không đụng tới nhãn/ảnh/lần đi). */
export async function updatePlace(id: string, input: PlaceInput): Promise<Place> {
  const row = await unwrap<PlaceColumnsRow>(
    supabase.from('places').update(toColumns(input)).eq('id', id).select(PLACE_COLUMNS).single(),
  );
  return mapPlaceColumns(row);
}

/** Xoá một địa điểm (`on delete cascade` tự xoá `place_tags`/`photos`/`visits` liên quan). */
export async function deletePlaceRow(id: string): Promise<void> {
  await assertNoError(supabase.from('places').delete().eq('id', id));
}

/**
 * Đồng bộ nhãn của một địa điểm về đúng danh sách `tagIds`: xoá các dòng
 * `place_tags` thừa, chèn các dòng còn thiếu (không đụng tới các dòng đã
 * đúng sẵn).
 */
export async function replacePlaceTags(placeId: string, tagIds: readonly string[]): Promise<void> {
  const existingRows = await unwrap<{ tag_id: string }[]>(
    supabase.from('place_tags').select('tag_id').eq('place_id', placeId),
  );
  const existingIds = new Set((existingRows ?? []).map((row) => row.tag_id));
  const nextIds = new Set(tagIds);

  const idsToRemove = [...existingIds].filter((id) => !nextIds.has(id));
  const idsToAdd = [...nextIds].filter((id) => !existingIds.has(id));

  if (idsToRemove.length > 0) {
    await assertNoError(
      supabase.from('place_tags').delete().eq('place_id', placeId).in('tag_id', idsToRemove),
    );
  }
  if (idsToAdd.length > 0) {
    await assertNoError(
      supabase
        .from('place_tags')
        .insert(idsToAdd.map((tagId) => ({ place_id: placeId, tag_id: tagId }))),
    );
  }
}
