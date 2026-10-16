import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonTitle,
  IonToolbar,
  useIonAlert,
  type InputCustomEvent,
} from '@ionic/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toUserMessage } from '../../lib/errors';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { nameErrorMessage, validateName } from '../../shared/text/nameValidation';
import {
  CATEGORY_ICON_KEYS,
  CATEGORY_ICON_LABELS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_PROMPT,
  type CategoryIconKey,
} from './categoryIcons';
import { useCreateCategory, useUpdateCategory } from './categoryQueries';
import type { Category } from './categoryRepository';
import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_PROMPT_MAX_LENGTH,
  categoryFormSchema,
  type CategoryFormValues,
  type CategoryInput,
} from './categorySchema';

export interface CategoryEditorFormProps {
  /** Nhóm đang sửa; `null` = tạo nhóm mới. */
  category: Category | null;
  /** Mọi nhóm hiện có, để kiểm trùng tên. */
  categories: readonly Category[];
  /** Gọi khi bấm "Huỷ" hoặc lưu xong (nơi gọi đóng sheet). */
  onDone: () => void;
}

/** Ô chọn biểu tượng: `null` = "Mặc định". */
interface IconOption {
  key: CategoryIconKey | null;
  icon: string;
  label: string;
}

const ICON_OPTIONS: readonly IconOption[] = [
  { key: null, icon: DEFAULT_CATEGORY_ICON, label: 'Mặc định' },
  ...CATEGORY_ICON_KEYS.map((key) => ({
    key,
    icon: CATEGORY_ICONS[key],
    label: CATEGORY_ICON_LABELS[key],
  })),
];

function isIconKey(value: string | null): value is CategoryIconKey {
  return value !== null && (CATEGORY_ICON_KEYS as readonly string[]).includes(value);
}

function buildDefaults(category: Category | null): CategoryFormValues {
  return {
    name: category?.name ?? '',
    prompt: category?.prompt ?? null,
    icon: category && isIconKey(category.icon) ? category.icon : null,
  };
}

/**
 * Nội dung sheet thêm/sửa nhóm (mục 6.8 PLAN-UI-1.md, kiểu C — M1): tên bắt buộc, câu gợi ý và
 * biểu tượng tuỳ chọn. Được mount mới mỗi lần sheet mở (`key` theo nhóm) nên không cần reset.
 * Nút "Lưu" bị khoá khi offline hoặc đang lưu (D13).
 */
export function CategoryEditorForm({
  category,
  categories,
  onDone,
}: CategoryEditorFormProps): React.JSX.Element {
  const isOnline = useOnlineStatus();
  const [presentAlert] = useIonAlert();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { control, handleSubmit, formState, setError } = useForm<
    CategoryFormValues,
    unknown,
    CategoryInput
  >({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: buildDefaults(category),
  });

  async function onSubmit(input: CategoryInput): Promise<void> {
    const validation = validateName(
      input.name,
      categories.map((candidate) => candidate.name),
      { maxLength: CATEGORY_NAME_MAX_LENGTH, excludeName: category?.name },
    );
    if (validation.kind !== 'ok') {
      setError('name', {
        message: nameErrorMessage(validation.kind, 'nhóm', CATEGORY_NAME_MAX_LENGTH),
      });
      return;
    }
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, input });
      } else {
        await createCategory.mutateAsync(input);
      }
      onDone();
    } catch (error) {
      void presentAlert({ header: 'Lỗi', message: toUserMessage(error), buttons: ['Đóng'] });
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="wtg-tap-target" onClick={onDone}>
              Huỷ
            </IonButton>
          </IonButtons>
          <IonTitle>{category ? 'Sửa nhóm' : 'Nhóm mới'}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              className="wtg-tap-target"
              strong
              disabled={!isOnline || formState.isSubmitting}
              onClick={() => void handleSubmit(onSubmit)()}
            >
              Lưu
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="wtg-page">
          <div className="wtg-group">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <IonInput
                  label="Tên"
                  labelPlacement="stacked"
                  maxlength={CATEGORY_NAME_MAX_LENGTH}
                  value={field.value}
                  onIonInput={(event: InputCustomEvent) => field.onChange(event.detail.value ?? '')}
                  onIonBlur={field.onBlur}
                />
              )}
            />
            {formState.errors.name && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="wtg-group">
            <Controller
              control={control}
              name="prompt"
              render={({ field }) => (
                <IonInput
                  label="Câu gợi ý"
                  labelPlacement="stacked"
                  maxlength={CATEGORY_PROMPT_MAX_LENGTH}
                  placeholder={DEFAULT_CATEGORY_PROMPT}
                  value={field.value ?? ''}
                  onIonInput={(event: InputCustomEvent) =>
                    field.onChange(event.detail.value || null)
                  }
                  onIonBlur={field.onBlur}
                />
              )}
            />
            {formState.errors.prompt && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.prompt.message}
              </p>
            )}
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Biểu tượng</p>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 44px)',
                    gap: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  {ICON_OPTIONS.map((option) => {
                    const isSelected = field.value === option.key;
                    return (
                      <button
                        key={option.key ?? 'default'}
                        type="button"
                        className="wtg-tap-target"
                        aria-label={option.label}
                        aria-pressed={isSelected}
                        onClick={() => field.onChange(option.key)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          color: 'var(--ion-text-color)',
                          border: isSelected
                            ? '2px solid var(--ion-color-primary)'
                            : '1px solid var(--ion-border-color)',
                        }}
                      >
                        <IonIcon icon={option.icon} aria-hidden="true" style={{ fontSize: 22 }} />
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>
      </IonContent>
    </>
  );
}
