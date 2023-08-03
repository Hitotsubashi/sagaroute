import { bgBlue, bgGreen, bgRed, bgYellow, black } from "colorette";
import {
  FileNode,
  GatherHookAfter,
  GatherHookAfterEach,
  GatherHookBefore,
  GatherHookBeforeEach,
} from "@sagaroute/react/lib/gather";
import stdoutManager from "./stdoutManager";
import {
  FileNodeParent,
  Imports,
  RouteObject,
  WeaveHookAfter,
  WeaveHookAfterEach,
  WeaveHookBefore,
  WeaveHookBeforeEach,
} from "@sagaroute/react/lib/weave";
import {
  PrintHookAfterInject,
  PrintHookAfterParse,
  PrintHookBeforeInject,
  PrintHookBeforeParse,
} from "@sagaroute/react/lib/print";
import { HookBeforeBuild, HookAfterBuild } from "@sagaroute/react/lib/index";

export const stdoutBadge = {
  info: bgBlue(black(" INFO ")),
  done: bgGreen(black(" DONE ")),
  fail: bgRed(black(" FAIL ")),
  warn: bgYellow(black(" WARN ")),
};

export const buildHookBeforeStdout: HookBeforeBuild = () => {
  stdoutManager.set(
    {},
    {
      progress: 1,
      stage: "build",
      status: "start",
      message: "",
    }
  );
};

export const buildHookAfterStdout: HookAfterBuild = () => {
  stdoutManager.set(
    {},
    {
      progress: 4,
      stage: "build",
      status: "end",
      message: "",
    }
  );
};

export const gatherHookBeforeStdout: GatherHookBefore = (
  dirpath: string,
  layoutDirPath: string
) => {
  stdoutManager.set(
    {},
    {
      progress: 5,
      stage: "gather",
      status: "start",
      message: `dirpath:${dirpath}, layoutDirPath:${layoutDirPath}`,
    }
  );
};

export const gatherHookBeforeEachStdout: GatherHookBeforeEach = (
  fileNodePath: string
) => {
  stdoutManager.set(
    {},
    {
      progress: 35,
      status: "start:node",
      message: `fileNodePath: ${fileNodePath}`,
    }
  );
};

let fileNodeCount = 0;
let perWeaveStep = 0;

export const gatherHookAfterEachStdout: GatherHookAfterEach = (
  fileNode: FileNode,
  fileNodePath: string
) => {
  fileNodeCount += 1;
  stdoutManager.set(
    {},
    {
      progress: 35,
      status: "done:node",
      message: `fileNodePath: ${fileNodePath}`,
    }
  );
};

export const gatherHookAfterStdout: GatherHookAfter = () => {
  stdoutManager.set(
    {},
    {
      progress: 40,
      status: "done",
      message: "",
    }
  );
};

export const weaveHookBeforeStdout: WeaveHookBefore = () => {
  perWeaveStep = Math.ceil((90 - 40) / fileNodeCount);
  stdoutManager.set(
    {},
    {
      stage: "weave",
      status: "start",
      message: "",
    }
  );
};

export const weaveHookBeforeEachStdout: WeaveHookBeforeEach = (
  fileNode: FileNode,
  parent: FileNodeParent
) => {
  stdoutManager.set(
    {},
    {
      status: "start:node",
      message: `fileNode.name: ${fileNode.name}, parent: ${parent}`,
    }
  );
};

export const weaveHookAfterEachStdout: WeaveHookAfterEach = (
  route: RouteObject | null,
  imports: Imports,
  fileNode: FileNode,
  parent: FileNodeParent
) => {
  let progress = stdoutManager.content!.progress + perWeaveStep;
  if (progress > 90) {
    progress = 90;
  }
  stdoutManager.set(
    {},
    {
      progress,
      status: "done:node",
      message: `fileNode.name: ${fileNode.name}, parent: ${parent}`,
    }
  );
};

export const weaveHookAfterStdout: WeaveHookAfter = () => {
  stdoutManager.set(
    {},
    {
      status: "done",
    }
  );
};

export const printHookBeforeParseStdout: PrintHookBeforeParse = (
  routeFilePath: string
) => {
  stdoutManager.set(
    {},
    {
      progress: 92,
      stage: "print",
      status: "parse:start",
      message: `routeFilePath: ${routeFilePath}`,
    }
  );
};

export const printHookAfterParseStdout: PrintHookAfterParse = () => {
  stdoutManager.set(
    {},
    {
      progress: 94,
      status: "parse:done",
    }
  );
};

export const printHookBeforeInjectStdout: PrintHookBeforeInject = () => {
  stdoutManager.set(
    {},
    {
      progress: 96,
      status: "inject:start",
    }
  );
};

export const printHookAfterInjectStdout: PrintHookAfterInject = () => {
  stdoutManager.set(
    {},
    {
      progress: 98,
      status: "inject:done",
    }
  );
};
