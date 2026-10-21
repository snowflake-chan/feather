import { vec4, vec3 } from 'gl-matrix';

export function floatToHex(x: number) {
  const y = (Math.round(255 * x) | 0).toString(16);
  if (y.length < 2) {
    return '0' + y;
  }
  return y;
}

export function vec3ToColor(x: vec4 | vec3 | number[]) {
  return '#' + floatToHex(x[0]) + floatToHex(x[1]) + floatToHex(x[2]);
}

export function rgbToColor(v: { r: number; g: number; b: number }) {
  return '#' + floatToHex(v.r) + floatToHex(v.g) + floatToHex(v.b);
}

export function colorToFloat(color: string): [number, number, number] {
  const r = parseInt(color.substring(1, 3), 16) / 255;
  const g = parseInt(color.substring(3, 5), 16) / 255;
  const b = parseInt(color.substring(5, 7), 16) / 255;
  return [r, g, b];
}

/**
 * hsv数值转换成RGB，数值范围：[0, 255]
 */
export function hexToRGB(hex: string): vec3 | undefined {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : undefined;
}

export function RGBToHsl(r: number, g: number, b: number) {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0;
  let s: number;
  const l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hue2rgb(_p, _q, t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return _p + (_q - _p) * 6 * t;
  }
  if (t < 1 / 2) {
    return _q;
  }
  if (t < 2 / 3) {
    return _p + (_q - _p) * (2 / 3 - t) * 6;
  }
  return _p;
}

export function hslToRGB(h: number, s: number, l: number) {
  let r;
  let g;
  let b;
  if (s == 0) {
    r = g = b = 1;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(b * 100)];
}

export function RGBToHsv(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0;
  let s: number;
  const v = max;

  const d = max - min;

  s = max == 0 ? 0 : d / max;
  if (max == min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

/**
 * hsv数值转换成RGB，数值范围：[0, 255]
 */
export function hsvToRGB(h: number, s: number, v: number): vec3 {
  h /= 360;
  h *= 6;
  s /= 100;
  v /= 100;

  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const mod = i % 6;
  const r = [v, q, p, p, t, v][mod];
  const g = [t, v, v, q, p, p][mod];
  const b = [p, p, t, v, v, q][mod];

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function hsvToHsl(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  const hh = h;
  let ll = (2 - s) * v;
  let ss = s * v;
  ss /= ll <= 1 ? ll : 2 - ll;
  ll /= 2;
  return [hh, ss, ll];
}

function numberToHex(n) {
  var hex = Number(n).toString(16);
  if (hex.length < 2) {
    hex = '0' + hex;
  }
  return hex;
}

export function RGBToHex(R: number, G: number, B: number) {
  return (
    numberToHex(Math.round(R)) +
    numberToHex(Math.round(G)) +
    numberToHex(Math.round(B))
  );
}

export function to8Bit(color) {
  const red = color[0];
  const green = color[1];
  const blue = color[2];
  return (
    (Math.floor(red / 32) << 5) +
    (Math.floor(green / 32) << 2) +
    Math.floor(blue / 64)
  );
}

export function to24Bit(packed) {
  const r = (packed >> 5) * 32;
  const g = ((packed & 28) >> 2) * 32;
  const b = (packed & 3) * 64;
  return [r, g, b];
}

/**
 * RGB（1/255）转换位CIE-Lab颜色
 * see: https://github.com/antimatter15/rgb-lab/blob/a6cf2e9e2ff6fcc7965a2e73c019f8ace69b4384/color.js#L28
 */
export function RGBToLab(rgb: vec3): vec3 {
  let [r, g, b] = rgb;
  let x = 0;
  let y = 0;
  let z = 0;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/**
 * CIE-Lab颜色转换为RGB（1/255）
 * see: https://github.com/antimatter15/rgb-lab/blob/a6cf2e9e2ff6fcc7965a2e73c019f8ace69b4384/color.js#L4
 */
export function LabToRGB(lab: vec3): vec3 {
  let y = (lab[0] + 16) / 116;
  let x = lab[1] / 500 + y;
  let z = y - lab[2] / 200;
  let r = 0;
  let g = 0;
  let b = 0;

  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

  r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  b = x * 0.0557 + y * -0.204 + z * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return [
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b)),
  ];
}
