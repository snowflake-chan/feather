export class FrameskipsManager {
  private history: number[];
  private total = 0;
  private nextIndex = 0;

  constructor(private historySize: number) {
    this.history = Array(historySize).fill(0);
  }

  public push(frameskips: number) {
    this.total += frameskips - this.history[this.nextIndex];
    this.history[this.nextIndex] = frameskips;
    this.nextIndex = (this.nextIndex + 1) % this.historySize;
  }

  public getAvg() {
    return this.total / this.historySize;
  }

  public getTotal() {
    return this.total;
  }
}
