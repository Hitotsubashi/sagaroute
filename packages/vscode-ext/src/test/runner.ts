import * as path from 'path';
// @ts-ignore
import Mocha from 'mocha';

declare type Mocha = any;

export default function runner(testPath: string) {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = __dirname;

  return new Promise((c: any, e: any) => {
    mocha.addFile(path.resolve(testsRoot, testPath));
    try {
      // Run the mocha test
      mocha.run((failures: any) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      console.error(err);
      e(err);
    }
  });
}
