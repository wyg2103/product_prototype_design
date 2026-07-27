/**
 * LBS 引流链接 — 授权地理位置页面按钮样式（背景色 / 字体色）与查看示例
 */
(function (global) {
  function $(id) {
    return typeof id === 'string' ? document.getElementById(id) : id;
  }

  function normalizeHex(value, fallback) {
    if (!value) return fallback;
    let hex = String(value).trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return fallback;
    return `#${hex.toUpperCase()}`;
  }

  function applyBtnStyle(btn, bg, color) {
    if (!btn) return;
    btn.style.background = bg;
    btn.style.color = color;
    btn.style.borderColor = bg;
    btn.style.boxShadow = `0 4px 12px ${bg}4D`;
  }

  function bindColorPair(colorId, hexId, onChange) {
    const colorInput = $(colorId);
    const hexInput = $(hexId);
    if (!colorInput || !hexInput) return;

    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value.toUpperCase();
      onChange();
    });

    hexInput.addEventListener('input', () => {
      const normalized = normalizeHex(hexInput.value, null);
      if (normalized) {
        colorInput.value = normalized;
        hexInput.value = normalized;
        onChange();
      }
    });

    hexInput.addEventListener('blur', () => {
      const normalized = normalizeHex(hexInput.value, colorInput.value.toUpperCase());
      colorInput.value = normalized;
      hexInput.value = normalized;
      onChange();
    });
  }

  function initLocBtnStyle(options) {
    const {
      bgColorId = 'locBtnBgColor',
      bgHexId = 'locBtnBgColorHex',
      textColorId = 'locBtnTextColor',
      textHexId = 'locBtnTextColorHex',
      previewBtnSelectors = ['#locAllow', '#exampleLocAllow'],
      modalId = 'locAuthExampleModal',
      openBtnId = 'btnViewLocExample',
      closeBtnId = 'locAuthExampleClose',
      defaultBg = '#07C160',
      defaultText = '#FFFFFF',
    } = options || {};

    const modal = $(modalId);
    const openBtn = $(openBtnId);
    const closeBtn = $(closeBtnId);

    function getColors() {
      const bg = normalizeHex($(bgHexId)?.value || $(bgColorId)?.value, defaultBg);
      const text = normalizeHex($(textHexId)?.value || $(textColorId)?.value, defaultText);
      return { bg, text };
    }

    function syncPreview() {
      const { bg, text } = getColors();
      previewBtnSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((btn) => applyBtnStyle(btn, bg, text));
      });
    }

    bindColorPair(bgColorId, bgHexId, syncPreview);
    bindColorPair(textColorId, textHexId, syncPreview);

    function openModal() {
      syncPreview();
      modal?.classList.add('show');
    }

    function closeModal() {
      modal?.classList.remove('show');
    }

    openBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    syncPreview();

    return { syncPreview, getColors, openModal, closeModal };
  }

  global.DrainageLinkLocBtnStyle = { init: initLocBtnStyle, normalizeHex, applyBtnStyle };
})();
