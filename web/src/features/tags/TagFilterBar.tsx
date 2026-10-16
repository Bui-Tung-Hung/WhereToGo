import { ToggleChip } from '../../shared/components/ToggleChip';
import { useTags } from './tagQueries';

export interface TagFilterBarProps {
  /** Id các nhãn đang được chọn để lọc. */
  selected: string[];
  onChange: (tagIds: string[]) => void;
}

/**
 * Hàng nhãn cuộn ngang để lọc danh sách địa điểm, chọn nhiều (kiểu HOẶC —
 * D19 PLAN.md). Không hiện gì khi user chưa có nhãn nào.
 */
export function TagFilterBar({ selected, onChange }: TagFilterBarProps): React.JSX.Element | null {
  const { data: tags = [] } = useTags();

  if (tags.length === 0) {
    return null;
  }

  function toggle(tagId: string): void {
    onChange(
      selected.includes(tagId) ? selected.filter((id) => id !== tagId) : [...selected, tagId],
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
      {tags.map((tag) => (
        <ToggleChip
          key={tag.id}
          label={tag.name}
          selected={selected.includes(tag.id)}
          onToggle={() => toggle(tag.id)}
        />
      ))}
    </div>
  );
}
