import { IonButton, IonIcon } from '@ionic/react';
import { imagesOutline } from 'ionicons/icons';
import { useRef, type ChangeEvent } from 'react';

export interface PhotoPickerProps {
  onPick: (files: File[]) => void;
}

/**
 * Nút "Thêm ảnh" (mục 6.6 PLAN.md): mở `<input type="file" multiple>` ẩn,
 * không đặt `capture` để iOS cho chọn giữa chụp ảnh mới hoặc thư viện có sẵn.
 */
export function PhotoPicker({ onPick }: PhotoPickerProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const files = event.target.files ? Array.from(event.target.files) : [];
    // Cho phép chọn lại đúng (các) file cũ sau lần chọn này.
    event.target.value = '';
    if (files.length > 0) {
      onPick(files);
    }
  }

  return (
    <>
      <IonButton
        className="wtg-tap-target"
        fill="outline"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <IonIcon icon={imagesOutline} slot="start" aria-hidden="true" />
        Thêm ảnh
      </IonButton>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleChange}
        aria-label="Chọn ảnh để thêm"
      />
    </>
  );
}
