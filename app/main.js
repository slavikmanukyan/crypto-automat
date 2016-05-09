var app = require('app');

// browser-window creates a native window
var BrowserWindow = require('browser-window');
var mainWindow = null;
let keyWindow = null;

const ipcMain = require('electron').ipcMain;
const template = require('./templates/table-generator');

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {

    // Initialize the window to our specified dimensions
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 480,
        minWidth: 700,
        frame: false
    });

    // Tell Electron where to load the entry point from
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Clear out the main window when the app is closed
    mainWindow.on('closed', function () {

        mainWindow = null;
        if (keyWindow)
            keyWindow.close();
        app.quit();
    });


    keyWindow = new BrowserWindow(
        {
            width: 800,
            height: 600,
            minHeight: 600,
            minWidth: 800,
            show: false,
        }
    );

    keyWindow.on('closed', () => {
        keyWindow = null;
    })

    keyWindow.setMenu(null);
    keyWindow.loadURL('file://' + __dirname + '/templates/matrix-view.html');

    keyWindow.on('close', (e) => {
        keyWindow.hide();
        keyWindow.webContents.send('clear');

        e.preventDefault();
        e.returnValue = false;
        return false;
    })

    ipcMain.on('show-keys', (e, keys) => {
        keyWindow.webContents.send('show-keys', {
            symbols: template(keys.symbols),
            states: template(keys.states)
        });
        keyWindow.show();

    })

});

app.on('before-quit', () => {
    if (keyWindow) {
        keyWindow.removeAllListeners('close');
        keyWindow.close();
    }
})