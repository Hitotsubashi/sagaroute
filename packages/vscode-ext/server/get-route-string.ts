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
    const stringType = typeChecker.typeToString(typeChecker.getTypeAtLocation(node.expression));
    if (stringType === 'NavigateFunction') {
      return true;
    }
  }
  return false;
}

function isLink(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.JsxOpeningElement {
  if (ts.isJsxOpeningElement(node)) {
    const toProperty = node.attributes.properties.find(
      (property) =>
        ts.isJsxAttribute(property) &&
        property.name.escapedText === 'to' &&
        property.initializer &&
        ts.isStringLiteral(property.initializer),
    );
    if (toProperty) {
      const stringType = typeChecker.typeToString(typeChecker.getTypeAtLocation(node.tagName));
      return stringType.includes('LinkProps');
    }
  }
  return false;
}
