import { FileNode } from '@/gather';
import hookCompose from '@/utils/hookCompose';
import path from 'path';

test('test hookCompose', () => {
  const fileNode: FileNode = {
    name: '1.tsx',
    type: 'file',
    path: path.join('project', 'src', 'pages', '1.tsx'),
    props: {
      routeProps: {
        caseSensitive: true,
      },
      routeOptions: {
        layout: false,
        lazy: true,
      },
    },
  };
  hookCompose(
    [
      function (node: FileNode, dirpath: string) {
        if (node.props?.routeProps && !node.props.routeProps?.meta) {
          node.props.routeProps.meta = { title: node.name, origin: dirpath };
        }
      },
      function (node: FileNode, dirpath: string) {
        if (node.props?.routeProps && !node.props.routeProps?.access) {
          node.props.routeProps.access = { admin: 'true' };
        }
      },
    ],
    fileNode,
    'src/pages/1.tsx',
  );
  expect(fileNode).toStrictEqual({
    name: '1.tsx',
    type: 'file',
    path: path.join('project', 'src', 'pages', '1.tsx'),
    props: {
      routeProps: {
        caseSensitive: true,
        meta: {
          title: '1.tsx',
          origin: 'src/pages/1.tsx',
        },
        access: { admin: 'true' },
      },
      routeOptions: {
        layout: false,
        lazy: true,
      },
    },
  });
});

test('test hookCompose with none', () => {
  const fileNode = {
    name: '1.tsx',
    type: 'file',
    props: {
      routeProps: {
        caseSensitive: true,
      },
      routeOptions: {
        layout: false,
        lazy: true,
      },
    },
  };
  hookCompose(undefined, fileNode, 'src/pages/1.tsx');
  expect(fileNode).toStrictEqual({
    name: '1.tsx',
    type: 'file',
    props: {
      routeProps: {
        caseSensitive: true,
      },
      routeOptions: {
        layout: false,
        lazy: true,
      },
    },
  });
});
