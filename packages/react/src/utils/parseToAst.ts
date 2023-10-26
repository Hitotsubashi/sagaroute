import { parse, ParserPlugin } from '@babel/parser';

export default function parseToAst(content: string, isTsx: boolean, filepath: string) {
  const plugins: ParserPlugin[] = ['jsx'];
  if (isTsx) {
    plugins.push('typescript');
  }
  try {
    return parse(content, {
      sourceType: 'module',
      plugins,
    });
  } catch (err) {
    throw new Error(`The file whose path is [ ${filepath} ] has syntax errors`);
  }
}
