import getRouteFileRelationManager, { RouteFileRelationManager } from '../RouteFileRelationManager';

const paramRe = /^:\w+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s: string) => s === '*';

function computeScore(path: string, index: boolean | undefined): number {
  const segments = path.split('/');
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }

  if (index) {
    initialScore += indexRouteValue;
  }

  return segments
    .filter((s) => !isSplat(s))
    .reduce(
      (score, segment) =>
        score +
        (paramRe.test(segment)
          ? dynamicSegmentValue
          : segment === ''
          ? emptySegmentValue
          : staticSegmentValue),
      initialScore,
    );
}

export class PathParseManager {
  private routeTestRanks: { route: string; score: number; fpath: string; regexp: RegExp }[] = [];
  private routeFileRelationManager: RouteFileRelationManager;
  private parseCache: Record<string, string | undefined> = {};

  constructor(routeFileRelationManager: RouteFileRelationManager) {
    this.routeFileRelationManager = routeFileRelationManager;
  }

  private transformRouteToRegExp(route: string): RegExp {
    const regExpString = (route.startsWith('/') ? route : '/' + route)
      .split('/')
      .map((segement, index) => {
        const prefix = index === 0 ? '' : '/';
        if (/^:.*\?$/.test(segement)) {
          return `(${prefix}[^/]*)?`;
        } else if (/^:.*$/.test(segement)) {
          return `(${prefix}[^/]+)`;
        } else if (segement.endsWith('?')) {
          return `(${prefix}${segement.slice(0, -1)})?`;
        } else if (segement === '*') {
          return `(${prefix}.*)`;
        } else {
          return prefix + segement;
        }
      })
      .join('');
    return new RegExp(
      `^${regExpString}$`,
      this.routeFileRelationManager.getRoutePathToRouteObjectMap()[route].caseSensitive
        ? undefined
        : 'i',
    );
  }

  compute() {
    this.parseCache = {};
    const routePathToRouteObjectMap = this.routeFileRelationManager.getRoutePathToRouteObjectMap();
    this.routeTestRanks = Object.entries(this.routeFileRelationManager.getRoutePathToFilePathMap())
      .map(([route, fpath]) => ({
        route,
        fpath: fpath!,
        score: computeScore(route, routePathToRouteObjectMap[route]?.index),
        regexp: this.transformRouteToRegExp(route),
      }))
      .filter(({ fpath }) => fpath)
      .sort((a, b) => b.score - a.score);
  }

  parse(pathname: string) {
    if (pathname in this.parseCache) {
      return this.parseCache[pathname];
    }
    const result = this.routeTestRanks.find(({ regexp }) => regexp.test(pathname))?.fpath;
    if (result) {
      this.parseCache[pathname] = result;
    }
    return result;
  }
}

let pathParseManager: PathParseManager;
export default function getPathParseManager() {
  if (!pathParseManager) {
    pathParseManager = new PathParseManager(getRouteFileRelationManager());
  }
  return pathParseManager;
}
