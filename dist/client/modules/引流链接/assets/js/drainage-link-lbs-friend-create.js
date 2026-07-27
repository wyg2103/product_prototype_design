/**
 * LBS 加好友 - 新建/编辑页
 */
(function () {
  const $ = (id) => document.getElementById(id);

  function showToast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function updateCharCount(inputId, countId, max) {
    const input = $(inputId);
    const count = $(countId);
    if (!input || !count) return;
    const len = input.value.length;
    count.textContent = `${len}/${max}`;
  }

  function drawQr(canvas, seed) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const n = 21;
    const cell = canvas.width / n;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let s = seed || 1;
    const rand = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    ctx.fillStyle = '#1a1a1a';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if ((x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)) {
          if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
            ctx.fillRect(x * cell, y * cell, cell, cell);
          }
        } else if (rand() > 0.45) {
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }

  function syncPreview() {
    const pageTitle = $('pageTitle')?.value.trim() || '添加福利官';
    const qrName = $('qrName')?.value.trim() || '选择兜底活码';
    const copy1 = $('copy1')?.value.trim() || '';
    const copy2 = $('copy2')?.value.trim() || '';
    const isCustomStyle = document.querySelector('[name="pageStyle"]:checked')?.value === 'custom';

    if ($('previewPageTitle')) $('previewPageTitle').textContent = pageTitle;
    if ($('previewQrName')) $('previewQrName').textContent = qrName;
    if ($('previewCopy1')) {
      $('previewCopy1').textContent = copy1;
      $('previewCopy1').classList.toggle('hidden', !isCustomStyle || !copy1);
    }
    if ($('previewCopy2')) {
      $('previewCopy2').textContent = copy2;
      $('previewCopy2').classList.toggle('hidden', !isCustomStyle || !copy2);
    }

    drawQr($('friendQrCanvas'), pageTitle.length + qrName.length);
  }

  function toggleQrNameField() {
    const isCustom = document.querySelector('[name="qrNameType"]:checked')?.value === 'custom';
    $('qrNameWrap')?.classList.toggle('hidden', !isCustom);
    syncPreview();
  }

  function toggleStyleCustom() {
    const isCustom = document.querySelector('[name="pageStyle"]:checked')?.value === 'custom';
    $('styleCustomWrap')?.classList.toggle('hidden', !isCustom);
    syncPreview();
  }

  function fillFallbackOptions() {
    const sel = $('fallbackCode');
    if (!sel) return;
    sel.innerHTML =
      '<option value="">请选择落地活码</option>' +
      DrainageLinkStore.fallbackCodes.map((c) => `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join('');
  }

  function initCharCounts() {
    updateCharCount('linkName', 'linkNameCount', 20);
    updateCharCount('linkRemark', 'linkRemarkCount', 20);
    updateCharCount('pageTitle', 'pageTitleCount', 10);
    updateCharCount('qrName', 'qrNameCount', 20);
    updateCharCount('copy1', 'copy1Count', 40);
    const c2 = $('copy2');
    if (c2 && $('copy2Count')) $('copy2Count').textContent = `${c2.value.length}/60`;
  }

  function bindCharCounters() {
    [
      ['linkName', 'linkNameCount', 20],
      ['linkRemark', 'linkRemarkCount', 20],
      ['pageTitle', 'pageTitleCount', 10],
      ['qrName', 'qrNameCount', 20],
      ['copy1', 'copy1Count', 40],
    ].forEach(([inputId, countId, max]) => {
      $(inputId)?.addEventListener('input', () => updateCharCount(inputId, countId, max));
    });
    $('copy2')?.addEventListener('input', () => {
      if ($('copy2Count')) $('copy2Count').textContent = `${$('copy2').value.length}/60`;
    });
  }

  function bindFormSync() {
    ['linkName', 'pageTitle', 'qrName', 'copy1', 'copy2'].forEach((id) => {
      $(id)?.addEventListener('input', syncPreview);
    });
    document.querySelectorAll('[name="qrNameType"], [name="pageStyle"]').forEach((el) => {
      el.addEventListener('change', () => {
        toggleQrNameField();
        toggleStyleCustom();
      });
    });
  }

  function bindUpload() {
    const box = $('bgUploadBox');
    const input = $('bgFileInput');
    box?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        $('previewHero').style.backgroundImage = `url(${ev.target.result})`;
        $('previewHero').classList.add('has-custom-bg');
      };
      reader.readAsDataURL(file);
    });
  }

  function loadEditData() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    const link = findDrainageLink(id);
    if (!link || link.tab !== 'lbs-friend') return;

    $('pageTabTitle').innerHTML = '编辑链接 <span class="close">×</span>';
    $('linkName').value = link.name;
    $('linkGroup').value = link.groupId === 'none' ? 'none' : link.groupId;
    $('pageTitle').value = link.pageTitle;
    $('qrName').value = link.qrName || '';
    $('copy1').value = link.copy1 || '';
    $('copy2').value = link.copy2 || '';
    $('linkRemark').value = link.remark === '--' ? '' : link.remark || '';
    if (link.fallbackCodeId) $('fallbackCode').value = link.fallbackCodeId;

    document.querySelectorAll('[name="qrNameType"]').forEach((r) => {
      r.checked = r.value === link.qrNameType;
    });
    document.querySelectorAll('[name="pageStyle"]').forEach((r) => {
      r.checked = r.value === link.pageStyle;
    });
    document.querySelectorAll('[name="csJump"]').forEach((r) => {
      r.checked = r.value === (link.csJump ? 'yes' : 'no');
    });
  }

  function bindSave() {
    $('btnSave')?.addEventListener('click', () => {
      if (!$('linkName')?.value.trim()) {
        showToast('请填写链接名称');
        return;
      }
      if (!$('fallbackCode')?.value) {
        showToast('请选择落地活码');
        return;
      }
      showToast('保存成功（演示）');
      setTimeout(() => {
        location.href = 'drainage-link.html?tab=lbs-friend';
      }, 800);
    });
  }

  fillFallbackOptions();
  loadEditData();
  initCharCounts();
  toggleQrNameField();
  toggleStyleCustom();
  syncPreview();
  bindCharCounters();
  bindFormSync();
  bindUpload();
  bindSave();
  DrainageLinkLocBtnStyle.init({
    previewBtnSelectors: ['#exampleLocAllow'],
  });
})();
