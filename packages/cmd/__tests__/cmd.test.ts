import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

test('use cmd', (done) => {
  exec('cd ./__tests__/ignore-test-normal && sagaroute', (error) => {
    if (error) {
      done(error);
      return;
    }
    const context = fs.readFileSync(
      path.join(__dirname, 'ignore-test-normal', 'src', 'routes.tsx'),
      'utf-8',
    );
    expect(context).toMatchSnapshot();
    done();
  });
});

test('use cmd with specified routeFilePath and lazy ', (done) => {
  exec(
    'cd ./__tests__/ignore-test-normal && sagaroute --routeFilePath=./src/routes1.tsx --lazy=true',
    (error) => {
      if (error) {
        done(error);
        return;
      }
      const context = fs.readFileSync(
        path.join(__dirname, 'ignore-test-normal', 'src', 'routes1.tsx'),
        'utf-8',
      );
      expect(context).toMatchSnapshot();
      done();
    },
  );
});

test('use cmd with specified dirpath and layoutDirPath ', (done) => {
  exec(
    'cd ./__tests__/ignore-test-dirpath && sagaroute --dirpath=src/views --layoutDirPath=./src/dashboard',
    (error) => {
      if (error) {
        done(error);
        return;
      }
      const context = fs.readFileSync(
        path.join(__dirname, 'ignore-test-dirpath', 'src', 'routes.tsx'),
        'utf-8',
      );
      expect(context).toMatchSnapshot();
      done();
    },
  );
});

test('use cmd with specified error dirpath', (done) => {
  exec('cd ./__tests__/ignore-test-dirpath && sagaroute --dirpath=./src/pages', (error) => {
    expect(error?.message).toEqual(
      expect.stringContaining(
        `Cannot find folder with path "${path.join(
          __dirname,
          '/ignore-test-dirpath',
          './src/pages',
        )}"`,
      ),
    );
    done();
  });
});

test('use cmd with warnings include lost variable in both view and template', (done) => {
  exec('cd ./__tests__/ignore-test-warning && sagaroute', (error, stdout) => {
    if (error) {
      done(error);
      return;
    }
    const problem1 = `1. The view of stage<print.inject.before> has no variables such as [prefix] which are needed in template.`;
    expect(stdout).toEqual(
      expect.stringContaining(
        `sagaroute has completed the work, but there are the following problems:\n${problem1}`,
      ),
    );
    done();
  });
});
