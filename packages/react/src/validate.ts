import { object, string, mixed } from 'yup';
import { RoutingOption } from '.';

const handlerValidate = (value: any) => {
  return (
    typeof value === 'function' ||
    (typeof value === 'object' &&
      typeof value.order === 'number' &&
      typeof value.handler === 'function')
  );
};

const hookSchema = mixed().test(
  'is-hook',
  `\${path} must be one of the following type:
    1. function.
    2. an array filled with function.
    3. an object as {order: number,handler: function}.
    4. an array filled with object as {order: number,handler: function}.`,
  (value) => {
    if (Array.isArray(value)) {
      return value.every((item) => handlerValidate(item));
    } else {
      return !value || handlerValidate(value);
    }
  },
);

const pathRewriteSchema = object().test(
  'is-pathrewrite',
  '${path} must be a object with string key and string value.',
  (value) => {
    return (
      value === undefined ||
      (typeof value === 'object' && Object.values(value).every((item) => typeof item === 'string'))
    );
  },
);

const schema = object({
  dirpath: string(),
  layoutDirPath: string(),
  routeFilePath: string(),
  pathRewrite: pathRewriteSchema,
  hooks: object({
    gather: object({
      before: hookSchema,
      beforeEach: hookSchema,
      afterEach: hookSchema,
      after: hookSchema,
    }),
    weave: object({
      before: hookSchema,
      beforeEach: hookSchema,
      afterEach: hookSchema,
      after: hookSchema,
    }),
    print: object({
      parse: object({
        before: hookSchema,
        after: hookSchema,
      }),
      inject: object({
        before: hookSchema,
        after: hookSchema,
      }),
      write: object({
        before: hookSchema,
        after: hookSchema,
      }),
    }),
  }),
});

export default function validate(options: RoutingOption) {
  try {
    schema.validateSync(options, { strict: true });
  } catch (err: any) {
    const message = err.errors.join(',');
    throw new Error(message);
  }
}
