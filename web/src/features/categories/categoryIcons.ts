import {
  airplaneOutline,
  basketballOutline,
  beerOutline,
  bicycleOutline,
  boatOutline,
  cafeOutline,
  carOutline,
  fastFoodOutline,
  filmOutline,
  gameControllerOutline,
  heartOutline,
  iceCreamOutline,
  leafOutline,
  locationOutline,
  mapOutline,
  musicalNotesOutline,
  pawOutline,
  pizzaOutline,
  restaurantOutline,
  storefrontOutline,
  wineOutline,
} from 'ionicons/icons';

/** Các khoá biểu tượng được phép cho một nhóm (P2 PLAN-UI-1.md), đúng thứ tự hiện trong lưới chọn. */
export const CATEGORY_ICON_KEYS = [
  'restaurant',
  'fast-food',
  'pizza',
  'ice-cream',
  'cafe',
  'beer',
  'wine',
  'game-controller',
  'film',
  'musical-notes',
  'basketball',
  'bicycle',
  'paw',
  'leaf',
  'airplane',
  'car',
  'boat',
  'map',
  'storefront',
  'heart',
] as const;

/** Một khoá biểu tượng nhóm hợp lệ. */
export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

/** Icon ionicons (bản `Outline`) của từng khoá. */
export const CATEGORY_ICONS: Record<CategoryIconKey, string> = {
  restaurant: restaurantOutline,
  'fast-food': fastFoodOutline,
  pizza: pizzaOutline,
  'ice-cream': iceCreamOutline,
  cafe: cafeOutline,
  beer: beerOutline,
  wine: wineOutline,
  'game-controller': gameControllerOutline,
  film: filmOutline,
  'musical-notes': musicalNotesOutline,
  basketball: basketballOutline,
  bicycle: bicycleOutline,
  paw: pawOutline,
  leaf: leafOutline,
  airplane: airplaneOutline,
  car: carOutline,
  boat: boatOutline,
  map: mapOutline,
  storefront: storefrontOutline,
  heart: heartOutline,
};

/** Nhãn tiếng Việt của từng khoá (dùng cho `aria-label` trong lưới chọn biểu tượng). */
export const CATEGORY_ICON_LABELS: Record<CategoryIconKey, string> = {
  restaurant: 'Nhà hàng',
  'fast-food': 'Đồ ăn nhanh',
  pizza: 'Pizza',
  'ice-cream': 'Kem',
  cafe: 'Cà phê',
  beer: 'Bia',
  wine: 'Rượu vang',
  'game-controller': 'Trò chơi',
  film: 'Phim',
  'musical-notes': 'Âm nhạc',
  basketball: 'Thể thao',
  bicycle: 'Xe đạp',
  paw: 'Thú cưng',
  leaf: 'Thiên nhiên',
  airplane: 'Máy bay',
  car: 'Ô tô',
  boat: 'Thuyền',
  map: 'Bản đồ',
  storefront: 'Cửa hàng',
  heart: 'Trái tim',
};

/** Biểu tượng dùng khi nhóm để trống biểu tượng (P2). */
export const DEFAULT_CATEGORY_ICON = locationOutline;

/** Câu gợi ý dùng khi nhóm để trống câu gợi ý (P3). */
export const DEFAULT_CATEGORY_PROMPT = 'Hôm nay đi đâu?';

function isCategoryIconKey(key: string): key is CategoryIconKey {
  return (CATEGORY_ICON_KEYS as readonly string[]).includes(key);
}

/** Icon ionicons của một nhóm; khoá `null` hoặc không hợp lệ thì dùng {@link DEFAULT_CATEGORY_ICON}. */
export function resolveCategoryIcon(key: string | null): string {
  return key !== null && isCategoryIconKey(key) ? CATEGORY_ICONS[key] : DEFAULT_CATEGORY_ICON;
}

/** Câu gợi ý của một nhóm; `null` thì dùng {@link DEFAULT_CATEGORY_PROMPT}. */
export function resolveCategoryPrompt(prompt: string | null): string {
  return prompt ?? DEFAULT_CATEGORY_PROMPT;
}
