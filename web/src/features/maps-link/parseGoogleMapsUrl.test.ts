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

  it('9. link chỉ đường (daddr + geocode): tên/địa chỉ từ daddr, toạ độ nơi đến từ geocode, KHÔNG dùng saddr', () => {
    // Cấu trúc giống hệt link "Chia sẻ" màn hình chỉ đường của app Google Maps iOS
    // (sau khi resolve maps.app.goo.gl), nhưng thay vị trí bằng địa điểm công khai.
    const url =
      'https://maps.google.com/?geocode=FURxpAAdZCBcBg%3D%3D;Fe1fpAAdRxVcBiklCz06Oy91MTGBcG9eTTwrGg%3D%3D' +
      '&daddr=Ch%E1%BB%A3+B%E1%BA%BFn+Th%C3%A0nh,+L%C3%AA+L%E1%BB%A3i,+Ph%C6%B0%E1%BB%9Dng+B%E1%BA%BFn+Th%C3%A0nh,+Qu%E1%BA%ADn+1,+Th%C3%A0nh+ph%E1%BB%91+H%E1%BB%93+Ch%C3%AD+Minh' +
      '&saddr=10.7769000,106.7009000&dirflg=df&ftid=0x31752f3b3a3d0b25:0x1a2b3c4d5e6f7081&g_st=ic';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBe('Chợ Bến Thành');
    expect(result.address).toBe('Lê Lợi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh');
    expect(result.latitude).toBeCloseTo(10.772461, 6);
    expect(result.longitude).toBeCloseTo(106.698055, 6);
    expect(result.latitude).not.toBeCloseTo(10.7769, 4);
    expect(result.placeRef).toBe('0x31752f3b3a3d0b25:0x1a2b3c4d5e6f7081');
  });

  it('10. link ghim toạ độ /maps/search/<lat>,+<lng>', () => {
    const url =
      'https://www.google.com/maps/search/21.034699,+105.852143?entry=tts&g_ep=EgoyMDI1MTAyMi4wIPu8ASoASAFQAw%3D%3D';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBeUndefined();
    expect(result.latitude).toBeCloseTo(21.034699, 6);
    expect(result.longitude).toBeCloseTo(105.852143, 6);
  });

  it('11. link /place/ thật: tên từ path, toạ độ ưu tiên !3d/!4d thay vì @', () => {
    const url =
      'https://www.google.com/maps/place/Thang+Long+Water+Puppet+Theatre/@21.031911,105.850415,17z/data=!4m7!3m6!1s0x3135abc013454289:0x4e5ea7a5d23aad1c!8m2!3d21.0316826!4d105.8533466';
    const result = parseGoogleMapsUrl(url);

    expect(result.name).toBe('Thang Long Water Puppet Theatre');
    expect(result.latitude).toBeCloseTo(21.0316826, 6);
    expect(result.longitude).toBeCloseTo(105.8533466, 6);
    expect(result.placeRef).toBe('0x3135abc013454289:0x4e5ea7a5d23aad1c');
  });
});
