import ts from 'typescript';

class JSDocManager {
  jsdocRecord: Record<string, { version: number; content: string | null }> = {};

  getJSDoc(path: string) {
    return this.jsdocRecord[path];
  }

  setJSDoc(path: string, version: number, content: string | null) {
    this.jsdocRecord[path] = { version, content };
  }

  parseJSDoc(sourceFile: ts.SourceFile) {
    const componentName = this.findComponentName(sourceFile);
    if (componentName) {
      const componentNode = this.findComponentNode(sourceFile, componentName);
      if (componentNode) {
        const leadingCommentRanges =
          ts.getLeadingCommentRanges(sourceFile.text, componentNode.pos) || [];
        return leadingCommentRanges
          .map((range) => sourceFile.text.substring(range.pos, range.end))
          .join('\n');
      }
    }
    return null;
  }

  private findComponentNode(tsNode: ts.Node | ts.SourceFile, componentName: string) {
    let componentNode: ts.Node | undefined;
    ts.forEachChild(tsNode, (node: ts.Node) => {
      if (
        ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (declaration) =>
            ts.isIdentifier(declaration.name) && declaration.name.escapedText === componentName,
        )
      ) {
        componentNode = node;
      } else if (ts.isFunctionDeclaration(node) && node.name?.escapedText === componentName) {
        componentNode = node;
      } else if (ts.isClassDeclaration(node) && node.name?.escapedText === componentName) {
        componentNode = node;
      } else {
        componentNode = this.findComponentNode(node, componentName);
      }
    });
    return componentNode;
  }

  private findComponentName(tsNode: ts.Node | ts.SourceFile) {
    let componentName: string | undefined;
    ts.forEachChild(tsNode, (node: ts.Node) => {
      if (!componentName) {
        if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) {
          componentName = String(node.expression.escapedText);
        } else {
          componentName = this.findComponentName(node);
        }
      }
    });
    return componentName;
  }
}

let jsDocManager: JSDocManager;

export default function getJSDocManager() {
  if (!jsDocManager) {
    jsDocManager = new JSDocManager();
  }
  return jsDocManager;
}
