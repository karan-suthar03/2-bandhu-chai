export function getVariantSizeLabel(enumValue) {
  switch (enumValue) {
    case 'GM_250': return '250gm';
    case 'GM_500': return '500gm';
    case 'KG_1': return '1kg';
    default: return enumValue;
  }
}
