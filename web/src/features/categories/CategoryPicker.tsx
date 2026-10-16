import { IonChip, IonIcon, IonLabel, useIonAlert } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useMemo } from 'react';
import { toUserMessage } from '../../lib/errors';
import { ToggleChip } from '../../shared/components/ToggleChip';
import { nameErrorMessage, validateName } from '../../shared/text/nameValidation';
import { resolveCategoryIcon } from './categoryIcons';
import { useCategories, useCreateCategory } from './categoryQueries';
import { sortCategoriesByCreation } from './categoryRules';
import { CATEGORY_NAME_MAX_LENGTH } from './categorySchema';

export interface CategoryPickerProps {
  /** Id các nhóm đang được chọn cho địa điểm (bắt buộc ít nhất một — U42). */
  value: string[];
  onChange: (categoryIds: string[]) => void;
}

/**
 * Chọn nhóm cho một địa điểm trong form (mục 6.6 PLAN-UI-1.md): mỗi nhóm là một chip bật/tắt
 * (có biểu tượng), kèm chip "＋ Nhóm mới" mở hộp thoại nhập tên; tạo xong tự chọn nhóm vừa tạo.
 * Câu gợi ý và biểu tượng của nhóm mới để trống (dùng mặc định — M1).
 */
export function CategoryPicker({ value, onChange }: CategoryPickerProps): React.JSX.Element {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [presentAlert] = useIonAlert();
  const sorted = useMemo(() => sortCategoriesByCreation(categories), [categories]);

  function toggleCategory(categoryId: string): void {
    onChange(
      value.includes(categoryId) ? value.filter((id) => id !== categoryId) : [...value, categoryId],
    );
  }

  function showError(message: string): void {
    void presentAlert({ header: 'Không thể tạo nhóm', message, buttons: ['Đóng'] });
  }

  async function handleCreate(rawName: string): Promise<void> {
    const result = validateName(
      rawName,
      categories.map((category) => category.name),
      { maxLength: CATEGORY_NAME_MAX_LENGTH },
    );
    if (result.kind !== 'ok') {
      showError(nameErrorMessage(result.kind, 'nhóm', CATEGORY_NAME_MAX_LENGTH));
      return;
    }
    try {
      const created = await createCategory.mutateAsync({
        name: result.name,
        prompt: null,
        icon: null,
      });
      onChange([...value, created.id]);
    } catch (error) {
      showError(toUserMessage(error));
    }
  }

  function openCreateAlert(): void {
    void presentAlert({
      header: 'Nhóm mới',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Tên nhóm',
          attributes: { maxlength: CATEGORY_NAME_MAX_LENGTH },
        },
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
      {sorted.map((category) => (
        <ToggleChip
          key={category.id}
          label={category.name}
          icon={resolveCategoryIcon(category.icon)}
          selected={value.includes(category.id)}
          onToggle={() => toggleCategory(category.id)}
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
        <IonLabel>Nhóm mới</IonLabel>
      </IonChip>
    </div>
  );
}
