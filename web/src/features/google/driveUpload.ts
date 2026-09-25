import { DriveUploadError } from '../../lib/errors';

/** Metadata Drive trả về sau khi upload xong một ảnh. */
export interface DriveFileInfo {
  id: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface UploadFileToDriveOptions {
  file: File;
  folderId: string;
  accessToken: string;
  fileName: string;
  onProgress?: (fraction: number) => void;
}

const RESUMABLE_SESSION_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,mimeType,size,imageMediaMetadata(width,height)';

interface DriveFilesCreateResponse {
  id: string;
  mimeType: string;
  size: string;
  imageMediaMetadata?: { width?: number; height?: number };
}

/**
 * Upload một file ảnh lên Google Drive của user bằng resumable upload:
 * mở phiên (bước 1) rồi PUT toàn bộ nội dung (bước 2), báo tiến độ qua
 * `onProgress` (mục 1 và 6.6 PLAN.md).
 *
 * @throws {DriveUploadError} `no_session_uri` khi Drive không trả header `Location`.
 */
export async function uploadFileToDrive(options: UploadFileToDriveOptions): Promise<DriveFileInfo> {
  const sessionUri = await openResumableSession(options);
  return putFileContent(sessionUri, options.file, options.onProgress);
}

/** Bước 1: mở phiên resumable upload, trả về URI của phiên (header `Location`). */
function openResumableSession({
  file,
  folderId,
  accessToken,
  fileName,
}: UploadFileToDriveOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', RESUMABLE_SESSION_URL);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.setRequestHeader('X-Upload-Content-Type', file.type);
    xhr.setRequestHeader('X-Upload-Content-Length', String(file.size));

    xhr.onload = () => {
      const location = xhr.getResponseHeader('Location');
      if (!location) {
        reject(new DriveUploadError('no_session_uri'));
        return;
      }
      resolve(location);
    };
    xhr.onerror = () => {
      reject(new DriveUploadError('no_session_uri', undefined, new Error('network_error')));
    };
    xhr.send(JSON.stringify({ name: fileName, parents: [folderId] }));
  });
}

/** Bước 2: PUT toàn bộ nội dung file tới URI của phiên, báo tiến độ khi có thể. */
function putFileContent(
  sessionUri: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<DriveFileInfo> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', sessionUri);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new DriveUploadError('upload_failed', undefined, new Error(`HTTP ${xhr.status}`)));
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText) as DriveFilesCreateResponse;
        resolve({
          id: body.id,
          mimeType: body.mimeType,
          size: Number(body.size),
          width: body.imageMediaMetadata?.width,
          height: body.imageMediaMetadata?.height,
        });
      } catch (cause) {
        reject(new DriveUploadError('upload_failed', undefined, cause));
      }
    };
    xhr.onerror = () => {
      reject(new DriveUploadError('upload_failed', undefined, new Error('network_error')));
    };
    xhr.send(file);
  });
}
