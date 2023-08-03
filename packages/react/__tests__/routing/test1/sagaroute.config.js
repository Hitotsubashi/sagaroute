const path = require('path');

module.exports = {
  dirpath: 'src/pages',
  routeFilePath: 'src/router/route.tsx',
  hooks: {
    gather: {
      before() {
        console.log('gatherBefore');
      },
    },
  },
};
