export type PartialRequired<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & Pick<T, Exclude<keyof T, K>>;

export type ValueOf<T> = T[keyof T];
