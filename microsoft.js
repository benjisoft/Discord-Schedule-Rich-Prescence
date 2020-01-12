var config = require('./config.json');

const credentials = {
    client: {
      id: config.ms_id,
      secret: config.ms_secret,
    },
    auth: {
      tokenHost: 'https://login.microsoftonline.com',
      authorizePath: 'common/oauth2/v2.0/authorize',
      tokenPath: 'common/oauth2/v2.0/token'
    }
  };
  const oauth2 = require('simple-oauth2').create(credentials);
  
  function getAuthUrl() {
    const returnVal = oauth2.authorizationCode.authorizeURL({
      redirect_uri: config.ms_redirect,
      scope: config.ms_scopes
    });
    console.log(`Generated auth url: ${returnVal}`);
    return returnVal;
  }
  
getAuthUrl();