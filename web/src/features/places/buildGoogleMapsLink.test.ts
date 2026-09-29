import { describe, expect, it } from 'vitest';
import { buildGoogleMapsLink, type PlaceForMapsLink } from './buildGoogleMapsLink';

function makePlace(overrides: Partial<PlaceForMapsLink> = {}): PlaceForMapsLink {
  return {
    googleMapsUrl: null,
    latitude: null,
    longitude: null,
    name: '',
    address: null,
    ...overrides,
  };
}

describe('buildGoogleMapsLink', () => {
  it('ưu tiên googleMapsUrl đã lưu', () => {
    const place = makePlace({
      googleMapsUrl: 'https://maps.app.goo.gl/AbCd123',
      latitude: 21.03,
      longitude: 105.85,
      name: 'Phở Thìn',
    });

    expect(buildGoogleMapsLink(place)).toBe('https://maps.app.goo.gl/AbCd123');
  });

  it('dùng toạ độ khi không có googleMapsUrl', () => {
    const place = makePlace({ latitude: 21.016943, longitude: 105.852277, name: 'Phở Thìn' });

    expect(buildGoogleMapsLink(place)).toBe(
      'https://www.google.com/maps/search/?api=1&query=21.016943,105.852277',
    );
  });

  it('dùng tên (kèm địa chỉ) khi không có googleMapsUrl và toạ độ', () => {
    const place = makePlace({ name: 'Morin - Flowers and Tea', address: '1/2/27 Võ Oanh' });

    expect(buildGoogleMapsLink(place)).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        'Morin - Flowers and Tea, 1/2/27 Võ Oanh',
      )}`,
    );
  });

  it('trả về null khi không có gì để dùng', () => {
    expect(buildGoogleMapsLink(makePlace())).toBeNull();
  });
});
