import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useRef, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { toUserMessage } from '../../lib/errors';
import { useAuth } from '../auth/useAuth';
import { signInWithGoogle, signOut } from '../auth/authService';
import { getPhotoFolderId } from '../google/driveFolderApi';
import { uploadFileToDrive } from '../google/driveUpload';
import { getDriveAccessToken } from '../google/googleTokenService';
import { extractFromMapsLink } from '../maps-link/mapsLinkService';
import { prepareImageForUpload } from '../photos/imageConversion';
import { AuthedImage } from '../photos/AuthedImage';
import type { ParsedMapsLink } from '../maps-link/parseGoogleMapsUrl';

const MAX_LOG_ENTRIES = 20;

/** `true` nếu app đang chạy ở chế độ standalone (đã "Thêm vào Màn hình chính"). */
function isStandaloneDisplayMode(): boolean {
  const matchesMediaQuery = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return matchesMediaQuery || iosStandalone;
}

interface UploadedFile {
  fileId: string;
  sizeBytes: number;
  elapsedMs: number;
}

/**
 * Trang thử nghiệm dùng riêng ở Giai đoạn B để kiểm chứng luồng đăng nhập,
 * lấy access token, upload/hiển thị ảnh Drive và phân tích link Maps trên
 * thiết bị thật trước khi xây tính năng đầy đủ (mục 6.6, Nghiệm thu Spike
 * ở mục 10 PLAN.md). Bị xoá ở Giai đoạn C (bước 69).
 */
export function SpikePage(): React.JSX.Element {
  const { user, status } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [accessTokenInfo, setAccessTokenInfo] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [mapsLinkInput, setMapsLinkInput] = useState('');
  const [parsedMapsLink, setParsedMapsLink] = useState<ParsedMapsLink | null>(null);

  function log(event: string): void {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogEntries((previous) => [`${timestamp} — ${event}`, ...previous].slice(0, MAX_LOG_ENTRIES));
  }

  async function handleFetchAccessToken(): Promise<void> {
    const startedAt = performance.now();
    try {
      const token = await getDriveAccessToken();
      const elapsedMs = Math.round(performance.now() - startedAt);
      // Không bao giờ log giá trị token, chỉ độ dài để xác nhận có lấy được.
      setAccessTokenInfo(`Đã lấy access token (${token.length} ký tự) sau ${elapsedMs} ms`);
      log(`Lấy access token thành công (${elapsedMs} ms)`);
    } catch (error) {
      log(`Lấy access token thất bại: ${toUserMessage(error)}`);
    }
  }

  async function handlePickAndUploadFile(fileList: FileList | null): Promise<void> {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    const startedAt = performance.now();
    try {
      log(`Bắt đầu upload "${file.name}" (${file.size} bytes)`);
      const prepared = await prepareImageForUpload(file);
      const [folderId, accessToken] = await Promise.all([getPhotoFolderId(), getDriveAccessToken()]);
      const info = await uploadFileToDrive({
        file: prepared,
        folderId,
        accessToken,
        fileName: `wtg_spike_${Date.now()}.${prepared.type === 'image/png' ? 'png' : 'jpg'}`,
      });
      const elapsedMs = Math.round(performance.now() - startedAt);
      setUploadedFile({ fileId: info.id, sizeBytes: info.size, elapsedMs });
      log(`Upload thành công: fileId=${info.id}, ${info.size} bytes, ${elapsedMs} ms`);
    } catch (error) {
      log(`Upload thất bại: ${toUserMessage(error)}`);
    }
  }

  async function handleDeleteUploadedFile(): Promise<void> {
    if (!uploadedFile) {
      return;
    }
    try {
      await apiClient.delete(`/api/photos/${uploadedFile.fileId}`);
      log(`Đã xoá file ${uploadedFile.fileId}`);
      setUploadedFile(null);
    } catch (error) {
      log(`Xoá file thất bại: ${toUserMessage(error)}`);
    }
  }

  async function handleParseMapsLink(): Promise<void> {
    try {
      const result = await extractFromMapsLink(mapsLinkInput);
      setParsedMapsLink(result);
      log(`Phân tích link Maps thành công: ${result.name ?? '(không có tên)'}`);
    } catch (error) {
      setParsedMapsLink(null);
      log(`Phân tích link Maps thất bại: ${toUserMessage(error)}`);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Spike</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList inset>
          <IonItem lines="none">
            <IonLabel>
              <h2 className="wtg-heading">Chế độ hiển thị</h2>
              <p>{isStandaloneDisplayMode() ? 'Standalone (đã thêm vào MH chính)' : 'Trình duyệt thường'}</p>
            </IonLabel>
          </IonItem>

          <IonItem lines="none">
            <IonLabel>
              <h2 className="wtg-heading">Đăng nhập</h2>
              <p>{status === 'signed_in' ? (user?.email ?? '(không có email)') : 'Chưa đăng nhập'}</p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            {status === 'signed_in' ? (
              <IonButton onClick={() => void signOut()}>Đăng xuất</IonButton>
            ) : (
              <IonButton onClick={() => void signInWithGoogle()}>Đăng nhập bằng Google</IonButton>
            )}
          </IonItem>

          <IonItem lines="none">
            <IonLabel>
              <h2 className="wtg-heading">Access token Drive</h2>
              <p>{accessTokenInfo ?? 'Chưa lấy'}</p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonButton onClick={() => void handleFetchAccessToken()}>Lấy access token</IonButton>
          </IonItem>

          <IonItem lines="none">
            <IonLabel>
              <h2 className="wtg-heading">Chọn ảnh & upload</h2>
              {uploadedFile && (
                <p>
                  fileId={uploadedFile.fileId}, {uploadedFile.sizeBytes} bytes, {uploadedFile.elapsedMs} ms
                </p>
              )}
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(event) => void handlePickAndUploadFile(event.target.files)}
            />
            <IonButton onClick={() => fileInputRef.current?.click()}>Chọn ảnh &amp; upload</IonButton>
            <IonButton
              color="danger"
              fill="outline"
              disabled={!uploadedFile}
              onClick={() => void handleDeleteUploadedFile()}
            >
              Xoá file vừa upload
            </IonButton>
          </IonItem>
          {uploadedFile && (
            <IonItem lines="none">
              <AuthedImage
                driveFileId={uploadedFile.fileId}
                size={400}
                alt="Ảnh thu nhỏ 400"
                className="wtg-list-thumb"
              />
              <AuthedImage
                driveFileId={uploadedFile.fileId}
                size={1600}
                alt="Ảnh thu nhỏ 1600"
                className="wtg-list-thumb"
              />
            </IonItem>
          )}

          <IonItem lines="none">
            <IonLabel position="stacked">Dán link Maps</IonLabel>
            <IonInput
              value={mapsLinkInput}
              onIonInput={(event) => setMapsLinkInput(event.detail.value ?? '')}
              placeholder="https://maps.app.goo.gl/..."
            />
          </IonItem>
          <IonItem lines="none">
            <IonButton onClick={() => void handleParseMapsLink()}>Phân tích</IonButton>
          </IonItem>
          {parsedMapsLink && (
            <IonItem lines="none">
              <IonTextarea readonly autoGrow value={JSON.stringify(parsedMapsLink, null, 2)} />
            </IonItem>
          )}

          <IonItem lines="none">
            <IonLabel>
              <h2 className="wtg-heading">Log (20 sự kiện gần nhất)</h2>
            </IonLabel>
          </IonItem>
          {logEntries.map((entry) => (
            <IonItem key={entry} lines="none">
              <p className="wtg-caption">{entry}</p>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
