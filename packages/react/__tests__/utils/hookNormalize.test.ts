import hookNormalize from "@/utils/hookNormalize";

test("hookNormalize with different order handler", () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const fn3 = jest.fn();
  const fn4 = jest.fn();
  expect(
    hookNormalize([
      { order: 60, handler: fn4 },
      { order: 1, handler: fn1 },
      fn2 as any,
      { order: 50, handler: fn3 },
    ])
  ).toStrictEqual([fn1, fn2, fn3, fn4]);
});
