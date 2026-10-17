import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applyPlacePatch, withFavoritedAt } from './placeCache';
import { getPlace, listPlaces } from './placeRepository';
import {
  createPlace,
  deletePlace,
  setFavorite,
  updatePlace,
  type PhotoUploadProgress,
  type SavePlaceResult,
} from './placeService';
import { QUERY_KEYS } from './queryKeys';
import type { PhotoRef, PlaceInput, PlaceWithRelations } from './types';

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

/** Tham số cho `useSetFavorite`. */
export interface SetFavoriteVariables {
  id: string;
  /** `true` = đặt Yêu thích, `false` = bỏ Yêu thích. */
  favorited: boolean;
}

/** Bản cache cũ, giữ lại để trả về khi `useSetFavorite` lỗi. */
interface SetFavoriteContext {
  places: PlaceWithRelations[] | undefined;
  place: PlaceWithRelations | undefined;
}

/**
 * Đặt/bỏ Yêu thích với cập nhật lạc quan (P25 PLAN-UI-1.md): đổi cache ngay, lỗi thì trả lại
 * bản cũ, thành công thì ghi giá trị server. `networkMode: 'always'` để lỗi offline ném ngay
 * (`OfflineError`) thay vì tạm dừng.
 */
export function useSetFavorite() {
  const queryClient = useQueryClient();
  return useMutation<string | null, unknown, SetFavoriteVariables, SetFavoriteContext>({
    networkMode: 'always',
    mutationFn: ({ id, favorited }) => setFavorite(id, favorited),
    onMutate: async ({ id, favorited }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.places });
      const previous: SetFavoriteContext = {
        places: queryClient.getQueryData<PlaceWithRelations[]>(QUERY_KEYS.places),
        place: queryClient.getQueryData<PlaceWithRelations>(QUERY_KEYS.place(id)),
      };
      const optimisticValue = favorited ? new Date().toISOString() : null;
      applyPlacePatch(queryClient, id, (place) => withFavoritedAt(place, optimisticValue));
      return previous;
    },
    onError: (_error, { id }, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData(QUERY_KEYS.places, context.places);
      queryClient.setQueryData(QUERY_KEYS.place(id), context.place);
    },
    onSuccess: (favoritedAt, { id }) => {
      applyPlacePatch(queryClient, id, (place) => withFavoritedAt(place, favoritedAt));
    },
  });
}
