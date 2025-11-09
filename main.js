const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let view;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setBrowserView(view);
  const [w, h] = mainWindow.getContentSize();
  // reserve top 60px for toolbar
  view.setBounds({ x: 0, y: 60, width: w, height: h - 60 });
  view.webContents.loadURL('https://example.com');

  mainWindow.on('resize', () => {
    const [w, h] = mainWindow.getContentSize();
    view.setBounds({ x: 0, y: 60, width: w, height: h - 60 });
  });

  ipcMain.handle('navigate', async (_, url) => {
    if (!/^https?:\/\/i.test(url)) url = 'http://' + url;
    try {
      await view.webContents.loadURL(url);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('go-back', () => {
    if (view.webContents.canGoBack()) view.webContents.goBack();
  });

  ipcMain.handle('go-forward', () => {
    if (view.webContents.canGoForward()) view.webContents.goForward();
  });

  ipcMain.handle('reload', () => {
    view.webContents.reload();
  });

  ipcMain.handle('get-url', () => {
    return view.webContents.getURL();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});