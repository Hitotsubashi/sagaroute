import ts from 'typescript';

export default function getIgnoreCommentRanges(sourcefile: ts.SourceFile) {
  return traverse(sourcefile, sourcefile.getFullText());
}

const DISABLE_NEXT_LINE = 'sagaroute-ignore-next-line';
const DISABLE_WHOLE_FILE = 'sagaroute-ignore';

function traverse(tsNode: ts.Node | ts.SourceFile, text: string) {
  const ranges: { end: number; whole: boolean }[] = [];
  ts.forEachChild(tsNode, (node: ts.Node) => {
    const leadingComments = ts.getLeadingCommentRanges(text, node.pos);
    leadingComments?.forEach(({ pos, end, hasTrailingNewLine, kind }) => {
      if (hasTrailingNewLine) {
        const commentLine = text.slice(pos, end);
        const commentContent = commentLine.match(
          kind === 2 ? /^\/\/\s*([^\s]+)\s*$/ : /^\/\*\s*([^\s]+)\s*\*\/$/,
        )?.[1];
        if (commentContent) {
          if (commentContent === DISABLE_NEXT_LINE) {
            ranges.push({ end, whole: false });
          } else if (commentContent === DISABLE_WHOLE_FILE) {
            ranges.push({ end, whole: true });
          }
        }
      }
    });
    ranges.push(...traverse(node, text));
  });
  return ranges;
}
