import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../places/placeQueries';
import type { PlaceStatus } from '../places/types';
import { addVisit, removeVisit } from './visitService';
import { listVisits, type InsertVisitInput, type Visit } from './visitRepository';

/** Danh sách các lần đi của một địa điểm, sắp theo ngày giảm dần. */
export function useVisits(placeId: string) {
  return useQuery({ queryKey: QUERY_KEYS.visits(placeId), queryFn: () => listVisits(placeId) });
}

/** Tham số cho `useAddVisit`. */
export interface AddVisitVariables {
  input: InsertVisitInput;
  currentStatus: PlaceStatus;
}

/**
 * Thêm một lần đi. Thành công thì làm mới `['visits', placeId]` và
 * `['places']` (trạng thái địa điểm có thể vừa tự chuyển "Đã đi" — D16).
 */
export function useAddVisit(placeId: string) {
  const queryClient = useQueryClient();
  return useMutation<Visit, unknown, AddVisitVariables>({
    mutationFn: ({ input, currentStatus }) => addVisit(input, currentStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.visits(placeId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}

/**
 * Xoá một lần đi — KHÔNG đổi trạng thái của địa điểm (D16). Thành công thì
 * làm mới `['visits', placeId]` và `['places']`.
 */
export function useDeleteVisit(placeId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id) => removeVisit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.visits(placeId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}
