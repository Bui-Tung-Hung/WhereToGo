import { IonChip, IonIcon, IonLabel, useIonAlert } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { toUserMessage } from '../../lib/errors';
import { normalizeVi } from '../../shared/text/viNormalize';
import { useCreateTag, useTags } from './tagQueries';

export interface TagPickerProps {
  /** Id các nhãn đang được chọn cho địa điểm. */
  value: string[];
  onChange: (tagIds: string[]) => void;
}

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 50;

/**
 * Chọn nhiều nhãn cho một địa điểm (mục 6.6 PLAN.md): mỗi nhãn là một chip
 * bật/tắt, kèm chip "＋ Nhãn mới" mở hộp thoại nhập tên (trim, 1–50 ký tự,
 * không trùng — so bằng `normalizeVi`); tạo xong tự chọn nhãn vừa tạo.
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
    const trimmed = rawName.trim();
    if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
      showError(`Tên nhãn phải từ ${MIN_NAME_LENGTH} đến ${MAX_NAME_LENGTH} ký tự.`);
      return;
    }
    const normalized = normalizeVi(trimmed);
    if (tags.some((tag) => normalizeVi(tag.name) === normalized)) {
      showError('Nhãn này đã tồn tại.');
      return;
    }
    try {
      const created = await createTag.mutateAsync(trimmed);
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
      {tags.map((tag) => {
        const isSelected = value.includes(tag.id);
        return (
          <IonChip
            key={tag.id}
            className="wtg-tap-target"
            color={isSelected ? 'primary' : undefined}
            outline={!isSelected}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => toggleTag(tag.id)}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleTag(tag.id);
              }
            }}
          >
            <IonLabel>{tag.name}</IonLabel>
          </IonChip>
        );
      })}
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
