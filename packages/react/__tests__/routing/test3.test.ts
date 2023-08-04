import path from 'path';
import SagaRoute from '@/index';
import fs from 'fs';

test('test routing that has same import between route and pagefile.', () => {
  const sagaRoute = new SagaRoute({
    rootPath: path.join(__dirname, 'test-fixtures', 'test3'),
  });
  sagaRoute.routing();
  const context = fs.readFileSync(
    path.join(__dirname, 'test-fixtures', 'test3', 'src', 'routes.tsx'),
    'utf-8',
  );
  expect(context).toMatchSnapshot();
});
