const $ = id => document.getElementById(id);
let color = '#182727';
let revision = 0;
let timer;
let saving = false;
let ready = false;
function input() { return { url: $('url').value.trim(), size: Number($('size').value), color, level: $('level').value }; }
function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
function updateSize() {
  const size = Number($('size').value);
  $('size-mirror').textContent = $('size').value || '—';
  $('dimensions').textContent = `${size || '—'} × ${size || '—'} px`;
  $('size-range').value = Math.min(4096, Math.max(128, size));
  document.querySelectorAll('[data-size]').forEach(button => { const selected = Number(button.dataset.size) === size; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', selected); });
}
function schedule() {
  revision++;
  ready = false;
  $('save').disabled = true;
  $('qr').hidden = true;
  $('empty').hidden = false;
  clearTimeout(timer);
  updateSize();
  if (!$('url').value.trim()) { status('URL을 입력하면 자동으로 생성됩니다.'); return; }
  status('QR 코드를 생성하고 있습니다…');
  const current = revision;
  timer = setTimeout(async () => {
    try {
      const data = await window.qrStudio.generate(input());
      if (current !== revision) return;
      $('qr').src = data;
      $('qr').hidden = false;
      $('empty').hidden = true;
      ready = true;
      $('save').disabled = saving;
      status('준비 완료. 원본 크기의 PNG로 저장하세요.');
    } catch (error) { if (current === revision) status(error.message.replace(/^Error invoking remote method '[^']+': Error: /, ''), true); }
  }, 220);
}
$('url').addEventListener('input', schedule);
$('size').addEventListener('input', schedule);
$('size-range').addEventListener('input', () => { $('size').value = $('size-range').value; schedule(); });
$('level').addEventListener('change', schedule);
$('clear').addEventListener('click', () => { $('url').value = ''; schedule(); $('url').focus(); });
document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => { $('size').value = button.dataset.size; schedule(); }));
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
  color = button.dataset.color;
  document.querySelectorAll('[data-color]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', item === button); });
  schedule();
}));
$('save').addEventListener('click', async () => {
  if (!ready || saving) return;
  saving = true;
  $('save').disabled = true;
  const current = revision;
  try { const result = await window.qrStudio.save(input()); if (current === revision) status(result.canceled ? '저장을 취소했습니다.' : `저장 완료 · ${result.filePath}`); }
  catch (error) { if (current === revision) status(`저장하지 못했습니다. ${error.message}`, true); }
  finally { saving = false; $('save').disabled = !ready; }
});
updateSize();
