import { apiClient } from '../../lib/apiClient';

interface PhotoFolderResponse {
  folder_id: string;
}

/** Id thư mục "WhereToGo Photos", cache trong bộ nhớ cho cả phiên làm việc. */
let cachedFolderId: string | null = null;

/**
 * Lấy id thư mục "WhereToGo Photos" trên Drive của user hiện tại (server tự
 * tạo thư mục nếu chưa có). Chỉ gọi server một lần mỗi phiên.
 */
export async function getPhotoFolderId(): Promise<string> {
  if (cachedFolderId) {
    return cachedFolderId;
  }
  const response = await apiClient.postJson<PhotoFolderResponse>('/api/drive/photo-folder');
  cachedFolderId = response.folder_id;
  return cachedFolderId;
}
