const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();
const config = require('./config');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

config.credentials.tenantID = process.env.REACT_APP_TENANT_ID;
config.credentials.clientID = process.env.REACT_APP_APP_ID;

const options = {
  identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
  issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
  clientID: config.credentials.clientID,
  audience: config.credentials.clientID, // audience is this application
  validateIssuer: config.settings.validateIssuer,
  passReqToCallback: config.settings.passReqToCallback,
  loggingLevel: config.settings.loggingLevel,
  scope: config.protectedRoutes.hello.scopes,
};
const bearerStrategy = new BearerStrategy(options, (token, done) => {
  // Send user info using the second argument
  done(null, {}, token);
});
const app = express();

app.use(morgan('dev'));
app.use(passport.initialize());
passport.use(bearerStrategy);

// Enable CORS (in production, modify as to allow only designated origins)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Exposed API endpoint
app.get('/hello', passport.authenticate('oauth-bearer', { session: false }), (req, res) => {
  console.log('Validated claims: ', req.authInfo);

  // Service relies on the name claim.
  res.status(200).json({
    name: req.authInfo.name,
    email: req.authInfo.preferred_username,
    'issued-by': req.authInfo.iss,
    'issued-for': req.authInfo.aud,
    scope: req.authInfo.scp,

    // Records the identity provider that authenticated the subject of the token.
    // This value is identical to the value of the Issuer claim unless the user account not in the same tenant as the issuer - guests, for instance.
    // If the claim is not present, it means that the value of iss can be used instead.
    // For personal accounts being used in an orgnizational context (for instance, a personal account invited to an Azure AD tenant), the idp claim may be 'live.com' or an STS URI containing the Microsoft account tenant id.
    'identity-provider': req.authInfo.idp,
  });
});

app.get('/', (req, res) => {
  console.log('Root');
  res.send('ok');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('Listening on port ' + port);
});

module.exports = app;
