export interface RouteRange {
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
  text: string;
  // location: string;
  // hover: string;
}

interface RangeRecord {
  version: number;
  ranges: RouteRange[];
}

class RouteRangeRecorder {
  rangeMap: Record<string, RangeRecord> = {};

  get(uri: string): RangeRecord | undefined {
    return this.rangeMap[uri];
  }

  set(uri: string, ranges: RouteRange[], version: number) {
    this.rangeMap[uri] = { version, ranges };
  }
}

let routeRangeRecorder: RouteRangeRecorder;

export default function getRouteRangeRecorder() {
  if (!routeRangeRecorder) {
    routeRangeRecorder = new RouteRangeRecorder();
  }
  return routeRangeRecorder;
}
