const { app, BrowserWindow, globalShortcut } = require('electron')
require('@electron/remote/main').initialize()
require('update-electron-app')();
// require("electron-settings")
// require('./package.json');
// require('electron-log');
// require("regedit");
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}
try {
    require('electron-reloader')(module)
} catch (_) { }

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        width: 1460,
        height: 1050,
        // minHeight:1196,
        // minWidth:900,
        icon: './extraResources/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })
    win.loadFile('index.html')
    // win.webContents.openDevTools()
    win.once('ready-to-show', () => {
        win.show()
      })
    // win.show();
    // win.once('ready-to-show', () => {
    //     win.show();
    // });
    

}
// app.whenReady().then(() => { }).then(createWindow)
app.whenReady().then(() => {
  createWindow()
})
app.on("browser-window-created", (e, win) => {
    win.removeMenu();
});


app.on('window-all-closed', function () {
    //? Handle some close events like resetting the version information.
    const settings = require("electron-settings")
    settings.unsetSync('versions')
    if (process.platform !== 'darwin') app.quit()
})

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
        } catch (error) { }

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate([
                '--createShortcut', exeName,
            ]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
};