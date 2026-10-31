const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('qrStudio', {
  generate: input => ipcRenderer.invoke('qr:generate', input),
  save: input => ipcRenderer.invoke('qr:save', input)
});
