const { app, BrowserWindow, dialog } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.join(__dirname, '../release/smoke-output.png');
const timeout = setTimeout(() => { console.error('UI smoke test timed out'); app.exit(1); }, 20000);
app.on('browser-window-created', (_, win) => {
  win.hide();
  win.webContents.once('did-finish-load', async () => {
    try {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: output });
      await win.webContents.executeJavaScript(`document.getElementById('url').value='https://example.com'; document.getElementById('url').dispatchEvent(new Event('input'));`);
      await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{if(!document.getElementById('save').disabled){clearInterval(t);resolve(true)}else if(n++>100){clearInterval(t);reject(new Error(document.getElementById('status').textContent))}},50)})`);
      const dimensions = await win.webContents.executeJavaScript(`({width:document.getElementById('qr').naturalWidth,height:document.getElementById('qr').naturalHeight})`);
      assert.deepEqual(dimensions, { width: 1024, height: 1024 });
      await win.webContents.executeJavaScript(`document.getElementById('save').click()`);
      await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{const s=document.getElementById('status').textContent;if(s.startsWith('저장 완료')){clearInterval(t);resolve(true)}else if(n++>100){clearInterval(t);reject(new Error(s))}},50)})`);
      assert.equal((await fs.readFile(output)).subarray(1, 4).toString(), 'PNG');
      await fs.writeFile(path.join(__dirname, '../release/preview.png'), (await win.webContents.capturePage()).toPNG());
      console.log('PASS: renderer, preload bridge, QR preview, native save flow, PNG file');
      await fs.unlink(output);
      clearTimeout(timeout);
      app.exit(0);
    } catch (error) { console.error(error); clearTimeout(timeout); app.exit(1); }
  });
});
require('../src/main.cjs');
