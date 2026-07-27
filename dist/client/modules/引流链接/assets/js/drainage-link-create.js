/**
 * 新建/编辑引流链接 — B 端配置预览 + C 端 H5 交互预览
 */
(function () {
  const cState = {
    phase: 'location',
    cityId: 'hefei',
    storeId: null,
    selectedStoreId: null,
    locationGranted: true,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function drawQr(canvas, seed) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cells = 25;
    const cell = size / cells;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    function hash(x, y) {
      const n = (x * 17 + y * 31 + seed * 13) % 97;
      return n % 3 !== 0;
    }

    ctx.fillStyle = '#1a1a1a';
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const cx = x * cell;
        const cy = y * cell;
        const inFinder =
          (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
        const inLogo = x > 9 && x < 15 && y > 9 && y < 15;
        if (inLogo) continue;
        if (inFinder) {
          const outer =
            x === 0 || y === 0 || x === 6 || y === 6 ||
            x === cells - 7 || y === 6 || x === 6 || y === cells - 7;
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          const innerR = x >= cells - 5 && x <= cells - 3 && y >= 2 && y <= 4;
          const innerL = x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3;
          if (outer || inner || innerR || innerL) ctx.fillRect(cx, cy, cell, cell);
        } else if (hash(x, y)) {
          ctx.fillRect(cx, cy, cell, cell);
        }
      }
    }
  }

  function updateCharCount(inputId, countId, max) {
    const input = $(inputId);
    const count = $(countId);
    if (!input || !count) return;
    count.textContent = `${(input.value || '').length}/${max}`;
  }

  function bindCharCounters() {
    const pairs = [
      ['linkName', 'linkNameCount', 20],
      ['linkRemark', 'linkRemarkCount', 20],
      ['pageTitle', 'pageTitleCount', 10],
      ['qrName', 'qrNameCount', 20],
      ['guideText', 'guideTextCount', 15],
    ];
    pairs.forEach(([inputId, countId, max]) => {
      $(inputId)?.addEventListener('input', () => {
        updateCharCount(inputId, countId, max);
        syncFormToPreview();
      });
    });
  }

  function getFallbackLabel() {
    const sel = $('fallbackCode');
    if (!sel || !sel.value) return '请选择兜底活码';
    return sel.options[sel.selectedIndex]?.text || '请选择兜底活码';
  }

  function getQrDisplayName() {
    const type = document.querySelector('[name="qrNameType"]:checked')?.value;
    if (type === 'default') return getFallbackLabel();
    const custom = $('qrName')?.value.trim();
    return custom || '选择兜底活码';
  }

  function getGroupLabel() {
    const sel = $('linkGroup');
    if (!sel) return '未分组';
    return sel.options[sel.selectedIndex]?.text || '未分组';
  }

  function getCityLabel(id) {
    return DrainageLinkStores.cities.find((c) => c.id === id)?.label || '合肥市';
  }

  function getStoreName(id) {
    return DrainageLinkStores.stores.find((s) => s.id === id)?.name || '';
  }

  function storesByCity(cityId, keyword) {
    return DrainageLinkStores.stores.filter((s) => {
      if (s.cityId !== cityId) return false;
      if (keyword && !s.name.includes(keyword)) return false;
      return true;
    });
  }

  function syncFormToPreview() {
    const pageTitle = $('pageTitle')?.value || '扫码进群';
    const guideText = $('guideText')?.value || '长按识别二维码入群，海量福利';
    const qrName = getQrDisplayName();
    const linkName = $('linkName')?.value.trim() || '链接名称';
    const fallbackLabel = getFallbackLabel();
    const h5Title = pageTitle.replace('进群', '入群');

    $('cPageTitle').textContent = h5Title;
    $('cQrName').textContent = qrName;
    $('cGuideText').textContent = guideText || '长按识别二维码入群，海量福利';

    $('bLinkName').textContent = linkName;
    $('bLinkMeta').textContent = `${getGroupLabel()} · 新建链接`;
    $('bPageTitle').textContent = pageTitle;
    $('bFallbackCode').textContent = fallbackLabel;
    $('bQrName').textContent = qrName;
    $('bGuideText').textContent = guideText || '长按识别二维码入群，海量福利';
    if ($('bPromoUrl')) {
      const slug = encodeURIComponent(linkName.slice(0, 8) || 'preview');
      $('bPromoUrl').textContent = `scrmh5.qmai.cn/l/${slug}`;
    }

    drawQr($('cQrCanvas'), linkName.length + qrName.length);
    drawQr($('bQrCanvas'), linkName.length + qrName.length + 7);
  }

  function setCardState(mode) {
    $('cLocExplain')?.classList.toggle('hidden', mode !== 'explain');
    $('cEmptyState')?.classList.toggle('hidden', mode !== 'empty');
    $('cQrState')?.classList.toggle('hidden', mode !== 'qr');
    $('cManualLink')?.classList.toggle('hidden', mode !== 'qr');
    $('cQrName')?.classList.toggle('hidden', true);
    $('btnRelocate')?.classList.toggle('hidden', mode === 'explain');
    $('cGuideText')?.classList.toggle('hidden', mode === 'explain');
  }

  function hideAllOverlays() {
    const overlay = $('cOverlay');
    overlay?.classList.remove('show', 'dim-only', 'has-sheet', 'wx-auth');
    $('locDialog')?.classList.add('hidden');
    $('storeModal')?.classList.add('hidden');
    $('storeSheet')?.classList.add('hidden');
  }

  function showWxLocAuth() {
    $('cOverlay')?.classList.add('show', 'wx-auth');
    $('locDialog')?.classList.remove('hidden');
  }

  function updateStateChips() {
    document.querySelectorAll('.dl-state-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.state === cState.phase);
    });
  }

  function renderStoreSheet(keyword) {
    const list = storesByCity(cState.cityId, keyword);
    $('storeSheetList').innerHTML = list
      .map((s) => {
        const selected = String(s.id) === String(cState.selectedStoreId) ? ' selected' : '';
        return `<div class="dl-c-sheet-item${selected}" data-id="${s.id}">${escapeHtml(s.name)}</div>`;
      })
      .join('');
  }

  function goToPhase(phase) {
    cState.phase = phase;
    hideAllOverlays();
    updateStateChips();

    if (phase === 'location') {
      setCardState('explain');
      return;
    }

    if (phase === 'empty') {
      cState.storeId = null;
      setCardState('empty');
      return;
    }

    if (phase === 'found') {
      cState.storeId = cState.storeId || DrainageLinkStores.nearestStoreId;
      setCardState('qr');
      return;
    }

    if (phase === 'select') {
      setCardState(cState.locationGranted ? 'qr' : 'empty');
      $('cOverlay')?.classList.add('show');
      $('storeModal')?.classList.remove('hidden');
      $('storeChevron').textContent = '▼';
      $('selCityLabel').textContent = getCityLabel(cState.cityId);
      if (cState.selectedStoreId) {
        $('selStoreLabel').textContent = getStoreName(cState.selectedStoreId);
        $('selStoreLabel').classList.remove('placeholder');
      } else {
        $('selStoreLabel').textContent = '请选择您要加群的门店';
        $('selStoreLabel').classList.add('placeholder');
      }
      return;
    }

    if (phase === 'list') {
      setCardState(cState.locationGranted ? 'qr' : 'empty');
      $('cOverlay')?.classList.add('show', 'dim-only', 'has-sheet');
      $('storeModal')?.classList.remove('hidden');
      $('storeSheet')?.classList.remove('hidden');
      $('storeChevron').textContent = '▲';
      renderStoreSheet('');
    }
  }

  function onLocationResult(allowed) {
    cState.locationGranted = allowed;
    hideAllOverlays();
    if (allowed) {
      cState.storeId = DrainageLinkStores.nearestStoreId;
      goToPhase('found');
    } else {
      cState.selectedStoreId = null;
      goToPhase('select');
    }
  }

  function onStoreSelected(storeId) {
    cState.selectedStoreId = storeId;
    cState.storeId = storeId;
    $('selStoreLabel').textContent = getStoreName(storeId);
    $('selStoreLabel').classList.remove('placeholder');
    $('storeChevron').textContent = '▼';
    $('storeSheet')?.classList.add('hidden');
    $('cOverlay')?.classList.remove('dim-only', 'has-sheet');
    cState.phase = 'select';
    updateStateChips();
  }

  function updateLivePreviewTitle(view) {
    const el = $('livePreviewTitle');
    if (!el) return;
    const isEdit = !!new URLSearchParams(location.search).get('id');
    const pageName = isEdit ? '编辑链接' : '新建链接';
    const side = view === 'c' ? 'C端' : 'B端';
    el.textContent = `引流链接 · ${pageName} · ${side}`;
  }

  function switchPageView(view) {
    const isC = view === 'c';
    document.querySelectorAll('#bcToggle .dl-live-segment-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    updateLivePreviewTitle(view);
    document.querySelector('.page-drainage-create')?.classList.toggle('is-c-view', isC);
    document.querySelector('.main-area')?.classList.toggle('is-c-view', isC);
    $('createLayout')?.classList.toggle('is-c-view', isC);
    $('stateDemo')?.classList.toggle('hidden', !isC);
    document.querySelectorAll('.dl-preview-view').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.view === view);
    });
    if (isC) goToPhase(cState.phase);
  }

  function bindBcToggle() {
    $('bcToggle')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-view]');
      if (!btn || !btn.classList.contains('dl-live-segment-btn')) return;
      switchPageView(btn.dataset.view);
    });
  }

  function bindCInteractions() {
    $('btnRelocate')?.addEventListener('click', () => goToPhase('location'));

    $('btnManualSelect')?.addEventListener('click', () => {
      cState.selectedStoreId = null;
      goToPhase('select');
    });

    $('btnManualSwitch')?.addEventListener('click', (e) => {
      e.preventDefault();
      cState.selectedStoreId = null;
      goToPhase('select');
    });

    $('locAllow')?.addEventListener('click', () => showWxLocAuth());
    $('locWxAllow')?.addEventListener('click', () => onLocationResult(true));
    $('locWxDeny')?.addEventListener('click', () => onLocationResult(false));
    $('locManual')?.addEventListener('click', () => {
      cState.selectedStoreId = null;
      goToPhase('select');
    });

    $('rowCity')?.addEventListener('click', () => {
      const cities = DrainageLinkStores.cities;
      const idx = cities.findIndex((c) => c.id === cState.cityId);
      const next = cities[(idx + 1) % cities.length];
      cState.cityId = next.id;
      cState.selectedStoreId = null;
      $('selCityLabel').textContent = next.label;
      $('selStoreLabel').textContent = '请选择您要加群的门店';
      $('selStoreLabel').classList.add('placeholder');
    });

    $('rowStore')?.addEventListener('click', () => {
      goToPhase('list');
      if ($('storeSearchInput')) $('storeSearchInput').value = '';
    });

    $('btnStoreSearch')?.addEventListener('click', () => {
      if (!cState.selectedStoreId) {
        showToast('请先选择门店');
        goToPhase('list');
        return;
      }
      hideAllOverlays();
      cState.storeId = cState.selectedStoreId;
      goToPhase('found');
      showToast(`已切换至：${getStoreName(cState.storeId)}`);
    });

    $('storeSheetList')?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-id]');
      if (!item) return;
      onStoreSelected(item.dataset.id);
    });

    $('btnStoreFilter')?.addEventListener('click', () => {
      renderStoreSheet($('storeSearchInput')?.value.trim() || '');
    });

    $('storeSearchInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') renderStoreSheet(e.target.value.trim());
    });

    $('stateDemo')?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-state]');
      if (!chip) return;
      goToPhase(chip.dataset.state);
    });
  }

  function toggleQrNameField() {
    const isCustom = document.querySelector('[name="qrNameType"]:checked')?.value === 'custom';
    $('qrNameWrap')?.classList.toggle('hidden', !isCustom);
    syncFormToPreview();
  }

  function toggleStyleCustom() {
    const isCustom = document.querySelector('[name="pageStyle"]:checked')?.value === 'custom';
    $('styleCustomWrap')?.classList.toggle('hidden', !isCustom);
  }

  function fillFallbackOptions() {
    const sel = $('fallbackCode');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML =
      '<option value="">请选择兜底活码</option>' +
      DrainageLinkStore.fallbackCodes
        .map((c) => `<option value="${c.id}">${escapeHtml(c.label)}</option>`)
        .join('');
    if (current) sel.value = current;
  }

  function bindFormSync() {
    ['pageTitle', 'qrName', 'guideText', 'fallbackCode', 'linkName', 'linkGroup'].forEach((id) => {
      $(id)?.addEventListener('change', syncFormToPreview);
      $(id)?.addEventListener('input', syncFormToPreview);
    });

    document.querySelectorAll('[name="qrNameType"]').forEach((r) => {
      r.addEventListener('change', toggleQrNameField);
    });
    document.querySelectorAll('[name="pageStyle"]').forEach((r) => {
      r.addEventListener('change', toggleStyleCustom);
    });

    $('btnSave')?.addEventListener('click', () => {
      const name = $('linkName')?.value.trim();
      if (!name) {
        showToast('请填写链接名称');
        return;
      }
      if (!$('fallbackCode')?.value) {
        showToast('请选择兜底活码');
        return;
      }
      showToast('保存成功（演示）');
      const tab = new URLSearchParams(location.search).get('tab') || 'lbs-group';
      setTimeout(() => { location.href = `drainage-link.html?tab=${tab}`; }, 800);
    });
  }

  function bindUpload() {
    const box = $('bgUpload');
    const input = $('bgFileInput');
    box?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        box.innerHTML = `<img src="${ev.target.result}" alt="背景图" />`;
        box.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    });
  }

  function loadEditData() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) return;

    const link = findDrainageLink(id);
    if (!link) return;

    $('pageTabTitle').innerHTML = '编辑链接 <span class="close">×</span>';
    $('linkName').value = link.name;
    $('linkGroup').value = link.groupId === 'none' ? 'none' : link.groupId;
    $('pageTitle').value = link.pageTitle;
    $('qrName').value = link.qrName || '';
    $('guideText').value = link.guideText || '';
    $('linkRemark').value = link.remark === '--' ? '' : link.remark || '';
    if (link.fallbackCodeId) $('fallbackCode').value = link.fallbackCodeId;

    document.querySelectorAll('[name="official"]').forEach((r) => {
      r.checked = r.value === (link.useOfficialCode ? 'yes' : 'no');
    });
    document.querySelectorAll('[name="qrNameType"]').forEach((r) => {
      r.checked = r.value === link.qrNameType;
    });
    document.querySelectorAll('[name="pageStyle"]').forEach((r) => {
      r.checked = r.value === link.pageStyle;
    });
  }

  function initCharCounts() {
    updateCharCount('linkName', 'linkNameCount', 20);
    updateCharCount('linkRemark', 'linkRemarkCount', 20);
    updateCharCount('pageTitle', 'pageTitleCount', 10);
    updateCharCount('qrName', 'qrNameCount', 20);
    updateCharCount('guideText', 'guideTextCount', 15);
  }

  fillFallbackOptions();
  loadEditData();
  initCharCounts();
  toggleQrNameField();
  toggleStyleCustom();
  syncFormToPreview();
  bindCharCounters();
  bindFormSync();
  bindUpload();
  bindBcToggle();
  bindCInteractions();
  DrainageLinkLocBtnStyle.init({
    previewBtnSelectors: ['#locAllow', '#exampleLocAllow'],
  });
  switchPageView('b');
  goToPhase('found');
})();
