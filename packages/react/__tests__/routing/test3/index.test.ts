import path from 'path';
import SagaRoute from '@/index';
import fs from 'fs';

test('test routing that has same import between route and pagefile.', () => {
  const sagaRoute = new SagaRoute({
    rootPath: __dirname,
  });
  sagaRoute.routing();
  const context = fs.readFileSync(path.join(__dirname, 'src', 'routes.tsx'), 'utf-8');
  expect(context).toMatchSnapshot();
});
