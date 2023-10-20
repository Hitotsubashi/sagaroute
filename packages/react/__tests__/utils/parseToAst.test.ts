import parseToAst from '@/utils/parseToAst';

test('test parseAst when parsed file has syntax error', () => {
  const filepath = 'a.tsx';
  expect(() => {
    parseToAst('const a=;', false, filepath);
  }).toThrow(`The file whose path is [ ${filepath} ] has syntax errors`);
});
