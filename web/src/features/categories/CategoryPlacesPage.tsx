import { useParams } from 'react-router-dom';
import { PlaceListPage } from '../places/PlaceListPage';
import { useCategories } from './categoryQueries';

/**
 * Lối vào tạm `#/categories/:id` (P9 PLAN-UI-1.md): danh sách cũ lọc sẵn theo một nhóm, mở từ
 * thẻ nhóm trên trang chủ. Tiêu đề là tên nhóm ("Nhóm" khi chưa tải xong).
 */
export function CategoryPlacesPage(): React.JSX.Element {
  const { id = '' } = useParams<{ id: string }>();
  const { data: categories = [] } = useCategories();
  const category = categories.find((candidate) => candidate.id === id);

  return (
    <PlaceListPage
      mode="explore"
      title={category?.name ?? 'Nhóm'}
      presetCategoryId={id}
      emptyTitle="Nhóm này chưa có địa điểm"
      emptyMessage="Thêm địa điểm và chọn nhóm này."
    />
  );
}
