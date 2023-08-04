export default function hookCompose<T extends ((...args: any[]) => any)[]>(
  fns: T | undefined,
  ...args: Parameters<T[0]>
): ReturnType<T[0]> | undefined {
  let result: ReturnType<T[0]> | undefined = undefined;
  if (fns) {
    fns.forEach((fn) => {
      const temp = fn(...args);
      if (temp !== undefined) {
        result = temp;
      }
    });
    return result;
  }
  return result;
}
