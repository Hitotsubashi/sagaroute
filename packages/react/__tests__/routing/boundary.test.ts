import SagaRoute from "@/index";

test("test routing with error option which hook is number", () => {
  expect(() => {
    new SagaRoute({
      dirpath: "1",
      hooks: {
        gather: {
          // @ts-ignore
          before: 1,
        },
      },
    });
  }).toThrow(
    `hooks.gather.before must be one of the following type:
    1. function.
    2. an array filled with function.
    3. an object as {order: number,handler: function}.
    4. an array filled with object as {order: number,handler: function}.`
  );
});

test("test routing with error option which hook is array of number", () => {
  expect(() => {
    new SagaRoute({
      dirpath: "1",
      hooks: {
        gather: {
          // @ts-ignore
          after: [1],
        },
      },
    });
  }).toThrow(
    `hooks.gather.after must be one of the following type:
    1. function.
    2. an array filled with function.
    3. an object as {order: number,handler: function}.
    4. an array filled with object as {order: number,handler: function}.`
  );
});

test("test routing with error option which hook is array of number", () => {
  expect(() => {
    new SagaRoute({
      dirpath: "1",
      hooks: {
        gather: {
          // @ts-ignore
          after: [1],
        },
      },
    });
  }).toThrow(
    `hooks.gather.after must be one of the following type:
    1. function.
    2. an array filled with function.
    3. an object as {order: number,handler: function}.
    4. an array filled with object as {order: number,handler: function}.`
  );
});
