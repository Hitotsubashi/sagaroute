/* eslint-env node */
const esbuild = require('esbuild');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }));

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args) => ({
      contents: `
          import path from ${JSON.stringify(args.path)}
          try { module.exports = require(path) }
          catch {}
        `,
    }));

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, (args) => ({
      path: args.path,
      namespace: 'file',
    }));

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader['.node'] = 'file';
  },
};

const argv = yargs(hideBin(process.argv)).argv;

const config = {
  entryPoints: [
    {
      in: './src/extension.ts',
      out: 'extension',
    },
    {
      in: './server/index.ts',
      out: 'server',
    },
  ],
  outdir: 'dist',
  format: 'cjs',
  platform: 'node',
  external: ['vscode'],
  bundle: true,
  plugins: [nativeNodeModulesPlugin],
};

if (argv.sourcemap) {
  config.sourcemap = argv.sourcemap;
}

if (argv.minify) {
  config.minify = argv.minify;
}

console.log('esbuild config: ', config);

if (argv.watch) {
  esbuild.context(config).then((context) => {
    context.watch();
  });
} else {
  esbuild.build(config);
}
