import { IonButton, IonIcon, useIonAlert, useIonToast } from '@ionic/react';
import { linkOutline } from 'ionicons/icons';
import { toUserMessage } from '../../lib/errors';
import { extractFromMapsLink } from './mapsLinkService';
import type { ParsedMapsLink } from './parseGoogleMapsUrl';

export interface PasteMapsLinkButtonProps {
  onParsed: (result: ParsedMapsLink) => void;
}

const SUCCESS_MESSAGE = 'Đã lấy tên và vị trí';
const TOAST_DURATION_MS = 2500;

/**
 * Nút dán nhanh link Google Maps (mục 6.6 PLAN.md): đọc clipboard NGAY
 * trong cử chỉ chạm (Safari trên iOS chỉ cho `navigator.clipboard.readText`
 * chạy trực tiếp trong handler của một thao tác người dùng). Đọc lỗi hoặc
 * clipboard rỗng → mở `IonAlert` có ô dán tay thay thế.
 */
export function PasteMapsLinkButton({ onParsed }: PasteMapsLinkButtonProps): React.JSX.Element {
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  async function processText(text: string): Promise<void> {
    try {
      const result = await extractFromMapsLink(text);
      onParsed(result);
      await presentToast({
        message: SUCCESS_MESSAGE,
        duration: TOAST_DURATION_MS,
        color: 'success',
      });
    } catch (error) {
      await presentToast({
        message: toUserMessage(error),
        duration: TOAST_DURATION_MS,
        color: 'danger',
      });
    }
  }

  function openManualPasteAlert(): void {
    void presentAlert({
      header: 'Dán link Google Maps',
      inputs: [{ name: 'text', type: 'textarea', placeholder: 'Dán link vào đây' }],
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Dùng link này',
          handler: (data: { text?: string }) => {
            const text = (data.text ?? '').trim();
            if (text) {
              void processText(text);
            }
          },
        },
      ],
    });
  }

  async function handleTap(): Promise<void> {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      openManualPasteAlert();
      return;
    }
    if (!text.trim()) {
      openManualPasteAlert();
      return;
    }
    await processText(text);
  }

  return (
    <IonButton
      className="wtg-tap-target"
      fill="outline"
      type="button"
      onClick={() => void handleTap()}
    >
      <IonIcon icon={linkOutline} slot="start" aria-hidden="true" />
      Dán link Google Maps
    </IonButton>
  );
}
