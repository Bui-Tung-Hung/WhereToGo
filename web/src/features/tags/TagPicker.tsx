import { IonChip, IonIcon, IonLabel, useIonAlert } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { toUserMessage } from '../../lib/errors';
import { ToggleChip } from '../../shared/components/ToggleChip';
import { nameErrorMessage, validateName } from '../../shared/text/nameValidation';
import { useCreateTag, useTags } from './tagQueries';

export interface TagPickerProps {
  /** Id các nhãn đang được chọn cho địa điểm. */
  value: string[];
  onChange: (tagIds: string[]) => void;
}

const MAX_NAME_LENGTH = 50;

/**
 * Chọn nhiều nhãn cho một địa điểm (mục 6.6 PLAN.md): mỗi nhãn là một chip
 * bật/tắt, kèm chip "＋ Nhãn mới" mở hộp thoại nhập tên (trim, 1–50 ký tự,
 * không trùng — kiểm bằng `validateName`); tạo xong tự chọn nhãn vừa tạo.
 */
export function TagPicker({ value, onChange }: TagPickerProps): React.JSX.Element {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const [presentAlert] = useIonAlert();

  function toggleTag(tagId: string): void {
    onChange(value.includes(tagId) ? value.filter((id) => id !== tagId) : [...value, tagId]);
  }

  function showError(message: string): void {
    void presentAlert({ header: 'Không thể tạo nhãn', message, buttons: ['Đóng'] });
  }

  async function handleCreate(rawName: string): Promise<void> {
    const result = validateName(
      rawName,
      tags.map((tag) => tag.name),
      { maxLength: MAX_NAME_LENGTH },
    );
    if (result.kind !== 'ok') {
      showError(nameErrorMessage(result.kind, 'nhãn', MAX_NAME_LENGTH));
      return;
    }
    try {
      const created = await createTag.mutateAsync(result.name);
      onChange([...value, created.id]);
    } catch (error) {
      showError(toUserMessage(error));
    }
  }

  function openCreateAlert(): void {
    void presentAlert({
      header: 'Nhãn mới',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Tên nhãn', attributes: { maxlength: 50 } },
      ],
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Tạo',
          handler: (data: { name?: string }) => {
            void handleCreate(data.name ?? '');
          },
        },
      ],
    });
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {tags.map((tag) => (
        <ToggleChip
          key={tag.id}
          label={tag.name}
          selected={value.includes(tag.id)}
          onToggle={() => toggleTag(tag.id)}
        />
      ))}
      <IonChip
        className="wtg-tap-target"
        outline
        role="button"
        tabIndex={0}
        onClick={openCreateAlert}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openCreateAlert();
          }
        }}
      >
        <IonIcon icon={addOutline} aria-hidden="true" />
        <IonLabel>Nhãn mới</IonLabel>
      </IonChip>
    </div>
  );
}
