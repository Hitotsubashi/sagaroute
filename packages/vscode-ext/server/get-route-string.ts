/* eslint-disable no-cond-assign */
import ts from 'typescript';

export default function getRouteStringLiteral(
  sourcefile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
) {
  return traverse(sourcefile, typeChecker);
}

function traverse(tsNode: ts.Node | ts.SourceFile, typeChecker: ts.TypeChecker) {
  const matchNode: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] = [];
  ts.forEachChild(tsNode, (node: ts.Node) => {
    let tsNodes: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] | undefined;
    if ((tsNodes = isNavigationFunction(node, typeChecker))) {
      matchNode.push(...tsNodes);
    } else if ((tsNodes = isLinkOrNavigate(node, typeChecker))) {
      matchNode.push(...tsNodes);
    } else {
      matchNode.push(...traverse(node, typeChecker));
    }
  });
  return matchNode;
}

function isNavigationFunction(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (
    ts.isCallExpression(node) &&
    typeChecker.typeToString(typeChecker.getTypeAtLocation(node.expression)) ===
      'NavigateFunction' &&
    node.arguments[0]
  ) {
    return extractStringArgument(node.arguments[0]);
  }
  return undefined;
}

function isLinkOrNavigate(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    const type = typeChecker.typeToString(typeChecker.getTypeAtLocation(node.tagName));
    if (type.includes('LinkProps') || type.includes('NavigateProps')) {
      const toProperty = node.attributes.properties.find(
        (property) =>
          ts.isJsxAttribute(property) && property.name.escapedText === 'to' && property.initializer,
      ) as ts.JsxAttribute | undefined;
      if (toProperty) {
        const { initializer } = toProperty;
        if (ts.isJsxExpression(initializer!) && initializer.expression) {
          return extractStringArgument(initializer.expression);
        } else {
          return extractStringArgument(initializer!);
        }
      }
    }
  }
  return undefined;
}

// function isNavigate(node: ts.Node, typeChecker: ts.TypeChecker){
//   if (
//     (ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)) &&
//     typeChecker.typeToString(typeChecker.getTypeAtLocation(node.tagName)).includes('NavigateProps')
//   ) {
//     const toProperty = node.attributes.properties.find(
//       (property) =>
//         ts.isJsxAttribute(property) && property.name.escapedText === 'to' && property.initializer,
//     ) as ts.JsxAttribute | undefined;
//     if (toProperty) {
//       const { initializer } = toProperty;
//       if (ts.isJsxExpression(initializer!) && initializer.expression) {
//         return extractStringArgument(initializer.expression);
//       } else {
//         return extractStringArgument(initializer!);
//       }
//     }
//   }
//   return undefined;
// }

function extractStringArgument(argNode: ts.Node) {
  const nodes: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] = [];
  if (!argNode) {
    return nodes;
  }
  if (ts.isConditionalExpression(argNode)) {
    nodes.push(...extractStringArgument(argNode.whenTrue));
    nodes.push(...extractStringArgument(argNode.whenFalse));
  } else if (ts.isNoSubstitutionTemplateLiteral(argNode) || ts.isStringLiteral(argNode)) {
    nodes.push(argNode);
  }
  return nodes;
}
