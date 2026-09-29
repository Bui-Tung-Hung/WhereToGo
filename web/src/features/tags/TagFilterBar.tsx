import { IonChip, IonLabel } from '@ionic/react';
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
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.id);
        return (
          <IonChip
            key={tag.id}
            className="wtg-tap-target"
            color={isSelected ? 'primary' : undefined}
            outline={!isSelected}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => toggle(tag.id)}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle(tag.id);
              }
            }}
          >
            <IonLabel>{tag.name}</IonLabel>
          </IonChip>
        );
      })}
    </div>
  );
}
