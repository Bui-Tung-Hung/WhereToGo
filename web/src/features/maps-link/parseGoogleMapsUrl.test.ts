import { describe, expect, it } from 'vitest';
import { InvalidMapsLinkError } from '../../lib/errors';
import { isShortMapsLink, parseGoogleMapsUrl } from './parseGoogleMapsUrl';

describe('parseGoogleMapsUrl', () => {
  it('1. link /place/ đầy đủ với !3d/!4d và ftid', () => {
    const url =
      'https://www.google.com/maps/place/Ph%E1%BB%9F+Th%C3%ACn/@21.0169,105.8497,17z/data=!3m1!4b1!4m6!3m5!1s0x3135ab8e0a0f0e8b:0x5e7c6b1d5d5f0b0!8m2!3d21.016943!4d105.852277!16s%2Fg%2F11b6';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBe('Phở Thìn');
    expect(result.latitude).toBeCloseTo(21.016943, 6);
    expect(result.longitude).toBeCloseTo(105.852277, 6);
    expect(result.placeRef).toBe('0x3135ab8e0a0f0e8b:0x5e7c6b1d5d5f0b0');
  });

  it('2. link chỉ có @lat,lng, không có tên', () => {
    const url = 'https://www.google.com/maps/@10.7769,106.7009,15z';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBeUndefined();
    expect(result.latitude).toBeCloseTo(10.7769, 4);
    expect(result.longitude).toBeCloseTo(106.7009, 4);
  });

  it('3. link ?q=lat,lng → toạ độ, không phải tên', () => {
    const url = 'https://maps.google.com/?q=10.7769,106.7009';
    const result = parseGoogleMapsUrl(url);

    expect(result.latitude).toBeCloseTo(10.7769, 4);
    expect(result.longitude).toBeCloseTo(106.7009, 4);
    expect(result.name).toBeUndefined();
  });

  it('4. link ?cid=... → placeRef dạng cid:<số>', () => {
    const url = 'https://www.google.com/maps?cid=1234567890123456789';
    const result = parseGoogleMapsUrl(url);

    expect(result.placeRef).toBe('cid:1234567890123456789');
  });

  it('5. link search với query + query_place_id', () => {
    const url =
      'https://www.google.com/maps/search/?api=1&query=Cafe+Gi%E1%BA%A3ng&query_place_id=ChIJabc123';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBe('Cafe Giảng');
    expect(result.placeRef).toBe('ChIJabc123');
  });

  it('6. link rút gọn maps.app.goo.gl cần resolve trước', () => {
    const url = 'https://maps.app.goo.gl/AbCd123';

    expect(isShortMapsLink(url)).toBe(true);
    expect(() => parseGoogleMapsUrl(url)).toThrow(InvalidMapsLinkError);
    try {
      parseGoogleMapsUrl(url);
      expect.fail('phải ném lỗi');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidMapsLinkError);
      expect((error as InvalidMapsLinkError).code).toBe('needs_resolve');
    }
  });

  it('7. host lạ (không phải Google) → InvalidMapsLinkError', () => {
    const url = 'https://example.com/maps/place/x';

    expect(() => parseGoogleMapsUrl(url)).toThrow(InvalidMapsLinkError);
  });

  it('8. host google.com.vn, tên từ /place/, toạ độ từ @', () => {
    const url =
      'https://www.google.com.vn/maps/place/Ch%E1%BB%A3+B%E1%BA%BFn+Th%C3%A0nh/@10.772,106.698,17z';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBe('Chợ Bến Thành');
    expect(result.latitude).toBeCloseTo(10.772, 3);
    expect(result.longitude).toBeCloseTo(106.698, 3);
  });
});
