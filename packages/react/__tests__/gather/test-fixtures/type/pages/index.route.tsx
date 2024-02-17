// @ts-nocheck
import ErrorBoundary from '../components/ErrorBoundary';

export const routeProps = {
  // 基础数据类型
  string: 'string',
  number: 1.2,
  boolean: true,
  null: null,
  undefined: undefined,
  symbol: Symbol('s'),
  // 引用数据类型
  funtion: function () {},
  object: {},
  array: [],
  // 高级数据类型
  map: new Map(),
  proxy: new Proxy(),
  // JSX
  errorElement: <ErrorBoundary />,
};

