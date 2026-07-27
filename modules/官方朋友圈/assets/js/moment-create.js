/**
 * 发布官方朋友圈任务
 * - 文本/图片：九宫格展示 + 拖拽排序
 * - 高级设置：任务终止时间（精确到秒）
 */
(function () {
  const MAX_IMAGES = 9;
  const DEMO_STAFF = ['周玉', '钱朝阳', '王明', '谢鹏飞', '李沙'];
  const params = new URLSearchParams(location.search);
  const isEnterprise = params.get('mode') === 'enterprise';
  const listUrl = isEnterprise ? 'index.html?tab=enterprise' : 'index.html?tab=personal';
  const REMIND_TEMPLATE = isEnterprise
    ? '您收到一条新的企业朋友圈任务：#{任务名称}#，请前往「工作台-官方朋友圈」中查看并执行。'
    : '您收到一条新的官方朋友圈任务：#{任务名称}#，请前往「工作台-官方朋友圈」中查看并执行。';

  const state = {
    images: [], // { id, url, name }
    dragId: null,
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

  function bindCounter(inputId, countId) {
    const input = $(inputId);
    const count = $(countId);
    if (!input || !count) return;
    const sync = () => {
      count.textContent = String(input.value.length);
    };
    input.addEventListener('input', sync);
    sync();
  }

  /* ---------- 员工选择 ---------- */
  function getStaffNames() {
    return [...document.querySelectorAll('.staff-chip')].map((el) => el.dataset.name);
  }

  function renderStaffChips(names) {
    const container = $('staffChips');
    container.innerHTML = names
      .map(
        (name) => `
      <span class="staff-chip" data-name="${name}">
        <span class="avatar">${name.charAt(0)}</span>
        ${name}
        <button type="button" class="remove" aria-label="移除">×</button>
      </span>`
      )
      .join('');

    container.querySelectorAll('.remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('.staff-chip')?.remove();
      });
    });
  }

  /* ---------- 朋友圈类型切换 ---------- */
  function syncMomentTypePanels() {
    const type = document.querySelector('input[name="momentType"]:checked')?.value || 'image';
    $('panelImage').classList.toggle('hidden', type !== 'image');
    $('panelLink').classList.toggle('hidden', type !== 'link');
  }

  function syncImageSource() {
    const source = document.querySelector('input[name="imageSource"]:checked')?.value || 'custom';
    $('customImageArea').classList.toggle('hidden', source !== 'custom');
    $('libraryImageArea').classList.toggle('hidden', source !== 'library');
  }

  function syncPublishMode() {
    const mode = document.querySelector('input[name="publishMode"]:checked')?.value || 'now';
    $('scheduleTimeWrap').classList.toggle('hidden', mode !== 'schedule');
  }

  function syncRemind() {
    const remind = document.querySelector('input[name="taskRemind"]:checked')?.value || 'default';
    $('remindTemplateBox').classList.toggle('hidden', remind !== 'default');
  }

  /* ---------- 九宫格图片 ---------- */
  function uid() {
    return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function renderImageGrid() {
    const grid = $('imageGrid');
    if (!grid) return;

    const itemsHtml = state.images
      .map(
        (img, index) => `
      <div class="moment-grid-item" draggable="true" data-id="${img.id}" title="拖拽调整顺序">
        <img src="${img.url}" alt="${img.name || '图片'}" />
        <span class="grid-index">${index + 1}</span>
        <button type="button" class="grid-remove" data-id="${img.id}" aria-label="删除图片">×</button>
      </div>`
      )
      .join('');

    const addBtn =
      state.images.length < MAX_IMAGES
        ? `<button type="button" class="moment-upload-slot" id="btnAddImage" aria-label="添加图片">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>`
        : '';

    grid.innerHTML = itemsHtml + addBtn;
    bindImageGridEvents();
  }

  function bindImageGridEvents() {
    const grid = $('imageGrid');
    $('btnAddImage')?.addEventListener('click', () => $('imageInput')?.click());

    grid.querySelectorAll('.grid-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        state.images = state.images.filter((img) => img.id !== id);
        renderImageGrid();
      });
    });

    grid.querySelectorAll('.moment-grid-item').forEach((item) => {
      item.addEventListener('dragstart', onDragStart);
      item.addEventListener('dragend', onDragEnd);
      item.addEventListener('dragover', onDragOver);
      item.addEventListener('dragleave', onDragLeave);
      item.addEventListener('drop', onDrop);
    });
  }

  function onDragStart(e) {
    const item = e.currentTarget;
    state.dragId = item.dataset.id;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', state.dragId);
    // 自定义拖拽预览
    try {
      const ghost = item.cloneNode(true);
      ghost.classList.add('drag-ghost');
      ghost.querySelector('.grid-remove')?.remove();
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 48, 48);
      requestAnimationFrame(() => ghost.remove());
    } catch (_) {
      /* ignore */
    }
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    state.dragId = null;
    document.querySelectorAll('.moment-grid-item.drag-over').forEach((el) => {
      el.classList.remove('drag-over');
    });
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.currentTarget;
    if (item.dataset.id !== state.dragId) {
      item.classList.add('drag-over');
    }
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');
    const fromId = state.dragId || e.dataTransfer.getData('text/plain');
    const toId = target.dataset.id;
    if (!fromId || !toId || fromId === toId) return;

    const fromIndex = state.images.findIndex((img) => img.id === fromId);
    const toIndex = state.images.findIndex((img) => img.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = state.images.splice(fromIndex, 1);
    state.images.splice(toIndex, 0, moved);
    renderImageGrid();
  }

  function handleImageFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      showToast('请选择图片文件');
      return;
    }

    const remain = MAX_IMAGES - state.images.length;
    if (remain <= 0) {
      showToast('最多上传 9 张图片');
      return;
    }

    const selected = files.slice(0, remain);
    if (files.length > remain) {
      showToast(`最多 9 张，已选取前 ${remain} 张`);
    }

    let loaded = 0;
    selected.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`「${file.name}」超过 10MB，已跳过`);
        loaded += 1;
        if (loaded === selected.length) renderImageGrid();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        state.images.push({
          id: uid(),
          url: reader.result,
          name: file.name,
        });
        loaded += 1;
        if (loaded === selected.length) {
          renderImageGrid();
          if (selected.length === 1 || files.length <= remain) {
            showToast(`已添加 ${selected.length} 张图片，可拖拽调整顺序`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- 校验与发布 ---------- */
  function formatDateTimeLocal(value) {
    if (!value) return '';
    // datetime-local: 2026-07-21T18:30:00 → 2026-07-21 18:30:00
    return value.replace('T', ' ');
  }

  function typeLabel(type) {
    if (type === 'image') return '图片';
    if (type === 'link') return '链接';
    return '文本';
  }

  function validate(strict) {
    const title = $('taskTitle').value.trim();
    if (!title) {
      showToast('请输入任务标题');
      $('taskTitle').focus();
      return false;
    }
    if (strict && !getStaffNames().length) {
      showToast('请至少选择一名员工');
      return false;
    }
    const content = $('momentContent').value.trim();
    const type = document.querySelector('input[name="momentType"]:checked')?.value;
    if (strict && !content && type !== 'image') {
      showToast('请输入朋友圈内容');
      $('momentContent').focus();
      return false;
    }
    if (type === 'image') {
      const source = document.querySelector('input[name="imageSource"]:checked')?.value;
      if (strict && source === 'custom' && !state.images.length) {
        showToast('请上传至少一张图片');
        return false;
      }
      if (strict && !content) {
        showToast('请输入朋友圈内容');
        $('momentContent').focus();
        return false;
      }
    }
    if (type === 'link') {
      const url = $('linkUrl').value.trim();
      if (strict && !url) {
        showToast('请输入链接地址');
        $('linkUrl').focus();
        return false;
      }
    }
    const mode = document.querySelector('input[name="publishMode"]:checked')?.value;
    if (strict && mode === 'schedule' && !$('scheduleTime').value) {
      showToast('请设置定时发送时间');
      $('scheduleTime').focus();
      return false;
    }

    const terminate = $('terminateTime').value;
    if (terminate) {
      const end = new Date(terminate);
      if (Number.isNaN(end.getTime())) {
        showToast('任务终止时间格式不正确');
        return false;
      }
      if (end.getTime() <= Date.now()) {
        showToast('任务终止时间需晚于当前时间');
        $('terminateTime').focus();
        return false;
      }
      if (mode === 'schedule') {
        const schedule = new Date($('scheduleTime').value);
        if (!Number.isNaN(schedule.getTime()) && end.getTime() <= schedule.getTime()) {
          showToast('任务终止时间需晚于定时发送时间');
          $('terminateTime').focus();
          return false;
        }
      }
    }
    return true;
  }

  function buildTask(status) {
    const type = document.querySelector('input[name="momentType"]:checked')?.value;
    const publishMode = document.querySelector('input[name="publishMode"]:checked')?.value;
    const terminate = formatDateTimeLocal($('terminateTime').value);
    const content = $('momentContent').value.trim();
    const linkUrl = $('linkUrl')?.value.trim() || '';
    const stamp = typeof nowStamp === 'function' ? nowStamp() : '';
    const isRunning = status === MOMENT_STATUS.RUNNING;
    let displayContent = content;
    if (type === 'link' && linkUrl) {
      displayContent = content ? `[链接] ${content}` : `[链接] ${linkUrl}`;
    }

    return {
      taskName: $('taskTitle').value.trim(),
      type: typeLabel(type),
      content: displayContent || (type === 'image' ? '图片朋友圈' : '（未填写内容）'),
      url: type === 'link' ? linkUrl : undefined,
      image: type === 'image' && state.images.length > 0,
      creator: '当前用户',
      creatorAvatar: '当',
      time: stamp,
      publishTime: isRunning ? stamp : '',
      sendType: publishMode === 'schedule' ? '定时发送' : '立即发送',
      status,
      terminateTime: terminate || null,
      stoppedAt: null,
      stopReason: null,
      moment_id: null,
      isGuide: false,
      targets: getStaffNames().length ? getStaffNames() : ['未选择员工'],
    };
  }

  function submitTask(status) {
    const strict = status === MOMENT_STATUS.RUNNING;
    if (!validate(strict)) return;

    const task = buildTask(status);
    const storeType = isEnterprise ? 'enterprise' : 'personal';
    if (typeof addMomentTask === 'function') {
      addMomentTask(storeType, task);
    }

    const send = task.sendType === '定时发送' ? 'scheduled' : 'immediate';
    const redirect = `${listUrl}&send=${send}`.replace('?&', '?');

    if (status === MOMENT_STATUS.DRAFT) {
      showToast('保存成功，任务状态为「待发布」');
    } else if (task.terminateTime) {
      showToast(`发布成功，任务将于 ${task.terminateTime} 终止`);
    } else {
      showToast('发布成功，任务状态为「执行中」');
    }

    setTimeout(() => {
      window.location.href = redirect;
    }, 1000);
  }

  function saveDraft() {
    submitTask(MOMENT_STATUS.DRAFT);
  }

  function publish() {
    submitTask(MOMENT_STATUS.RUNNING);
  }

  function applyModeUi() {
    if (!isEnterprise) return;
    document.title = '发布官方朋友圈 - 企业微信 SCRM';
    const tab = $('createPageTab');
    if (tab) {
      tab.innerHTML = '发布官方朋友圈 <span class="close">×</span>';
    }
    const back = document.querySelector('.page-tab a[href="index.html"]');
    if (back) back.setAttribute('href', listUrl);
    const tip = document.querySelector('.create-tip-banner p');
    if (tip) {
      tip.textContent =
        '管理员统一创建企业朋友圈内容，成员确认后发表至客户朋友圈。可设置任务终止时间；到期后将调用企微停止发表接口，未执行成员无法再操作。已发表内容不可撤回。';
    }
    const footerHint = document.querySelector('.footer-hint');
    if (footerHint) footerHint.textContent = '发布后内容将下发至成员确认发表';
  }

  /* ---------- 初始化 ---------- */
  function init() {
    applyModeUi();
    bindCounter('taskTitle', 'titleCount');
    bindCounter('momentContent', 'contentCount');

    $('remindTemplateText').textContent = REMIND_TEMPLATE;
    $('remindCount').textContent = String(REMIND_TEMPLATE.length);

    renderStaffChips([]);
    renderImageGrid();
    syncMomentTypePanels();
    syncImageSource();
    syncPublishMode();
    syncRemind();

    document.querySelectorAll('input[name="momentType"]').forEach((input) => {
      input.addEventListener('change', syncMomentTypePanels);
    });
    document.querySelectorAll('input[name="imageSource"]').forEach((input) => {
      input.addEventListener('change', syncImageSource);
    });
    document.querySelectorAll('input[name="publishMode"]').forEach((input) => {
      input.addEventListener('change', syncPublishMode);
    });
    document.querySelectorAll('input[name="taskRemind"]').forEach((input) => {
      input.addEventListener('change', syncRemind);
    });

    $('btnAddStaff').addEventListener('click', () => {
      const existing = getStaffNames();
      const next = DEMO_STAFF.find((n) => !existing.includes(n));
      if (next) {
        renderStaffChips([...existing, next]);
        showToast(`已添加员工「${next}」`);
      } else {
        showToast('演示数据已全部添加');
      }
    });

    $('imageInput').addEventListener('change', (e) => {
      handleImageFiles(e.target.files || []);
      e.target.value = '';
    });

    $('btnPickLibrary').addEventListener('click', () => {
      showToast('素材库选择（原型占位）');
    });
    $('btnMaterialText').addEventListener('click', () => showToast('素材库选择（原型占位）'));
    $('btnEmoji').addEventListener('click', () => {
      const ta = $('momentContent');
      ta.value += '😊';
      ta.dispatchEvent(new Event('input'));
    });
    $('btnLinkCover').addEventListener('click', () => showToast('请上传链接封面（原型）'));

    $('btnCancel').addEventListener('click', () => {
      window.location.href = listUrl;
    });
    $('btnSave').addEventListener('click', saveDraft);
    $('btnPublish').addEventListener('click', publish);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
