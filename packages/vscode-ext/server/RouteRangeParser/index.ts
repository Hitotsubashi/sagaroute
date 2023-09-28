interface RouteRange {
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
  location: string;
  hover: string;
}

class RangeRecorder {
  rangeMap: Record<string, { version: number; ranges: RouteRange[] }> = {};

  get(uri: string) {
    return this.rangeMap[uri];
  }

  set(uri: string, ranges: RouteRange[], version: number) {
    this.rangeMap[uri] = { version, ranges };
  }
}
