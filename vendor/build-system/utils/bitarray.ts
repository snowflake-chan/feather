export interface BitArrayData {
  data: number[];
  size: number;
}

export class BitArray {
  public data: number[] = [];
  public size: number = 0;

  constructor(size?: number) {
    if (size) {
      this.init(size);
    }
  }

  public init(size: number) {
    this.size = (size + 31) & -32;
    this.data = Array(this.size / 32).fill(0);
  }
  public get(pos: number) {
    const idx = pos >> 5;
    const bit = 1 << (pos & 0x1f);
    return (this.data[idx] & bit) !== 0;
  }

  public set(pos: number, value = true) {
    const idx = pos >> 5;
    const bit = 1 << (pos & 0x1f);
    this.data[idx] |= value ? bit : ~bit;
  }

  public load(data: BitArrayData) {
    this.data = data.data;
    this.size = data.size;
  }

  public save() {
    return {
      data: this.data,
      size: this.size,
    };
  }
}
