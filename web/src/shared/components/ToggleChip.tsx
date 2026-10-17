import { IonChip, IonIcon, IonLabel } from '@ionic/react';

export interface ToggleChipProps {
  /** Chữ hiển thị trên chip. */
  label: string;
  /** Chip đang được chọn hay không. */
  selected: boolean;
  /** Gọi khi người dùng bấm (hoặc nhấn Enter/Space) để bật/tắt chip. */
  onToggle: () => void;
  /** Icon ionicons hiện trước chữ (tuỳ chọn). */
  icon?: string;
}

/**
 * Chip bật/tắt dùng chung cho các hàng chọn nhãn/nhóm: chọn thì tô màu `primary`, không chọn
 * thì viền; có `role="button"`, `aria-pressed` và bấm được bằng Enter/Space.
 */
export function ToggleChip({
  label,
  selected,
  onToggle,
  icon,
}: ToggleChipProps): React.JSX.Element {
  return (
    <IonChip
      className="wtg-tap-target"
      color={selected ? 'primary' : undefined}
      outline={!selected}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onToggle}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      {icon && <IonIcon icon={icon} aria-hidden="true" />}
      <IonLabel>{label}</IonLabel>
    </IonChip>
  );
}
