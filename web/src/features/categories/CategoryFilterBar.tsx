import { useMemo } from 'react';
import { ToggleChip } from '../../shared/components/ToggleChip';
import { resolveCategoryIcon } from './categoryIcons';
import { useCategories } from './categoryQueries';
import { sortCategoriesByCreation } from './categoryRules';

export interface CategoryFilterBarProps {
  /** Id nhóm đang lọc; `null` = "Tất cả". */
  selected: string | null;
  onChange: (categoryId: string | null) => void;
}

/**
 * Hàng nhóm cuộn ngang để lọc trang vuốt thẻ, chọn MỘT nhóm hoặc "Tất cả" (P14 PLAN-UI-1.md).
 * Bấm lại chip đang chọn thì không đổi gì.
 */
export function CategoryFilterBar({
  selected,
  onChange,
}: CategoryFilterBarProps): React.JSX.Element {
  const { data: categories = [] } = useCategories();
  const sorted = useMemo(() => sortCategoriesByCreation(categories), [categories]);

  return (
    <div className="wtg-chip-row">
      <ToggleChip label="Tất cả" selected={selected === null} onToggle={() => onChange(null)} />
      {sorted.map((category) => (
        <ToggleChip
          key={category.id}
          label={category.name}
          icon={resolveCategoryIcon(category.icon)}
          selected={selected === category.id}
          onToggle={() => onChange(category.id)}
        />
      ))}
    </div>
  );
}
