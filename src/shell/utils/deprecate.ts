export function warnDeprecate(
  f: (t: any) => any,
  prev: string,
  cur: string,
): any {
  let warning = false;

  return function (this: any) {
    if (warning) {
      console.warn(`WARNING! ${prev} is deprecated.  Use ${cur} instead`);
      warning = true;
    }
    return f.apply(this, <any>Array.prototype.slice.call(arguments));
  };
}
