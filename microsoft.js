var config = require('./config.json');
const { ipcRenderer } = require('electron');
var accessToken

function componentDidMount() {
  accessToken = ipcRenderer.sendSync('loginPrompt', {});
}

componentDidMount();

const electron = window.require("electron");
const request = require('request');

function getEvents() {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        url: 'https://graph.microsoft.com/v1.0/me/events?$select=subject,body,start,end,location',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'content-type': 'application/json'
        }
      };
      request(options, (error, response, body) => {
        const result = JSON.parse(body);
        let htmlContent = [];
        if (response.statusCode == 200) {
          Promise.all(result.value.map((eachItem, i) => {
            htmlContent.push('<p>{result.value[i].fields.subject}</p>');
          })).then(() => {
            resolve(htmlContent);
          });
        } else {
          reject(result);
        }
      });
    });
  }

// const credentials = {
//     client: {
//       id: config.ms_id,
//       secret: config.ms_secret,
//     },
//     auth: {
//       tokenHost: 'https://login.microsoftonline.com',
//       authorizePath: 'common/oauth2/v2.0/authorize',
//       tokenPath: 'common/oauth2/v2.0/token'
//     }
//   };
//   const oauth2 = require('simple-oauth2').create(credentials);
  
//   function getAuthUrl() {
//     const returnVal = oauth2.authorizationCode.authorizeURL({
//       redirect_uri: config.ms_redirect,
//       scope: config.ms_scopes
//     });
//     console.log(`Generated auth url: ${returnVal}`);
//     return returnVal;
//   }
  
// document.getElementById("MS-signin").href=getAuthUrl();