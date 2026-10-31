const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const { generate } = require('./qr.cjs');
let window;
const page = pathToFileURL(path.join(__dirname, 'index.html')).href;
function trusted(event) { if (event.senderFrame?.url !== page) throw new Error('허용되지 않은 요청입니다.'); }
app.whenReady().then(() => {
  ipcMain.handle('qr:generate', async (event, input) => { trusted(event); return generate(input); });
  ipcMain.handle('qr:save', async (event, input) => {
    trusted(event);
    const data = await generate(input);
    const host = new URL(input.url).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const result = await dialog.showSaveDialog(window, { title: 'QR 이미지 저장', defaultPath: path.join(app.getPath('downloads'), `qr-${host}-${input.size}px.png`), filters: [{ name: 'PNG 이미지', extensions: ['png'] }] });
    if (result.canceled || !result.filePath) return { canceled: true };
    const filePath = /\.png$/i.test(result.filePath) ? result.filePath : `${result.filePath}.png`;
    await fs.writeFile(filePath, Buffer.from(data.split(',')[1], 'base64'));
    return { canceled: false, filePath };
  });
  function createWindow() {
    window = new BrowserWindow({ width: 1180, height: 850, minWidth: 940, minHeight: 720, title: 'QR Studio', backgroundColor: '#F5F6F3', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', event => event.preventDefault());
    window.loadFile(path.join(__dirname, 'index.html'));
  }
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
