import * as path from 'path';
import { run } from 'jest-cli';
import glob from 'glob';
// export function runWithJest() {
//   run([path.join(__dirname, 'extension.test.ts')]).then((value) => {
//     console.log(value);
//   });
// }

// runWithJest();

export function runWithJest(): Promise<void> {
  const testFiles: string[] = [];
  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f) => testFiles.push(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        run(testFiles);
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}
