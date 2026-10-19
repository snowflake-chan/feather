export class PromiseWrapper<T> {
  public resolve!: (value: T) => void;
  public reject!: (err?: any) => void;
  public promise: Promise<T>;
  constructor(public handle: number) {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
