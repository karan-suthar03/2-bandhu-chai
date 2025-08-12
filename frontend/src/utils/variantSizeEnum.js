export const VARIANT_SIZES = {
  GM_250: 'GM_250',
  GM_500: 'GM_500',
  KG_1: 'KG_1',
};

export const VARIANT_SIZE_DISPLAY = {
  GM_250: '250gm',
  GM_500: '500gm',
  KG_1: '1kg',
};

export function getVariantSizeDisplay(size) {
  if (!size) return '';
  if (Object.values(VARIANT_SIZE_DISPLAY).includes(size)) return size;
  if (VARIANT_SIZE_DISPLAY[size]) return VARIANT_SIZE_DISPLAY[size];
  return size;
}
