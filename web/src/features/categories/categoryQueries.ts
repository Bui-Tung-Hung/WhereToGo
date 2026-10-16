import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../places/placeQueries';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type Category,
} from './categoryRepository';
import type { CategoryInput } from './categorySchema';

/** Danh sách nhóm của user hiện tại. */
export function useCategories() {
  return useQuery({ queryKey: QUERY_KEYS.categories, queryFn: listCategories });
}

/** Làm mới `['categories']` và `['places']` (địa điểm hiển thị tên nhóm nên cần làm mới cùng). */
function useInvalidateCategories(): () => void {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places });
  };
}

/** Tạo một nhóm mới. */
export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation<Category, unknown, CategoryInput>({
    mutationFn: (input) => createCategory(input),
    onSuccess: invalidate,
  });
}

/** Tham số cho `useUpdateCategory`. */
export interface UpdateCategoryVariables {
  id: string;
  input: CategoryInput;
}

/** Sửa một nhóm. */
export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation<Category, unknown, UpdateCategoryVariables>({
    mutationFn: ({ id, input }) => updateCategory(id, input),
    onSuccess: invalidate,
  });
}

/** Xoá một nhóm. */
export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation<void, unknown, string>({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: invalidate,
  });
}
