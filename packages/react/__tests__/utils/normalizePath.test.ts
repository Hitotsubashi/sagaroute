import normalizePath, { normalizePathSep } from '@/utils/normalizePath';
import path from 'path';

test('test normalizePathSep', () => {
  expect(normalizePathSep(path.join('a', 'b', 'c.tsx'))).toEqual('a/b/c.tsx');
});

test('test normalizePathSep with multiple pathRewrite', () => {
  expect(
    normalizePath('./cloud/index.tsx', [
      [new RegExp('.tsx$'), ''],
      [new RegExp('^./'), '@/'],
    ]),
  ).toEqual('@/cloud/index');
});
