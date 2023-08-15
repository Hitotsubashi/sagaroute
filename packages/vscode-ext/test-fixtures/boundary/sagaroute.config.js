module.exports = {
    pathRewrite: {'^./': '@/'},
    hooks: {
        gather: {
            beforeEach(fpath) {
              // widgets文件夹下的文件不会被解析
              if (fpath.includes('/form/')) {
                return null;
              }
            },
        },
        weave: {
          afterEach(route) {
            route.path = route.path
              ?.replace(/([A-Z])/g, '-$1')
              .replace(/^-/, '')
              .toLocaleLowerCase();
          },
        },
    },
}