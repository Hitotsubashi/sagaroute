import { Handler } from "..";

export default function hookNormalize<T extends Function>(
  hook: undefined | Handler<T>
): T[] | undefined {
  if (Array.isArray(hook)) {
    const handlers: { order: number; handler: T }[] = hook.map((item) => {
      if (typeof item === "function") {
        return {
          order: 50,
          handler: item,
        };
      }
      return item;
    });
    return handlers
      .sort((a, b) => a.order - b.order)
      .map(({ handler }) => handler);
  } else {
    if (typeof hook === "object") {
      return [hook.handler];
    }
    return hook ? [hook] : undefined;
  }
}
