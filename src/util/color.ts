/**
 * Calculate relative brightness (perceived brightness) of color using gamma correction formula)
 *
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Brightness value (0-1)
 */
export const calculateLightness = (r: number, g: number, b: number): number => {
  const GAMMA = 2.2;
  const K = 0.547373141;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const physicalLuminance = Math.pow(rNorm, GAMMA) + Math.pow(1.5 * gNorm, GAMMA) + Math.pow(0.6 * bNorm, GAMMA);

  return K * Math.pow(physicalLuminance, 1 / GAMMA);
};

/**
 * Convert RGB to grayscale value (0-255)
 * Based on the same gamma correction formula
 *
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Grayscale value (0-255)
 */
export const rgb2gray = (r: number, g: number, b: number): number => {
  const GAMMA = 2.2;
  const K = 0.547373141;

  const physicalLuminance = Math.pow(r, GAMMA) + Math.pow(1.5 * g, GAMMA) + Math.pow(0.6 * b, GAMMA);

  return Math.round(K * Math.pow(physicalLuminance, 1 / GAMMA));
};

/**
 * Determine text color based on RGBA components
 *
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @param a Opacity (0-1), defaults to 1
 * @returns 'black' | 'white'
 */
export const determineTextColorFromRgba = (r: number, g: number, b: number, a: number = 1): 'black' | 'white' => {
  const lightness = calculateLightness(r, g, b);
  return lightness > 0.62 ? 'black' : a < 0.4 ? 'black' : 'white';
};

/**
 * Parse CSS color value string
 * @returns [r, g, b, a] or null (parsing failed)
 */
export const parseCssColor = (colorStr: string): [number, number, number, number] | null => {
  const trimmed = colorStr.trim();

  const rgbaMatch = trimmed.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1], 10),
      parseInt(rgbaMatch[2], 10),
      parseInt(rgbaMatch[3], 10),
      rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    ];
  }

  return null;
};

export const getSmartThemeQuoteColor = (): string => {
  return getComputedStyle(document.documentElement).getPropertyValue('--SmartThemeQuoteColor').trim();
};

let cachedTextColor: 'black' | 'white';
export const getSmartThemeQuoteTextColor = (): 'black' | 'white' | 'inherit' => {
  if (!cachedTextColor) {
    const currentColor = getSmartThemeQuoteColor();
    const rgba = parseCssColor(currentColor);
    if (!rgba) {
      return 'inherit';
    }
    const textColor = determineTextColorFromRgba(...rgba);
    cachedTextColor = textColor;
  }
  return cachedTextColor;
};
