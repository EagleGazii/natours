const listEndpoints = require('express-list-endpoints');

module.exports = (expressObject) => {
  const routeNumbers = listEndpoints(expressObject)
    .map((element) => element.methods.length)
    .reduce(
      (prev, curr) => {
        return prev + curr;
      },

      0
    );
  console.log(
    `*******LIST OF ROUTES*********\nNumber Of Routes: ${routeNumbers}\n`,
    listEndpoints(expressObject).map(
      (el) => `${el.methods} - ${el.path}`
    )
  );
};
