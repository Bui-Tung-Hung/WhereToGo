import { IonInput, type InputCustomEvent } from '@ionic/react';
import { formatVndInput, parseVndInput } from '../money/vnd';

export interface PriceRangeValue {
  min: number | null;
  max: number | null;
}

export interface PriceRangeInputProps {
  min: number | null;
  max: number | null;
  onChange: (value: PriceRangeValue) => void;
}

/** Phân tích giá trị gõ trong ô nhập giá thành số VNĐ hoặc `null`. */
function parseFieldValue(raw: string | null | undefined): number | null {
  return parseVndInput(raw ?? '');
}

/** Định dạng số VNĐ để hiển thị lại trong ô nhập (dấu chấm ngăn cách hàng nghìn). */
function formatFieldValue(value: number | null): string {
  return value === null ? '' : formatVndInput(String(value));
}

/**
 * Hai ô nhập khoảng giá (VNĐ): "Từ" và "Đến", `inputmode="numeric"`, hậu
 * tố "₫" (mục 6.5, D20 PLAN.md).
 */
export function PriceRangeInput({ min, max, onChange }: PriceRangeInputProps): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <IonInput
        style={{ flex: 1 }}
        label="Từ"
        labelPlacement="stacked"
        inputmode="numeric"
        placeholder="0"
        value={formatFieldValue(min)}
        onIonInput={(event: InputCustomEvent) =>
          onChange({ min: parseFieldValue(event.detail.value), max })
        }
      >
        <span slot="end">₫</span>
      </IonInput>
      <IonInput
        style={{ flex: 1 }}
        label="Đến"
        labelPlacement="stacked"
        inputmode="numeric"
        placeholder="0"
        value={formatFieldValue(max)}
        onIonInput={(event: InputCustomEvent) =>
          onChange({ min, max: parseFieldValue(event.detail.value) })
        }
      >
        <span slot="end">₫</span>
      </IonInput>
    </div>
  );
}
