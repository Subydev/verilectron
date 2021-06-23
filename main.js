const { app, BrowserWindow } = require('electron')

try {
  require('update-electron-app')()
} catch (_) {}
try {
  require('electron-reloader')(module)
} catch (_) {}
function createWindow () {
    const win = new BrowserWindow({
      width: 1280,
      height: 1000,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      
      }
    })
  
    win.loadFile('index.html')
  }

  app.whenReady().then(() => {
    createWindow()
  })
  app.on("browser-window-created", (e, win) => {
      win.removeMenu();

  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })