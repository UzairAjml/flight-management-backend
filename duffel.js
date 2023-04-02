var { Duffel } = require('@duffel/api');
require('dotenv').config();


const authToken = process.env.DUFFEL_ACCESS_TOKEN;

if (!authToken) {
  throw new Error(
    `Duffel access token not found in the environment variables. You can find them on this page https://app.duffel.com/tokens"`
  );
}

const duffel = new Duffel({
  token: authToken,
  source: 'create-duffel-app__express-js',
});

module.exports = duffel;