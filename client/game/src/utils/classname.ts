type ArgsType =
  | {
      [key: string]: boolean | undefined | null;
    }
  | string
  | undefined
  | boolean
  | null;

export const calc_class_name = (...args: ArgsType[]) => {
  const classes: string[] = [];
  var i = 0;
  for (i; i < args.length; i++) {
    const arg = args[i];
    const arg_type = typeof arg;
    if (!arg) {
      continue;
    }

    if (arg_type === 'string') {
      classes.push(arg as string);
    } else if (arg_type === 'object') {
      for (const key in arg as object) {
        arg[key] && classes.push(key);
      }
    }
  }
  return classes.join(' ');
};
