// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const config = require('./config.json')
const { ipcMain } = require('electron');
const { session } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('loginPrompt', (event, args) => {
  let authWindow = new BrowserWindow(
    {
      alwaysOnTop: true, // keeps this window on top of others
      modal: true,
      autoHideMenuBar: true,
      parent: mainWindow,
      frame: true,
      show: false,
      webPreferences: {
        nodeIntegration: false, // No need to specify these if Electron v4+ but showing for demo
        contextIsolation: true // we can isolate this window
      }
    }
  );
 
  authWindow.on('closed', () => {
    this.authWindow = null;
  });
 
  authWindow.setMenu(null);
 
  const filter = { urls: ['https://login.microsoftonline.com/common/oauth2/nativeclient'] };
 
  authWindow.webContents.on('did-finish-load', () => {
    authWindow.show();
  });
 
  authWindow.loadURL(`https://login.microsoftonline.com/common/oauth2/authorize?client_id=`+ config.ms_id + `&response_type=token&redirect_uri=`+config.ms_redirect+`&response_mode=fragment&nonce=678911&state=12345&resource=`+ encodeURIComponent(config.ms_resource));
 
 
  session.defaultSession.webRequest.onCompleted(filter, (details) => {
    console.log(details)
    var url = details.url;
    console.log(url)
    let accessToken = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
    event.returnValue = accessToken;
    console.log(accessToken)
    authWindow.close();
  });
});

function resetData() {
  const path = require('path');
  const { app } = require('electron');
  const fs = require('fs-extra');
  const appName = app.getName();

  // Get app directory
  // on OSX it's /Users/Yourname/Library/Application Support/AppName
  const getAppPath = path.join(app.getPath('appData'), appName);

  fs.unlink(getAppPath, () => {
    // callback
    alert("App data cleared");
    // You should relaunch the app after clearing the app settings.
    app.relaunch();
    app.exit();
  });
}