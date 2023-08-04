import path from 'path';
import gather, {
  GatherHookAfter,
  GatherHookAfterEach,
  GatherHookBefore,
  GatherHookBeforeEach,
} from '@/gather';
import print, {
  PrintHookAfterInject,
  PrintHookAfterParse,
  PrintHookAfterWrite,
  PrintHookBeforeInject,
  PrintHookBeforeParse,
  PrintHookBeforeWrite,
} from '@/print';
import weave, {
  LazyFn,
  WeaveHookAfter,
  WeaveHookAfterEach,
  WeaveHookBefore,
  WeaveHookBeforeEach,
} from '@/weave';
import transformRoutesToString from '@/utils/transformRoutesToString';
import validate from '@/validate';
import loadFileConfig from '@/loadConfig';
import mergeOption from '@/utils/mergeOption';
import hookCompose from '@/utils/hookCompose';
import hookNormalize from '@/utils/hookNormalize';

type OrderHandler<T> = { order: number; handler: T };

export type Handler<T> = T | T[] | OrderHandler<T> | OrderHandler<T>[];

export interface RoutingOption extends BasicRoutingOption {
  pathRewrite?: Record<string, string>;
  hooks?: {
    build?: {
      before?: Handler<HookBeforeBuild>;
      after?: Handler<HookAfterBuild>;
    };
    gather?: {
      before?: Handler<GatherHookBefore>;
      beforeEach?: Handler<GatherHookBeforeEach>;
      afterEach?: Handler<GatherHookAfterEach>;
      after?: Handler<GatherHookAfter>;
    };
    weave?: {
      before?: Handler<WeaveHookBefore>;
      beforeEach?: Handler<WeaveHookBeforeEach>;
      afterEach?: Handler<WeaveHookAfterEach>;
      after?: Handler<WeaveHookAfter>;
    };
    print?: {
      parse?: {
        before?: Handler<PrintHookBeforeParse>;
        after?: Handler<PrintHookAfterParse>;
      };
      inject?: {
        before?: Handler<PrintHookBeforeInject>;
        after?: Handler<PrintHookAfterInject>;
      };
      write?: {
        before?: Handler<PrintHookBeforeWrite>;
        after?: Handler<PrintHookAfterWrite>;
      };
    };
  };
}

export type HookBeforeBuild = (inputOption?: RoutingOption) => void | UltimateRoutingOption;
export type HookAfterBuild = (ultimateOption: UltimateRoutingOption) => void;

interface UltimateRoutingOption extends BasicRoutingOption {
  dirpath: string;
  layoutDirPath: string;
  pathRewrite?: [RegExp, string][];
  routeFilePath: string;
  relativeDirpath: string;
  relativeLayoutDirPath: string;
  hooks: {
    build: {
      before?: HookBeforeBuild[];
      after?: HookAfterBuild[];
    };
    gather: {
      before?: GatherHookBefore[];
      beforeEach?: GatherHookBeforeEach[];
      afterEach?: GatherHookAfterEach[];
      after?: GatherHookAfter[];
    };
    weave: {
      before?: WeaveHookBefore[];
      beforeEach?: WeaveHookBeforeEach[];
      afterEach?: WeaveHookAfterEach[];
      after?: WeaveHookAfter[];
    };
    print: {
      parse: {
        before?: PrintHookBeforeParse[];
        after?: PrintHookAfterParse[];
      };
      inject: {
        before?: PrintHookBeforeInject[];
        after?: PrintHookAfterInject[];
      };
      write?: {
        before?: PrintHookBeforeWrite[];
        after?: PrintHookAfterWrite[];
      };
    };
  };
}

interface BasicRoutingOption {
  rootPath?: string;
  dirpath?: string;
  layoutDirPath?: string;
  routeFilePath?: string;
  lazy?: boolean | LazyFn;
  onWarning?: (message: string) => void;
}

function normalizeToUltimateOption(inputOption: RoutingOption): UltimateRoutingOption {
  const rootPath = inputOption.rootPath ?? process.cwd();
  const ultimateOption: UltimateRoutingOption = {
    ...inputOption,
    pathRewrite: inputOption.pathRewrite
      ? Object.entries(inputOption.pathRewrite).map(([rule, replaced]) => [
          new RegExp(rule),
          replaced,
        ])
      : undefined,
    dirpath: inputOption.dirpath
      ? path.isAbsolute(inputOption.dirpath)
        ? inputOption.dirpath
        : path.join(rootPath, inputOption.dirpath)
      : path.join(rootPath, 'src', 'pages'),
    layoutDirPath: inputOption.layoutDirPath
      ? path.isAbsolute(inputOption.layoutDirPath)
        ? inputOption.layoutDirPath
        : path.join(rootPath, inputOption.layoutDirPath)
      : path.join(rootPath, 'src', 'layouts'),
    routeFilePath: inputOption.routeFilePath
      ? path.isAbsolute(inputOption.routeFilePath)
        ? inputOption.routeFilePath
        : path.join(rootPath, inputOption.routeFilePath)
      : path.join(rootPath, 'src', 'routes.tsx'),
    relativeDirpath: '',
    relativeLayoutDirPath: '',
    hooks: {
      build: {
        before: hookNormalize(inputOption.hooks?.build?.before),
        after: hookNormalize(inputOption.hooks?.build?.after),
      },
      gather: {
        before: hookNormalize(inputOption.hooks?.gather?.before),
        beforeEach: hookNormalize(inputOption.hooks?.gather?.beforeEach),
        afterEach: hookNormalize(inputOption.hooks?.gather?.afterEach),
        after: hookNormalize(inputOption.hooks?.gather?.after),
      },
      weave: {
        before: hookNormalize(inputOption.hooks?.weave?.before),
        beforeEach: hookNormalize(inputOption.hooks?.weave?.beforeEach),
        afterEach: hookNormalize(inputOption.hooks?.weave?.afterEach),
        after: hookNormalize(inputOption.hooks?.weave?.after),
      },
      print: {
        parse: {
          before: hookNormalize(inputOption.hooks?.print?.parse?.before),
          after: hookNormalize(inputOption.hooks?.print?.parse?.after),
        },
        inject: {
          before: hookNormalize(inputOption.hooks?.print?.inject?.before),
          after: hookNormalize(inputOption.hooks?.print?.inject?.after),
        },
        write: {
          before: hookNormalize(inputOption.hooks?.print?.write?.before),
          after: hookNormalize(inputOption.hooks?.print?.write?.after),
        },
      },
    },
  };
  ultimateOption.relativeDirpath = path.relative(
    ultimateOption.routeFilePath,
    ultimateOption.dirpath,
  );
  ultimateOption.relativeLayoutDirPath = path.relative(
    ultimateOption.routeFilePath,
    ultimateOption.layoutDirPath,
  );

  return ultimateOption;
}

export { transformRoutesToString };

export default class SagaRoute {
  options!: UltimateRoutingOption;

  generateOptions(option?: RoutingOption) {
    let inputOption: RoutingOption = option || {};
    let ultimateOption: UltimateRoutingOption | undefined | void = hookCompose(
      hookNormalize(option?.hooks?.build?.before),
      inputOption,
    );
    if (!ultimateOption) {
      const configFileOption = loadFileConfig(inputOption?.rootPath ?? process.cwd());
      if (configFileOption) {
        inputOption = mergeOption(inputOption, configFileOption);
      }
      if (inputOption) {
        validate(inputOption);
      }
      ultimateOption = normalizeToUltimateOption(inputOption);
    }
    this.options = ultimateOption;
    hookCompose(ultimateOption.hooks.build.after, ultimateOption);
  }

  constructor(option?: RoutingOption) {
    this.generateOptions(option);
  }

  routing() {
    const fileNodes = gather({
      ...this.options,
      hooks: this.options.hooks.gather,
    });
    if (fileNodes === null) return;
    const weaveResult = weave(fileNodes, {
      ...this.options,
      hooks: this.options.hooks.weave,
    });
    if (weaveResult === null) return;
    print(weaveResult.routes, weaveResult.imports, {
      ...this.options,
      hooks: this.options.hooks.print,
    });
  }
}
