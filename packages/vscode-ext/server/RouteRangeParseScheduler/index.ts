import ts from 'typescript';
import getRouteRangeRecorder, { RouteRange } from '../RouteRangeRecorder';
import { TextDocument } from 'vscode-languageserver-textdocument';

interface TaskMeta {
  uri: string;
  version: number;
  nodes: (ts.Node | ts.SourceFile)[];
  matchNodes: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[];
  document: TextDocument;
}

type TaskKey = Pick<TaskMeta, 'uri' | 'version'>;

interface RouteRangeResult {
  expired: boolean;
  ranges: RouteRange[];
}

class RouteRangeParseScheduler {
  private parsingTaskKey: TaskKey | undefined;
  private messagechannel = new MessageChannel();
  // private nodes: (ts.Node | ts.SourceFile)[] = [];
  // private matchNodes: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] = [];
  private frameStartTime: number;
  private typeChecker: ts.TypeChecker;
  private tasks: Record<TaskMeta['uri'], Record<TaskMeta['version'], TaskMeta>> = {};
  private routeRangeRecorder = getRouteRangeRecorder();
  private subscribers: ((value: unknown) => void)[] = [];

  constructor(typeChecker: ts.TypeChecker) {
    this.messagechannel.port2.onmessage = (event) => this.traverse(event.data);
    this.typeChecker = typeChecker;
  }

  private isParsing() {
    return !!this.parsingTaskKey;
  }

  public insertTask(
    uri: string,
    version: number,
    document: TextDocument,
    sourcefile: ts.SourceFile,
  ) {
    const record = this.routeRangeRecorder.get(uri);
    if (record?.version === version) {
      return;
    }
    const task = {
      uri,
      version,
      nodes: [sourcefile],
      matchNodes: [],
      document,
    };
    if (!this.tasks[uri]) {
      this.tasks[uri] = {};
    }
    if (!this.tasks[uri][version]) {
      this.tasks[uri][version] = task;
      if (this.parsingTaskKey) {
        delete this.tasks[this.parsingTaskKey.uri][this.parsingTaskKey.version];
      }
      this.parsingTaskKey = { uri, version };
      this.traverse(this.parsingTaskKey);
    }
  }

  private judgeIfFramePass() {
    const time = performance.now();
    if (this.frameStartTime && time - this.frameStartTime > 5) {
      this.frameStartTime = time;
      return true;
    } else {
      return false;
    }
  }

  private traverse(taskkey: TaskKey) {
    const { uri, version } = taskkey;
    if (this.tasks[uri]?.[version]) {
      const { nodes, matchNodes } = this.tasks[uri][version];
      const parsingNode = nodes.shift();
      if (parsingNode) {
        matchNodes.push(...this.parse(parsingNode));
        ts.forEachChild(parsingNode, (node) => {
          nodes.push(node);
        });
        if (this.judgeIfFramePass()) {
          this.pause(taskkey);
        } else {
          this.traverse(taskkey);
        }
      } else {
        const { matchNodes, document } = this.tasks[uri][version];
        const ranges: RouteRange[] = matchNodes.map(({ pos, end, text }) => {
          const { line: startLine, character: startCharacter } = document.positionAt(pos);
          const { line: endLine, character: endCharacter } = document.positionAt(end);
          return {
            startLine,
            startCharacter,
            endLine,
            endCharacter,
            text,
          };
        });
        this.routeRangeRecorder.set(uri, ranges, version);
        this.subscribers.forEach((resolve) => resolve(null));
        this.parsingTaskKey = undefined;
      }
    }
  }

  private parse(parsingNode: ts.Node | ts.SourceFile) {
    let tsNodes: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] | undefined;
    if (
      (tsNodes = this.isToFunction(parsingNode)) ||
      (tsNodes = this.isLinkOrNavigate(parsingNode))
    ) {
      return tsNodes;
    } else {
      return [];
    }
  }

  private isToFunction(node: ts.Node) {
    if (ts.isCallExpression(node) && node.arguments[0]) {
      const functionType = this.typeChecker.getTypeAtLocation(node.expression);

      if (
        functionType.symbol &&
        [
          'useHref',
          'useLinkClickHandler',
          'useResolvedPath',
          'NavigateFunction',
          'useViewTransitionState',
        ].includes(this.typeChecker.symbolToString(functionType.symbol))
      ) {
        const functionParamSymbols = functionType.getCallSignatures()[0]?.getParameters();
        if (functionParamSymbols[0].getName() === 'to') {
          return this.extractStringArgument(node.arguments[0]);
        }
      }
    }
    return undefined;
  }

  private isLinkOrNavigate(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const type = this.typeChecker.typeToString(this.typeChecker.getTypeAtLocation(node.tagName));
      if (type.includes('LinkProps') || type.includes('NavigateProps')) {
        const toProperty = node.attributes.properties.find(
          (property) =>
            ts.isJsxAttribute(property) &&
            ts.isIdentifier(property.name) &&
            property.name.escapedText === 'to' &&
            property.initializer,
        ) as ts.JsxAttribute | undefined;
        if (toProperty) {
          const { initializer } = toProperty;
          if (ts.isJsxExpression(initializer!) && initializer.expression) {
            return this.extractStringArgument(initializer.expression);
          } else {
            return this.extractStringArgument(initializer!);
          }
        }
      }
    }
    return undefined;
  }

  private extractStringArgument(argNode: ts.Node) {
    const nodes: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] = [];
    if (!argNode) {
      return nodes;
    }
    if (ts.isConditionalExpression(argNode)) {
      nodes.push(...this.extractStringArgument(argNode.whenTrue));
      nodes.push(...this.extractStringArgument(argNode.whenFalse));
    } else if (ts.isNoSubstitutionTemplateLiteral(argNode) || ts.isStringLiteral(argNode)) {
      nodes.push(argNode);
    }
    return nodes;
  }

  public pause(taskkey: TaskKey) {
    const { port1 } = this.messagechannel;
    port1.postMessage(taskkey);
  }

  public async getRouteRange(uri: string, version: number) {
    if (this.isParsing()) {
      await new Promise((resolve) => {
        this.subscribers.push(resolve);
      });
    }
    return this.getSyncRouteRange(uri, version);
  }

  private getSyncRouteRange(uri: string, version: number): RouteRangeResult {
    const record = this.routeRangeRecorder.get(uri);
    if (!record || record.version !== version) {
      return {
        expired: true,
        ranges: [],
      };
    }
    return {
      expired: false,
      ranges: record.ranges,
    };
  }
}

let routeRangeParseScheduler: RouteRangeParseScheduler;

export default function getRouteRangeParseScheduler(typeChecker: ts.TypeChecker) {
  if (!routeRangeParseScheduler) {
    routeRangeParseScheduler = new RouteRangeParseScheduler(typeChecker);
  }
  return routeRangeParseScheduler;
}
