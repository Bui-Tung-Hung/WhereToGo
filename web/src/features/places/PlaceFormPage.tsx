import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLoading,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
  type InputCustomEvent,
  type SegmentCustomEvent,
  type TextareaCustomEvent,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { alertCircleOutline, closeOutline, locateOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toUserMessage } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { EmptyState } from '../../shared/components/EmptyState';
import { PriceRangeInput, type PriceRangeValue } from '../../shared/components/PriceRangeInput';
import { StarRatingInput } from '../../shared/components/StarRatingInput';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { getCurrentPosition } from '../location/geolocation';
import { extractFromMapsLink } from '../maps-link/mapsLinkService';
import type { ParsedMapsLink } from '../maps-link/parseGoogleMapsUrl';
import { PasteMapsLinkButton } from '../maps-link/PasteMapsLinkButton';
import { createDefaultWeek } from '../opening-hours/openingHours';
import { OpeningHoursEditor } from '../opening-hours/OpeningHoursEditor';
import { PhotoGallery } from '../photos/PhotoGallery';
import { PhotoPicker } from '../photos/PhotoPicker';
import { TagPicker } from '../tags/TagPicker';
import { QUERY_KEYS, useCreatePlace, useDeletePlace, useUpdatePlace } from './placeQueries';
import { getPlace } from './placeRepository';
import { placeFormSchema, type PlaceFormValues } from './placeSchema';
import type { PhotoUploadProgress } from './placeService';
import type { PhotoRef, PlaceStatus, PlaceWithRelations } from './types';

const STATUS_OPTIONS: { value: PlaceStatus; label: string }[] = [
  { value: 'interested', label: 'Hứng thú' },
  { value: 'not_visited', label: 'Chưa đi' },
  { value: 'visited', label: 'Đã đi' },
];

const NOTES_MAX_LENGTH = 5000;
const TOAST_DURATION_MS = 3000;

/** Giá trị mặc định khi tạo địa điểm mới (D18: mặc định giờ 08:00–22:00 mọi ngày). */
function buildCreateDefaults(): PlaceFormValues {
  return {
    name: '',
    address: null,
    latitude: null,
    longitude: null,
    googleMapsUrl: null,
    googlePlaceRef: null,
    rating: null,
    priceMinVnd: null,
    priceMaxVnd: null,
    notes: null,
    status: 'not_visited',
    openingHours: createDefaultWeek(),
    tagIds: [],
  };
}

/** Giá trị mặc định khi sửa, từ dữ liệu địa điểm đã tải. */
function buildEditDefaults(place: PlaceWithRelations): PlaceFormValues {
  return {
    name: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    googleMapsUrl: place.googleMapsUrl,
    googlePlaceRef: place.googlePlaceRef,
    rating: place.rating,
    priceMinVnd: place.priceMinVnd,
    priceMaxVnd: place.priceMaxVnd,
    notes: place.notes,
    status: place.status,
    openingHours: place.openingHours,
    tagIds: place.tagIds,
  };
}

/**
 * Tạo/sửa một địa điểm (mục 6.6 PLAN.md). Đường dẫn `/places/new` (tạo) và
 * `/places/:id/edit` (sửa) đều dùng component này; chế độ được xác định bởi
 * sự có mặt của tham số `id`.
 */
export function PlaceFormPage(): React.JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  // Không dùng `usePlace` (mục 6.6, placeQueries.ts) trực tiếp ở đây để tránh
  // fetch lãng phí khi đang ở chế độ tạo mới (`usePlace` không nhận `enabled`).
  const existingPlaceQuery = useQuery({
    queryKey: QUERY_KEYS.place(id ?? ''),
    queryFn: () => getPlace(id as string),
    enabled: isEditMode,
  });

  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const deletePlaceMutation = useDeletePlace();

  const [existingPhotos, setExistingPhotos] = useState<PhotoRef[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<PhotoRef[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [noCoordsHint, setNoCoordsHint] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ index: number; total: number } | null>(
    null,
  );
  const [hasInitializedEdit, setHasInitializedEdit] = useState(false);

  const { control, handleSubmit, formState, getValues, setValue, watch, reset } =
    useForm<PlaceFormValues>({
      resolver: zodResolver(placeFormSchema),
      defaultValues: buildCreateDefaults(),
    });

  // Nạp dữ liệu form khi vào chế độ sửa (chỉ một lần, ngay khi tải xong địa điểm).
  useEffect(() => {
    if (isEditMode && !hasInitializedEdit && existingPlaceQuery.data) {
      reset(buildEditDefaults(existingPlaceQuery.data));
      setExistingPhotos(existingPlaceQuery.data.photos);
      setHasInitializedEdit(true);
    }
  }, [isEditMode, hasInitializedEdit, existingPlaceQuery.data, reset]);

  // Xem trước ảnh mới chọn qua object URL, giải phóng khi danh sách đổi/unmount.
  useEffect(() => {
    const urls = newPhotoFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPhotoFiles]);

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const priceMinVnd = watch('priceMinVnd');
  const priceMaxVnd = watch('priceMaxVnd');

  const hasUnsavedChanges =
    formState.isDirty || newPhotoFiles.length > 0 || removedPhotos.length > 0;
  const isSaving = createPlace.isPending || updatePlace.isPending;

  function confirmDiscardIfNeeded(onConfirm: () => void): void {
    if (!hasUnsavedChanges) {
      onConfirm();
      return;
    }
    void presentAlert({
      header: 'Bỏ thay đổi?',
      message: 'Các thay đổi chưa lưu sẽ mất.',
      buttons: [
        { text: 'Tiếp tục sửa', role: 'cancel' },
        { text: 'Bỏ thay đổi', role: 'destructive', handler: onConfirm },
      ],
    });
  }

  function handleCancel(): void {
    confirmDiscardIfNeeded(() => navigate(-1));
  }

  /**
   * Áp dụng D21: chỉ điền tên/địa chỉ nếu ô đang trống; luôn điền toạ độ,
   * link, mã địa điểm khi link phân tích được có các giá trị đó.
   */
  function applyParsedLink(parsed: ParsedMapsLink): void {
    if (!getValues('name') && parsed.name) {
      setValue('name', parsed.name, { shouldDirty: true });
    }
    if (!getValues('address') && parsed.address) {
      setValue('address', parsed.address, { shouldDirty: true });
    }
    const hasCoords = parsed.latitude !== undefined && parsed.longitude !== undefined;
    if (parsed.latitude !== undefined && parsed.longitude !== undefined) {
      setValue('latitude', parsed.latitude, { shouldDirty: true });
      setValue('longitude', parsed.longitude, { shouldDirty: true });
    }
    setValue('googleMapsUrl', parsed.url, { shouldDirty: true });
    if (parsed.placeRef !== undefined) {
      setValue('googlePlaceRef', parsed.placeRef, { shouldDirty: true });
    }
    setNoCoordsHint(!hasCoords && getValues('latitude') === null);
  }

  async function handleMapsUrlBlur(): Promise<void> {
    const raw = getValues('googleMapsUrl');
    if (!raw || !raw.trim()) {
      return;
    }
    try {
      const parsed = await extractFromMapsLink(raw);
      applyParsedLink(parsed);
    } catch (error) {
      void presentToast({
        message: toUserMessage(error),
        duration: TOAST_DURATION_MS,
        color: 'danger',
      });
    }
  }

  async function handleUseCurrentLocation(): Promise<void> {
    setIsLocating(true);
    try {
      // D25: luôn ghi đè toạ độ đang có, không hỏi lại.
      const position = await getCurrentPosition();
      setValue('latitude', position.latitude, { shouldDirty: true });
      setValue('longitude', position.longitude, { shouldDirty: true });
      setNoCoordsHint(false);
    } catch (error) {
      void presentAlert({ header: 'Lỗi', message: toUserMessage(error), buttons: ['Đóng'] });
    } finally {
      setIsLocating(false);
    }
  }

  function handleClearLocation(): void {
    setValue('latitude', null, { shouldDirty: true });
    setValue('longitude', null, { shouldDirty: true });
  }

  function handlePickPhotos(files: File[]): void {
    setNewPhotoFiles((previous) => [...previous, ...files]);
  }

  function handleRemoveNewPhoto(index: number): void {
    setNewPhotoFiles((previous) => previous.filter((_, i) => i !== index));
  }

  function handleRemoveExistingPhoto(photo: PhotoRef): void {
    setExistingPhotos((previous) => previous.filter((p) => p.id !== photo.id));
    setRemovedPhotos((previous) => [...previous, photo]);
  }

  async function onSubmit(values: PlaceFormValues): Promise<void> {
    setUploadProgress(newPhotoFiles.length > 0 ? { index: 0, total: newPhotoFiles.length } : null);
    const onProgress: PhotoUploadProgress = (fileIndex) => {
      setUploadProgress({ index: fileIndex, total: newPhotoFiles.length });
    };
    try {
      const result =
        isEditMode && id
          ? await updatePlace.mutateAsync({
              id,
              input: values,
              newPhotos: newPhotoFiles,
              removedPhotos,
              onProgress,
            })
          : await createPlace.mutateAsync({ input: values, photos: newPhotoFiles, onProgress });

      if (result.photoErrors.length > 0) {
        void presentToast({
          message: `${result.photoErrors.length} ảnh không thêm được.`,
          duration: TOAST_DURATION_MS,
          color: 'warning',
        });
      }
      navigate(`/places/${result.place.id}`, { replace: true });
    } catch (error) {
      logger.error('save_place_failed', {});
      void presentAlert({
        header: 'Không lưu được',
        message: toUserMessage(error),
        buttons: ['Đóng'],
      });
    } finally {
      setUploadProgress(null);
    }
  }

  function handleDelete(): void {
    const current = existingPlaceQuery.data;
    if (!current) {
      return;
    }
    void presentAlert({
      header: 'Xoá địa điểm',
      message: `Xoá "${current.name}"? Ảnh của địa điểm cũng sẽ bị xoá khỏi Google Drive.`,
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Xoá',
          role: 'destructive',
          handler: () => {
            void (async () => {
              try {
                await deletePlaceMutation.mutateAsync(current);
                navigate('/tabs/explore', { replace: true });
              } catch (error) {
                void presentAlert({
                  header: 'Lỗi',
                  message: toUserMessage(error),
                  buttons: ['Đóng'],
                });
              }
            })();
          },
        },
      ],
    });
  }

  if (isEditMode && !hasInitializedEdit) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton className="wtg-tap-target" onClick={() => navigate(-1)}>
                Huỷ
              </IonButton>
            </IonButtons>
            <IonTitle>Sửa địa điểm</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {existingPlaceQuery.isError ? (
            <EmptyState
              icon={alertCircleOutline}
              title="Không tải được địa điểm"
              message={toUserMessage(existingPlaceQuery.error)}
            />
          ) : (
            <p className="wtg-caption">Đang tải…</p>
          )}
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="wtg-tap-target" onClick={handleCancel}>
              Huỷ
            </IonButton>
          </IonButtons>
          <IonTitle>{isEditMode ? 'Sửa địa điểm' : 'Địa điểm mới'}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              className="wtg-tap-target"
              strong
              disabled={!isOnline || isSaving}
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
            <p className="wtg-group-title">Google Maps</p>
            <PasteMapsLinkButton onParsed={applyParsedLink} />
            <Controller
              control={control}
              name="googleMapsUrl"
              render={({ field }) => (
                <IonInput
                  style={{ marginTop: 8 }}
                  label="Link Google Maps"
                  labelPlacement="stacked"
                  value={field.value ?? ''}
                  onIonInput={(event: InputCustomEvent) =>
                    field.onChange(event.detail.value || null)
                  }
                  onIonBlur={() => {
                    field.onBlur();
                    void handleMapsUrlBlur();
                  }}
                />
              )}
            />
            {formState.errors.googleMapsUrl && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.googleMapsUrl.message}
              </p>
            )}
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Tên *</p>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <IonInput
                  label="Tên"
                  labelPlacement="stacked"
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
            <p className="wtg-group-title">Địa chỉ</p>
            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <IonTextarea
                  label="Địa chỉ"
                  labelPlacement="stacked"
                  autoGrow
                  value={field.value ?? ''}
                  onIonInput={(event: TextareaCustomEvent) =>
                    field.onChange(event.detail.value || null)
                  }
                  onIonBlur={field.onBlur}
                />
              )}
            />
            {formState.errors.address && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Vị trí</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <IonButton
                className="wtg-tap-target"
                fill="outline"
                type="button"
                disabled={isLocating}
                onClick={() => void handleUseCurrentLocation()}
              >
                <IonIcon icon={locateOutline} slot="start" aria-hidden="true" />
                Dùng vị trí hiện tại
              </IonButton>
              {latitude !== null && longitude !== null && (
                <IonButton
                  className="wtg-tap-target"
                  fill="clear"
                  color="danger"
                  type="button"
                  onClick={handleClearLocation}
                >
                  <IonIcon icon={closeOutline} slot="start" aria-hidden="true" />
                  Xoá vị trí
                </IonButton>
              )}
            </div>
            {latitude !== null && longitude !== null && (
              <p className="wtg-caption" style={{ marginTop: 8 }}>
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            )}
            {noCoordsHint && latitude === null && (
              <p className="wtg-caption" style={{ marginTop: 8, color: 'var(--ion-color-medium)' }}>
                Link này không có toạ độ — bấm "Dùng vị trí hiện tại" khi đang ở đó, hoặc dán link
                chia sẻ từ màn hình Chỉ đường.
              </p>
            )}
            {formState.errors.latitude && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.latitude.message}
              </p>
            )}
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Ảnh</p>
            {existingPhotos.length > 0 && (
              <PhotoGallery photos={existingPhotos} editable onRemove={handleRemoveExistingPhoto} />
            )}
            {newPhotoFiles.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  marginTop: existingPhotos.length > 0 ? 8 : 0,
                }}
              >
                {newPhotoFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{ position: 'relative', flexShrink: 0 }}
                  >
                    {previewUrls[index] && (
                      <img
                        src={previewUrls[index]}
                        alt="Ảnh chờ tải lên"
                        className="wtg-list-thumb"
                      />
                    )}
                    <button
                      type="button"
                      className="wtg-tap-target"
                      aria-label="Bỏ ảnh này"
                      onClick={() => handleRemoveNewPhoto(index)}
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        background: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                      }}
                    >
                      <IonIcon icon={closeOutline} color="light" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <PhotoPicker onPick={handlePickPhotos} />
            </div>
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Loại</p>
            <Controller
              control={control}
              name="tagIds"
              render={({ field }) => <TagPicker value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Trạng thái</p>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <IonSegment
                  value={field.value}
                  onIonChange={(event: SegmentCustomEvent) =>
                    field.onChange(event.detail.value as PlaceStatus)
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <IonSegmentButton key={option.value} value={option.value}>
                      <IonLabel>{option.label}</IonLabel>
                    </IonSegmentButton>
                  ))}
                </IonSegment>
              )}
            />
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Đánh giá của bạn</p>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <StarRatingInput value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Khoảng giá</p>
            <PriceRangeInput
              min={priceMinVnd}
              max={priceMaxVnd}
              onChange={(value: PriceRangeValue) => {
                setValue('priceMinVnd', value.min, { shouldDirty: true });
                setValue('priceMaxVnd', value.max, { shouldDirty: true });
              }}
            />
            {formState.errors.priceMinVnd && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.priceMinVnd.message}
              </p>
            )}
          </div>

          <Controller
            control={control}
            name="openingHours"
            render={({ field }) => (
              <OpeningHoursEditor value={field.value} onChange={field.onChange} />
            )}
          />
          {formState.errors.openingHours && (
            <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
              {formState.errors.openingHours.message} — kiểm tra các khung giờ bị trùng nhau hoặc
              sai định dạng.
            </p>
          )}

          <div className="wtg-group">
            <p className="wtg-group-title">Ghi chú</p>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <IonTextarea
                  autoGrow
                  maxlength={NOTES_MAX_LENGTH}
                  counter
                  value={field.value ?? ''}
                  onIonInput={(event: TextareaCustomEvent) =>
                    field.onChange(event.detail.value || null)
                  }
                  onIonBlur={field.onBlur}
                />
              )}
            />
            {formState.errors.notes && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-danger)' }}>
                {formState.errors.notes.message}
              </p>
            )}
          </div>

          {isEditMode && isOnline && (
            <div className="wtg-group">
              <IonButton
                className="wtg-tap-target"
                expand="block"
                color="danger"
                fill="outline"
                onClick={handleDelete}
              >
                <IonIcon icon={trashOutline} slot="start" aria-hidden="true" />
                Xoá địa điểm
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>

      <IonLoading
        isOpen={isSaving}
        message={
          uploadProgress
            ? `Đang lưu… Đang tải ảnh ${uploadProgress.index + 1}/${uploadProgress.total}`
            : 'Đang lưu…'
        }
      />
    </IonPage>
  );
}
