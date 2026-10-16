import { useNavigate } from 'react-router-dom';
import { resolveCategoryIcon, resolveCategoryPrompt } from '../categories/categoryIcons';
import type { Category } from '../categories/categoryRepository';
import type { PhotoRef } from '../places/types';
import { HomeCardLayout } from './HomeCardLayout';
import { PhotoCluster } from './PhotoCluster';

export interface CategoryCardProps {
  category: Category;
  /** Số địa điểm của nhóm (U3). */
  count: number;
  /** Ảnh mới thêm gần đây của nhóm (tối đa 5 — P21). */
  photos: readonly PhotoRef[];
  /** Vị trí của thẻ trong danh sách trang chủ. */
  cascadeIndex: number;
}

/** Thẻ một nhóm trên trang chủ (U3); bấm mở danh sách tạm lọc sẵn nhóm đó (P9). */
export function CategoryCard({
  category,
  count,
  photos,
  cascadeIndex,
}: CategoryCardProps): React.JSX.Element {
  const navigate = useNavigate();
  const icon = resolveCategoryIcon(category.icon);
  return (
    <HomeCardLayout
      icon={icon}
      label={category.name}
      prompt={resolveCategoryPrompt(category.prompt)}
      aside={
        count === 0 ? (
          <p className="wtg-home-card__empty">Chưa có địa điểm</p>
        ) : (
          <PhotoCluster photos={photos} count={count} fallbackIcon={icon} />
        )
      }
      ariaLabel={`${category.name}, ${count} địa điểm`}
      onOpen={() => navigate(`/categories/${category.id}`)}
      cascadeIndex={cascadeIndex}
    />
  );
}
