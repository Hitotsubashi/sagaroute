import { parse, ParserPlugin } from '@babel/parser';

export default function parseToAst(content: string, isTsx = false) {
  const plugins: ParserPlugin[] = ['jsx'];
  if (isTsx) {
    plugins.push('typescript');
  }
  return parse(content, {
    sourceType: 'module',
    plugins,
  });
}
