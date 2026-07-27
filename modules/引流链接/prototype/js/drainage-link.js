/**
 * 引流链接列表页
 */
(function () {
  const state = {
    tab: 'lbs-group',
    groupId: 'all',
    page: 1,
    pageSize: 10,
    filters: { name: '', creator: '', remark: '', dateStart: '', dateEnd: '' },
  };

  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function filteredLinks() {
    return DrainageLinkStore.links.filter((row) => {
      if (state.tab && row.tab !== state.tab) return false;
      if (state.groupId !== 'all' && row.groupId !== state.groupId) return false;
      const { name, creator, remark, dateStart, dateEnd } = state.filters;
      if (name && !row.name.includes(name)) return false;
      if (creator && row.creator !== creator) return false;
      if (remark && !(row.remark || '').includes(remark)) return false;
      if (dateStart && row.createdAt.slice(0, 10) < dateStart) return false;
      if (dateEnd && row.createdAt.slice(0, 10) > dateEnd) return false;
      return true;
    });
  }

  function renderGroups() {
    const list = document.getElementById('groupList');
    if (!list) return;
    list.innerHTML = DrainageLinkStore.groups
      .map(
        (g) =>
          `<li class="${g.id === state.groupId ? 'active' : ''}" data-id="${g.id}">${escapeHtml(g.label)}</li>`
      )
      .join('');
  }

  function renderTable() {
    const rows = filteredLinks();
    const total = rows.length;
    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);
    const tbody = document.getElementById('tableBody');
    const totalEl = document.getElementById('totalCount');
    if (totalEl) totalEl.textContent = total;

    if (!tbody) return;
    if (!pageRows.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999">暂无数据</td></tr>';
      renderPagination(total);
      return;
    }

    tbody.innerHTML = pageRows
      .map(
        (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.channelActivity)}</td>
        <td>${r.createdAt}</td>
        <td>${escapeHtml(r.creator || '--')}</td>
        <td>${escapeHtml(r.groupLabel)}</td>
        <td>${escapeHtml(r.remark || '--')}</td>
        <td class="dl-actions">
          ${renderRowActions(r)}
        </td>
      </tr>`
      )
      .join('');
    renderPagination(total);
  }

  function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages) state.page = pages;
    const btns = document.getElementById('pageBtns');
    const goto = document.getElementById('gotoInput');
    if (goto) goto.value = state.page;

    if (!btns) return;

    const maxVisible = 5;
    let startPage = Math.max(1, state.page - 2);
    let endPage = Math.min(pages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    let html = '';
    html += `<button type="button" class="page-btn" data-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>&lt;</button>`;
    for (let i = startPage; i <= endPage; i++) {
      html += `<button type="button" class="page-btn ${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button type="button" class="page-btn" data-page="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>&gt;</button>`;
    btns.innerHTML = html;
  }

  function fillCreators() {
    const sel = document.getElementById('filterCreator');
    if (!sel) return;
    sel.innerHTML =
      '<option value="">请选择</option>' +
      DrainageLinkStore.creators.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  const TAB_CONFIG = {
    friend: {
      createPage: 'drainage-link-create.html',
      col2Label: '渠道活动',
      showExport: true,
    },
    'lbs-friend': {
      createPage: 'drainage-link-lbs-friend-create.html',
      col2Label: '兜底活码',
      showExport: false,
    },
    'lbs-group': {
      createPage: 'drainage-link-create.html',
      col2Label: '渠道活动',
      showExport: true,
    },
  };

  function getTabConfig() {
    return TAB_CONFIG[state.tab] || TAB_CONFIG['lbs-group'];
  }

  function renderTableHeader() {
    const thead = document.querySelector('.data-table thead tr');
    if (!thead) return;
    const col2 = getTabConfig().col2Label;
    thead.innerHTML = `
      <th>链接名称</th>
      <th>${col2}</th>
      <th>创建时间</th>
      <th>创建人</th>
      <th>分组</th>
      <th>备注</th>
      <th>操作</th>`;
  }

  function renderRowActions(r) {
    if (state.tab === 'lbs-friend') {
      return `
        <a href="#" data-act="emp-code" data-id="${r.id}">员工好友码</a>
        <span class="dl-promote-wrap">
          <a href="#" data-act="promote" data-id="${r.id}">推广 ▾</a>
          <div class="dl-promote-menu hidden">
            <a href="#" data-promo="link">复制链接</a>
            <a href="#" data-promo="qr">下载二维码</a>
          </div>
        </span>
        <a href="${getTabConfig().createPage}?id=${r.id}&tab=${state.tab}">修改</a>
        <a href="#" data-act="delete" data-id="${r.id}">删除</a>`;
    }
    return `
      <a href="#" data-act="store" data-id="${r.id}">关联门店</a>
      <span class="dl-promote-wrap">
        <a href="#" data-act="promote" data-id="${r.id}">推广 ▾</a>
        <div class="dl-promote-menu hidden">
          <a href="#" data-promo="link">复制链接</a>
          <a href="#" data-promo="qr">下载二维码</a>
        </div>
      </span>
      <a href="${getTabConfig().createPage}?id=${r.id}&tab=${state.tab}">修改</a>
      <a href="#" data-act="delete" data-id="${r.id}">删除</a>`;
  }

  function updateToolbar() {
    const cfg = getTabConfig();
    const btn = document.getElementById('btnCreate');
    if (btn) btn.href = `${cfg.createPage}?tab=${state.tab}`;
    const exportBtn = document.getElementById('btnExport');
    if (exportBtn) exportBtn.style.display = cfg.showExport ? '' : 'none';
  }

  function closePromoteMenus() {
    document.querySelectorAll('.dl-promote-menu').forEach((m) => m.classList.add('hidden'));
  }

  function bindEvents() {
    document.querySelectorAll('.dl-sub-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dl-sub-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.tab = btn.dataset.tab;
        state.page = 1;
        updateToolbar();
        renderTableHeader();
        renderTable();
      });
    });

    document.getElementById('groupList')?.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      state.groupId = li.dataset.id;
      state.page = 1;
      renderGroups();
      renderTable();
    });

    document.getElementById('btnSearch')?.addEventListener('click', () => {
      state.filters = {
        name: document.getElementById('filterName')?.value.trim() || '',
        creator: document.getElementById('filterCreator')?.value || '',
        remark: document.getElementById('filterRemark')?.value.trim() || '',
        dateStart: document.getElementById('filterDateStart')?.value || '',
        dateEnd: document.getElementById('filterDateEnd')?.value || '',
      };
      state.page = 1;
      renderTable();
    });

    document.getElementById('btnReset')?.addEventListener('click', (e) => {
      e.preventDefault();
      ['filterName', 'filterRemark', 'filterDateStart', 'filterDateEnd'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const creator = document.getElementById('filterCreator');
      if (creator) creator.value = '';
      state.filters = { name: '', creator: '', remark: '', dateStart: '', dateEnd: '' };
      state.page = 1;
      renderTable();
    });

    document.getElementById('pageBtns')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      const page = Number(btn.dataset.page);
      if (page >= 1) {
        state.page = page;
        renderTable();
      }
    });

    document.getElementById('pageSizeSelect')?.addEventListener('change', (e) => {
      state.pageSize = Number(e.target.value);
      state.page = 1;
      renderTable();
    });

    document.getElementById('gotoInput')?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const pages = Math.max(1, Math.ceil(filteredLinks().length / state.pageSize));
      const page = Math.min(Math.max(1, Number(e.target.value) || 1), pages);
      state.page = page;
      renderTable();
    });

    document.getElementById('tableBody')?.addEventListener('click', (e) => {
      const promoItem = e.target.closest('[data-promo]');
      if (promoItem) {
        e.preventDefault();
        closePromoteMenus();
        showToast(promoItem.dataset.promo === 'qr' ? '二维码已下载（演示）' : '推广链接已复制（演示）');
        return;
      }

      const link = e.target.closest('[data-act]');
      if (!link) return;
      e.preventDefault();
      const act = link.dataset.act;
      const row = findDrainageLink(link.dataset.id);

      if (act === 'promote') {
        const wrap = link.closest('.dl-promote-wrap');
        const menu = wrap?.querySelector('.dl-promote-menu');
        const isOpen = menu && !menu.classList.contains('hidden');
        closePromoteMenus();
        if (!isOpen && menu) menu.classList.remove('hidden');
        return;
      }

      if (act === 'delete') showToast(`已删除「${row?.name || ''}」（演示）`);
      else if (act === 'store') showToast('关联门店功能为演示占位');
      else if (act === 'emp-code') showToast(`员工好友码（演示）：${row?.name || ''}`);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dl-promote-wrap')) closePromoteMenus();
    });

    document.getElementById('btnExport')?.addEventListener('click', () => showToast('导出任务已提交（演示）'));
    document.getElementById('btnAddGroup')?.addEventListener('click', () => showToast('添加分组（演示）'));
  }

  function initFromQuery() {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      state.tab = tab;
      document.querySelectorAll('.dl-sub-tab').forEach((b) => {
        b.classList.toggle('active', b.dataset.tab === tab);
      });
    }
  }

  fillCreators();
  initFromQuery();
  updateToolbar();
  renderTableHeader();
  renderTable();
  renderGroups();
  bindEvents();
})();
