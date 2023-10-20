interface RangeRecord {
  version: number;
  ignoreWhole: boolean;
  lines: number[];
}

class IgnoreRangeRecorder {
  rangeMap: Record<string, RangeRecord> = {};

  get(uri: string): RangeRecord | undefined {
    return this.rangeMap[uri];
  }

  set(uri: string, record: RangeRecord) {
    this.rangeMap[uri] = record;
  }
}

let ignoreRangeRecorder: IgnoreRangeRecorder;

export default function getIgnoreRangeRecorder() {
  if (!ignoreRangeRecorder) {
    ignoreRangeRecorder = new IgnoreRangeRecorder();
  }
  return ignoreRangeRecorder;
}
