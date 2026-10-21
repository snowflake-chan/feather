export function formatNumber(value: number) {
  if (value > 1000) {
    return fixedFloat(value / 1000) + 'k';
  }
  return fixedFloat(value);
}

function fixedFloat(value: number) {
  return Math.floor(value);
}

export const floatCeil = (num: number, decimalNum: number = 2) => {
  const tenPow = Math.pow(10, decimalNum);
  return Math.ceil(num * tenPow) / tenPow;
};

export function nFormatter(n: number, digits: number) {
  if (n < 1e3) {
    return n;
  }
  if (n >= 1e3 && n < 1e6) {
    return +(n / 1e3).toFixed(digits) + 'K';
  }
  if (n >= 1e6 && n < 1e9) {
    return +(n / 1e6).toFixed(digits) + 'M';
  }
  if (n >= 1e9 && n < 1e12) {
    return +(n / 1e9).toFixed(digits) + 'B';
  }
  return +(n / 1e12).toFixed(digits) + 'T';
}
