import { EVAL_STRING_SYMBOL } from './src/utils/symbol';

function areEvalStringEqual(a: unknown, b: unknown): boolean | undefined {
  if (
    typeof a === 'string' &&
    a.startsWith(EVAL_STRING_SYMBOL) &&
    typeof b === 'string' &&
    b.startsWith(EVAL_STRING_SYMBOL)
  ) {
    if (a === b) {
      return true;
    } else {
      const aModifiedStr = a.replace(/\s/g, '');
      const bModifiedStr = b.replace(/\s/g, '');
      return aModifiedStr === bModifiedStr;
    }
  } else {
    return undefined;
  }
}

beforeAll(() => {
  // @ts-ignore
  expect.addEqualityTesters([areEvalStringEqual]);
});
