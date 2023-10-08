import ts from 'typescript';

export default function getRouteStringLiteral(
  sourcefile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
) {
  return traverse(sourcefile, typeChecker);
}

function traverse(
  tsNode: ts.Node | ts.SourceFile,
  typeChecker: ts.TypeChecker,
): ts.StringLiteral[] {
  const matchNode: ts.StringLiteral[] = [];
  ts.forEachChild(tsNode, (node: ts.Node) => {
    if (isNavigationFunction(node, typeChecker)) {
      matchNode.push(node.arguments[0] as ts.StringLiteral);
    } else {
      matchNode.push(...traverse(node, typeChecker));
    }
  });
  return matchNode;
}

function isNavigationFunction(
  node: ts.Node,
  typeChecker: ts.TypeChecker,
): node is ts.CallExpression {
  if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
    const stringType = typeChecker?.typeToString(typeChecker?.getTypeAtLocation(node.expression));
    console.log('stringType', stringType);
    if (stringType === 'NavigateFunction') {
      return true;
    }
  }
  return false;
}
