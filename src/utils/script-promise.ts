export class PromiseWrapper<T> {
  public handle = 0;
  public query: Promise<T>;

  private resolve?: (data: any) => void;
  private reject?: (error: any) => void;
  private handleResult?: (value) => T;
  private handleError?: (err) => any;

  constructor(
    public schedule: (event: () => void) => void,
    handleResult?: (value) => T,
    handleError?: (err) => any,
  ) {
    this.handleResult = handleResult;
    this.handleError = handleError;
    this.query = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  // TODO: 检查error
  public notifyDone(result: T) {
    let _result = result;
    if (this.handleResult) {
      _result = this.handleResult(result);
    }

    this.schedule(() => {
      if (this.resolve) {
        this.resolve(_result);
      }
    });
  }

  public notifyError(error: any) {
    let _error = error;
    if (this.handleError) {
      _error = this.handleError(error);
    }
    this.schedule(() => {
      if (this.reject) {
        this.reject(_error);
      }
    });
  }
}
