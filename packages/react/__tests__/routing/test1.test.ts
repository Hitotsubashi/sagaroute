import SagaRoute from '@/index';
import fs from 'fs';
import path from 'path';

test('test1: routing with sagaroute.config.js', () => {
  const spy = jest.spyOn(process, 'cwd');
  const consoleSpy = jest.spyOn(console, 'log');
  spy.mockReturnValue(path.join(__dirname, 'test-fixtures', 'test1'));
  const sagaRoute = new SagaRoute();
  sagaRoute.routing();
  expect(consoleSpy).toHaveBeenCalledWith('gatherBefore');
  const context = fs.readFileSync(
    path.join('__tests__/routing/test-fixtures/test1/src/router/route.tsx'),
    'utf-8',
  );
  expect(context).toMatchSnapshot();
  consoleSpy.mockRestore();
});
