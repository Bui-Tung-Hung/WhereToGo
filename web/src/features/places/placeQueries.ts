import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlace, listPlaces } from './placeRepository';
import {
  createPlace,
  deletePlace,
  updatePlace,
  type PhotoUploadProgress,
  type SavePlaceResult,
} from './placeService';
import type { PhotoRef, PlaceInput, PlaceWithRelations } from './types';

/**
 * Khoá truy vấn dùng chung cho toàn bộ cụm tính năng địa điểm (places, tags,
 * visits — mục 6.6 PLAN.md liệt kê cả 4 khoá dưới bullet `placeQueries.ts`).
 * `tagQueries.ts` và `visitQueries.ts` import từ đây thay vì tự viết lại
 * chuỗi khoá, để tránh gõ nhầm/khoá trôi dạt giữa các file.
 */
export const QUERY_KEYS = {
  places: ['places'] as const,
  place: (id: string) => ['places', id] as const,
  tags: ['tags'] as const,
  visits: (placeId: string) => ['visits', placeId] as const,
};

/** Danh sách toàn bộ địa điểm của user hiện tại. */
export function usePlaces() {
  return useQuery({ queryKey: QUERY_KEYS.places, queryFn: listPlaces });
}

/** Một địa điểm theo id — lấy tạm từ dữ liệu `['places']` đã có trong cache (nếu có) trong lúc chờ tải. */
export function usePlace(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: QUERY_KEYS.place(id),
    queryFn: () => getPlace(id),
    initialData: () => {
      const places = queryClient.getQueryData<PlaceWithRelations[]>(QUERY_KEYS.places);
      return places?.find((place) => place.id === id);
    },
  });
}

/** Tham số cho `useCreatePlace`. */
export interface CreatePlaceVariables {
  input: PlaceInput;
  photos: File[];
  onProgress?: PhotoUploadProgress;
}

/** Tạo địa điểm mới; thành công thì làm mới danh sách `['places']`. */
export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation<SavePlaceResult, unknown, CreatePlaceVariables>({
    mutationFn: ({ input, photos, onProgress }) => createPlace(input, photos, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}

/** Tham số cho `useUpdatePlace`. */
export interface UpdatePlaceVariables {
  id: string;
  input: PlaceInput;
  newPhotos: File[];
  removedPhotos: PhotoRef[];
  onProgress?: PhotoUploadProgress;
}

/** Cập nhật một địa điểm; thành công thì làm mới danh sách `['places']`. */
export function useUpdatePlace() {
  const queryClient = useQueryClient();
  return useMutation<SavePlaceResult, unknown, UpdatePlaceVariables>({
    mutationFn: ({ id, input, newPhotos, removedPhotos, onProgress }) =>
      updatePlace(id, input, newPhotos, removedPhotos, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}

/** Xoá một địa điểm; thành công thì làm mới danh sách `['places']`. */
export function useDeletePlace() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, PlaceWithRelations>({
    mutationFn: (place) => deletePlace(place),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}
