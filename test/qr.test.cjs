const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');
const { generate, validate } = require('../src/qr.cjs');
const base = { url: 'https://example.com/path?hello=world', size: 512, color: '#182727', level: 'M' };
test('PNG has exact dimensions and decodes to the original URL', async () => {
  for (const size of [128, 512, 1024, 2048]) {
    const data = await generate({ ...base, size });
    const png = PNG.sync.read(Buffer.from(data.split(',')[1], 'base64'));
    assert.equal(png.width, size);
    assert.equal(png.height, size);
    const decoded = jsQR(new Uint8ClampedArray(png.data), size, size);
    assert.equal(decoded?.data, base.url);
  }
});
test('all colors and recovery levels produce readable Korean URLs', async () => {
  for (const color of ['#182727', '#000000', '#244C41', '#303F87']) {
    for (const level of ['M', 'Q', 'H']) {
      const url = 'https://example.com/안녕하세요?q=테스트';
      const data = await generate({ ...base, url, color, level });
      const png = PNG.sync.read(Buffer.from(data.split(',')[1], 'base64'));
      assert.equal(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data, url);
    }
  }
});
test('invalid URLs and export settings are rejected', () => {
  for (const change of [{ url: '' }, { url: 'example.com' }, { url: 'javascript:alert(1)' }, { url: 'file:///test' }, { size: 127 }, { size: 4097 }, { size: 512.5 }, { level: 'Z' }, { color: 'red' }]) {
    assert.throws(() => validate({ ...base, ...change }));
  }
});
