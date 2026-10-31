const QRCode = require('qrcode');

function validate(input) {
  if (!input || typeof input.url !== 'string') throw new Error('URL을 입력해 주세요.');
  let url;
  try { url = new URL(input.url.trim()); } catch { throw new Error('https://를 포함한 올바른 URL을 입력해 주세요.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('http 또는 https URL만 사용할 수 있습니다.');
  if (Buffer.byteLength(input.url.trim(), 'utf8') > 2000) throw new Error('URL이 너무 깁니다. 2,000바이트 이하로 입력해 주세요.');
  if (!Number.isInteger(input.size) || input.size < 128 || input.size > 4096) throw new Error('이미지 크기는 128~4096px 정수로 입력해 주세요.');
  if (!['M', 'Q', 'H'].includes(input.level)) throw new Error('올바른 복원 수준을 선택해 주세요.');
  if (!['#182727', '#000000', '#244C41', '#303F87'].includes(input.color)) throw new Error('올바른 색상을 선택해 주세요.');
  const modules = QRCode.create(input.url.trim(), { errorCorrectionLevel: input.level }).modules.size;
  if (input.size < modules + 8) throw new Error(`이 URL에는 최소 ${modules + 8}px가 필요합니다.`);
  return { text: input.url.trim(), options: { width: input.size, margin: 4, errorCorrectionLevel: input.level, color: { dark: input.color, light: '#ffffff' } } };
}
async function generate(input) {
  const { text, options } = validate(input);
  return QRCode.toDataURL(text, options);
}
module.exports = { validate, generate };
