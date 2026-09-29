import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../places/placeQueries';
import { createTag, deleteTag, listTags, renameTag, type Tag } from './tagRepository';

/** Danh sách nhãn của user hiện tại. */
export function useTags() {
  return useQuery({ queryKey: QUERY_KEYS.tags, queryFn: listTags });
}

/**
 * Tạo một nhãn mới. Thành công thì làm mới `['tags']` và `['places']` (mục
 * 6.6 PLAN.md — địa điểm hiển thị tên nhãn nên cần làm mới cùng).
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation<Tag, unknown, string>({
    mutationFn: (name) => createTag(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}

/** Tham số cho `useRenameTag`. */
export interface RenameTagVariables {
  id: string;
  name: string;
}

/** Đổi tên một nhãn. Thành công thì làm mới `['tags']` và `['places']`. */
export function useRenameTag() {
  const queryClient = useQueryClient();
  return useMutation<Tag, unknown, RenameTagVariables>({
    mutationFn: ({ id, name }) => renameTag(id, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}

/** Xoá một nhãn. Thành công thì làm mới `['tags']` và `['places']`. */
export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id) => deleteTag(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
    },
  });
}
