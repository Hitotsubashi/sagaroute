import print from '@/print';
import { RouteObject } from '@/weave';
import path from 'path';

test('test print with no exist routeFile', () => {
  const routes: RouteObject[] = [];
  const routeFilePath = path.join(__dirname, 'test-fixtures', 'render', 'routexxx.tsx');
  expect(() => {
    print(routes, {}, { routeFilePath });
  }).toThrow(`Could not find the file with path ${routeFilePath}`);
});

test('view has variable that not in template', () => {
  const onWarningMock = jest.fn();
  const routes: RouteObject[] = [];
  const routeFilePath = path.join(__dirname, 'test-fixtures', 'render', 'route9.tsx');
  print(routes, {}, { routeFilePath, onWarning: onWarningMock });
  expect(onWarningMock.mock.calls).toHaveLength(1);
  expect(onWarningMock.mock.calls[0][0]).toEqual(
    `The RoutingTemplateFile<${routeFilePath}> has no variables such as [routes] which are needed in view.`,
  );
});

test('template has variable that not in view', () => {
  const onWarningMock = jest.fn();
  const routes: RouteObject[] = [];
  const routeFilePath = path.join(__dirname, 'test-fixtures', 'render', 'route9.tsx');
  print(
    routes,
    {},
    {
      routeFilePath,
      onWarning: onWarningMock,
      hooks: {
        inject: {
          before: [
            (view) => {
              delete view.routes;
              delete view.imports;
            },
          ],
        },
      },
    },
  );
  expect(onWarningMock.mock.calls).toHaveLength(1);
  expect(onWarningMock.mock.calls[0][0]).toEqual(
    `The view of stage<print.inject.before> has no variables such as [imports] which are needed in template.`,
  );
});
