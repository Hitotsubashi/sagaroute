import getExportProps from '@/utils/getExportProps';
import parseToAst from '@/utils/parseToAst';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import path from 'path';

const loader1 = ({ params }: any) => {
  return params.teamId;
};
function loader2({ params }: any) {
  return params['lang'];
}

const action1 = ({ params }: any) => {};
const action2 = async ({ request }: any) => {
  const formData = await request.formData();
  return formData;
};

const lazy1 = '() => import("../a")';
const lazy2 = `async() => {
    let { Layout } = await import("./Dashboard");
    return { Component: Layout };
}`;
const lazy3 = `async() => {
    let { Index } = await import("./Dashboard");
    return { Component: Index };
}`;

test("get routeProps from 'export const routeProps = {xxx}'", () => {
  const content = `
  const Comp = function(){}
  export default Comp;
  Comp.routeProps = {
    path: "/teams/:teamId",
    loader: ${loader1.toString()},
    action: ${action1.toString()}
  }`;
  const ast = parseToAst(content, true);
  expect(
    getExportProps(ast, ['routeProps'], path.join('src', 'pages/b/b.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages/b/b.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        path: '/teams/:teamId',
        loader: `${EVAL_STRING_SYMBOL}${loader1.toString()}`,
        action: `${EVAL_STRING_SYMBOL}${action1.toString()}`,
      },
    },
    dependencies: [],
  });
});

test("get routeProps from 'export {routeProps}'", () => {
  const content = `
  const Comp = function(){}
  export default Comp;
  Comp.routeProps = {
    path: "/:lang?/categories",
    loader: ${loader2.toString()},
    action: ${action1.toString()}
  };`;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        path: '/:lang?/categories',
        loader: `${EVAL_STRING_SYMBOL}${loader2.toString()}`,
        action: `${EVAL_STRING_SYMBOL}${action1.toString()}`,
      },
    },
    dependencies: [],
  });
});

test("get routeProps from 'export {routeMeta1 as routeProps}'", () => {
  const content = `
  const Comp = ()=>{}
  export default Comp;

  Comp["routeProps"] = {
      index: true,
      action:${action2.toString()}
  };
  `;
  const ast = parseToAst(content);

  expect(
    getExportProps(ast, ['routeProps'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        index: true,
        action: `${EVAL_STRING_SYMBOL}${action2.toString()}`,
      },
    },
    dependencies: [],
  });
});

test('get routeProps include variable exported in local file', () => {
  const content = `
      import ErrorBoundary from './components/ErrorBoundary'

      const Comp = ()=>{}
      export default Comp;
  
      Comp.routeProps = {
          index: true,
          action: function(){},
          loader: ()=>{},
          ErrorBoundary,
          element:({text})=><p>{text}</p>,
          errorElement: <ErrorBoundary/>
      };
    `;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps'], path.join('src', 'pages', 'a.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'a.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        index: true,
        action: `${EVAL_STRING_SYMBOL}function(){}`,
        loader: `${EVAL_STRING_SYMBOL}()=>{}`,
        ErrorBoundary: `${EVAL_STRING_SYMBOL}PagesComponentsErrorBoundary`,
        element: `${EVAL_STRING_SYMBOL}({text})=><p>{text}</p>`,
        errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary/>`,
      },
    },
    dependencies: [
      {
        name: 'ErrorBoundary',
        asName: 'PagesComponentsErrorBoundary',
        importPath: './pages/components/ErrorBoundary',
        isDefault: true,
      },
    ],
  });
});

test('boundary: get routeProps include not exist variable', () => {
  const content = `
  const Comp = ()=>{}
  export default Comp;
  Comp.routeProps = {
    index: true,
    action,
  };`;
  const ast = parseToAst(content);
  expect(() => {
    getExportProps(ast, ['routeProps'], path.join('src', 'pages', 'a.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'a.tsx'),
      ),
    });
  }).toThrow(
    `The variable named "action" cannot be found in the file with the path "file://src${path.sep}pages${path.sep}a.tsx"`,
  );
});

test('get nothing from export', () => {
  const content = `export const a = {}`;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {},
    dependencies: [],
  });
});

test('get two props1 which both export wrapply', () => {
  const content = `
  const Comp = ()=>{}
  export default Comp;
  Comp.routeProps = {
      path: 'a',
      lazy: ${lazy1}
  };
  Comp.routeOptions = {
      layout: false,
      lazy: true
  };`;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps', 'routeOptions'], 'src/pages/b/b.tsx', {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages/b/b.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        path: 'a',
        lazy: `${EVAL_STRING_SYMBOL}() => import("./pages/a")`,
      },
      routeOptions: {
        layout: false,
        lazy: true,
      },
    },
    dependencies: [],
  });
});

test('get two props2 which both export directly', () => {
  const content = `
  const Comp = ()=>{}
  export default Comp;
  Comp.routeProps = {a:1,b:2};
  Comp.routeOptions = {a:1,b:3};
  `;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps', 'routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: { a: 1, b: 2 },
      routeOptions: { a: 1, b: 3 },
    },
    dependencies: [],
  });
});

test('get two props whiich both export wrapply and with as', () => {
  const content = `
  const Comp = ()=>{}
  export default Comp;
  Comp["routeProps"] = {
      lazy: ${lazy2}
  };
  Comp["routeOptions"] = {a:1,b:3};
  `;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps', 'routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        lazy: `${EVAL_STRING_SYMBOL}async () => {  
                let {    Layout  } = await import("./pages/Dashboard");  
                return {    Component: Layout  };
              }`,
      },
      routeOptions: { a: 1, b: 3 },
    },
    dependencies: [],
  });
});

test('get two props which export directly and init with comma', () => {
  const content = `
  const Comp = ()=>{}
  export default Comp
  Comp.routeProps = {
    lazy: ${lazy3}
  }
  Comp.routeOptions = {a:1,b:3};`;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps', 'routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        lazy: `${EVAL_STRING_SYMBOL}async () => {  
              let {    Index  } = await import("./pages/Dashboard");  
              return {    Component: Index  };
            }`,
      },
      routeOptions: { a: 1, b: 3 },
    },
    dependencies: [],
  });
});

test('test  pathRewrite', () => {
  const content = `
    import {ErrorBoundary1, ErrorBoundary2 as EB2} from '../components/ErrorBoundarys';
    import * as loader from '../utils/loader.ts';

    export default function Comp(){}

    Comp.routeProps = {
      lazy: ${lazy3},
    };
        
    Comp.routeOptions = {
      ErrorBoundary: ErrorBoundary1,
      errorElement: <EB2/>,
      loader
    };
    `;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeProps', 'routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
      pathRewrite: [[new RegExp('^./'), '@/']],
    }),
  ).toStrictEqual({
    props: {
      routeProps: {
        lazy: `${EVAL_STRING_SYMBOL}async () => {  
              let {    Index  } = await import("@/pages/Dashboard");  
              return {    Component: Index  };
            }`,
      },
      routeOptions: {
        ErrorBoundary: `${EVAL_STRING_SYMBOL}ComponentsErrorBoundarysErrorBoundary1`,
        errorElement: `${EVAL_STRING_SYMBOL}<ComponentsErrorBoundarysErrorBoundary2/>`,
        loader: `${EVAL_STRING_SYMBOL}UtilsLoader`,
      },
    },
    dependencies: [
      {
        name: 'ErrorBoundary1',
        asName: 'ComponentsErrorBoundarysErrorBoundary1',
        importPath: '@/components/ErrorBoundarys',
        isDefault: false,
      },
      {
        name: '*',
        asName: 'UtilsLoader',
        importPath: '@/utils/loader.ts',
        isDefault: true,
      },
      {
        name: 'ErrorBoundary2',
        asName: 'ComponentsErrorBoundarysErrorBoundary2',
        importPath: '@/components/ErrorBoundarys',
        isDefault: false,
      },
    ],
  });
});

test('test with htmlTag,ReactTag,SvgTag,custom Component and WebCustomComponent', () => {
  const content = `
    import * as ErrorBoundary from '../components/ErrorBoundarys';
    import React from 'react'
    import {Form,Input,Result,Typography} from 'antd'
    import {DetailLog as Detail} from '../components/Detail'
    import Comp2,{Comp3} from '../components/index'

    class Comp{}

    export default Comp

    Comp.routeOptions = {
        htmlElement: <h3>error...</h3>,
        selfComponent: <ErrorBoundary/>,
        svgElement: <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <polyline points="20,20 40,25 60,40 80,120 120,140 200,180"
            style="fill:none;stroke:black;stroke-width:3" />
        </svg>,
        nestSelfComponent: <div><Comp2 a="1" b={2}/></div>,
        reactComponent1: <>123</>,
        reactComponent2: <React.Fragment>123</React.Fragment>,
        reactComponent3: (<React.Suspense fallback={<div>Loading...</div>}>
            <Comp3 />
        </React.Suspense>),
        antdComponent:(<Form>
            <Form.Item>
                <Input/>
            </Form.Item>
        </Form>),
        fragComponent:<>
          <Result error={<Typography.Text>error</Typography.Text>}></Result>
          <Detail/>
        </>
    };`;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'router', 'index.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
      pathRewrite: [[new RegExp('^../'), '@/']],
    }),
  ).toStrictEqual({
    props: {
      routeOptions: {
        htmlElement: `${EVAL_STRING_SYMBOL}<h3>error...</h3>`,
        selfComponent: `${EVAL_STRING_SYMBOL}<ComponentsErrorBoundarys/>`,
        svgElement: `${EVAL_STRING_SYMBOL}<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <polyline points="20,20 40,25 60,40 80,120 120,140 200,180" 
                style="fill:none;stroke:black;stroke-width:3" />
            </svg>`,
        nestSelfComponent: `${EVAL_STRING_SYMBOL}<div><ComponentsIndex a="1" b={2}/></div>`,
        reactComponent1: `${EVAL_STRING_SYMBOL}<>123</>`,
        reactComponent2: `${EVAL_STRING_SYMBOL}<React.Fragment>123</React.Fragment>`,
        reactComponent3: `${EVAL_STRING_SYMBOL}<React.Suspense fallback={<div>Loading...</div>}>
                <ComponentsIndexComp3 />
            </React.Suspense>`,
        antdComponent: `${EVAL_STRING_SYMBOL}<AntdForm>
                <AntdForm.Item>
                    <AntdInput />
                </AntdForm.Item>
            </AntdForm>`,
        fragComponent: `${EVAL_STRING_SYMBOL}<>
            <AntdResult error={<AntdTypography.Text>error</AntdTypography.Text>}></AntdResult>
            <ComponentsDetailDetailLog/>
          </>`,
      },
    },
    dependencies: [
      {
        name: '*',
        asName: 'ComponentsErrorBoundarys',
        importPath: '@/components/ErrorBoundarys',
        isDefault: true,
      },
      {
        name: 'Comp2',
        asName: 'ComponentsIndex',
        importPath: '@/components/index',
        isDefault: true,
      },
      {
        name: 'React',
        asName: 'React',
        importPath: 'react',
        isDefault: true,
      },
      {
        name: 'Comp3',
        asName: 'ComponentsIndexComp3',
        importPath: '@/components/index',
        isDefault: false,
      },
      {
        name: 'Form',
        asName: 'AntdForm',
        importPath: 'antd',
        isDefault: false,
      },
      {
        name: 'Input',
        asName: 'AntdInput',
        importPath: 'antd',
        isDefault: false,
      },
      {
        name: 'Result',
        asName: 'AntdResult',
        importPath: 'antd',
        isDefault: false,
      },
      {
        name: 'Typography',
        asName: 'AntdTypography',
        importPath: 'antd',
        isDefault: false,
      },
      {
        name: 'DetailLog',
        asName: 'ComponentsDetailDetailLog',
        importPath: '@/components/Detail',
        isDefault: false,
      },
    ],
  });
});

test('import in different way and path', () => {
  const content = `
    import A from '@/components/A.tsx';
    import B from '../components/B.tsx';
    import {C as CC} from 'comp';
    import {D as DD} from '../components/comp';
    import {default as E} from '../components/comp';

    export default class Comp{}

    Comp.routeOptions = {
      element:<>
        <A attr1={<B/>}>
          <CC/>
        </A>
        <>
          <DD/>
          <E/>
        </>
      </>
    };`;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'router', 'index.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
      pathRewrite: [[new RegExp('^../'), '@/']],
    }),
  ).toStrictEqual({
    props: {
      routeOptions: {
        element: `${EVAL_STRING_SYMBOL}<>
          <ComponentsA attr1={<ComponentsB/>}>
            <CompC/>
          </ComponentsA>
          <>
            <ComponentsCompD/>
            <ComponentsCompDefault/>
          </>
        </>`,
      },
    },
    dependencies: [
      {
        name: 'A',
        asName: 'ComponentsA',
        importPath: '@/components/A.tsx',
        isDefault: true,
      },
      {
        name: 'B',
        asName: 'ComponentsB',
        importPath: '@/components/B.tsx',
        isDefault: true,
      },
      {
        name: 'C',
        asName: 'CompC',
        importPath: 'comp',
        isDefault: false,
      },
      {
        name: 'D',
        asName: 'ComponentsCompD',
        importPath: '@/components/comp',
        isDefault: false,
      },
      {
        name: 'default',
        asName: 'ComponentsCompDefault',
        importPath: '@/components/comp',
        isDefault: false,
      },
    ],
  });
});

test('use same variable in different attributes', () => {
  const content = `
    import A from '@/components/A.tsx';
    import {loader1,loader2} from '@/utils/loader.ts'

    export default function Comp(){}

    Comp.routeOptions = {
      element:<A attr1={<A/>}>
        <>
          <A/>
        </>
        <A/>
      </A>,
      element2: <div><A/></div>,
      loader: loader1,
      action: loader1,
      handler: loader2,
      handler2: loader2
    }
  `;
  const ast = parseToAst(content);
  expect(
    getExportProps(ast, ['routeOptions'], path.join('src', 'pages', 'index.tsx'), {
      relativePath: path.relative(
        path.join('src', 'router', 'index.tsx'),
        path.join('src', 'pages', 'index.tsx'),
      ),
    }),
  ).toStrictEqual({
    props: {
      routeOptions: {
        element: `${EVAL_STRING_SYMBOL}<ComponentsA attr1={<ComponentsA/>}>
          <>
            <ComponentsA/>
          </>
          <ComponentsA/>
        </ComponentsA>`,
        element2: `${EVAL_STRING_SYMBOL}<div><ComponentsA/></div>`,
        loader: `${EVAL_STRING_SYMBOL}UtilsLoaderLoader1`,
        action: `${EVAL_STRING_SYMBOL}UtilsLoaderLoader1`,
        handler: `${EVAL_STRING_SYMBOL}UtilsLoaderLoader2`,
        handler2: `${EVAL_STRING_SYMBOL}UtilsLoaderLoader2`,
      },
    },
    dependencies: [
      {
        name: 'loader1',
        asName: 'UtilsLoaderLoader1',
        importPath: '@/utils/loader.ts',
        isDefault: false,
      },
      {
        name: 'loader2',
        asName: 'UtilsLoaderLoader2',
        importPath: '@/utils/loader.ts',
        isDefault: false,
      },
      {
        name: 'A',
        asName: 'ComponentsA',
        importPath: '@/components/A.tsx',
        isDefault: true,
      },
    ],
  });
});
