/**
 * 购买接口许可
 */
(function () {
  const meta = PurchaseLicenseMeta;
  let employees = JSON.parse(JSON.stringify(PurchaseLicenseEmployees));
  let filtered = [...employees];
  let selectedIds = new Set();
  let page = 1;
  let pageSize = 10;
  let activePanel = 'employee';

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function openModal(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modal').classList.add('show');
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('show');
  }

  function getAccountFields(emp, type) {
    const prefix = type === 'basic' ? 'basic' : 'external';
    return {
      opened: emp[`${prefix}Opened`],
      license: emp[`${prefix}License`] || null,
      createTime: emp[`${prefix}CreateTime`] || null,
      activateTime: emp[`${prefix}ActivateTime`] || null,
      expireTime: emp[`${prefix}ExpireTime`] || null,
    };
  }

  function renderAccountPanel() {
    const s = meta.accountSummary;
    document.getElementById('accountCards').innerHTML = `
      <div class="pl-account-card">
        <h4>基础账号</h4>
        <div class="pl-account-stat"><span class="label">已购总量</span><span class="value">${s.basicTotal}</span></div>
        <div class="pl-account-stat"><span class="label">已分配</span><span class="value">${s.basicUsed}</span></div>
        <div class="pl-account-stat"><span class="label">可分配</span><span class="value highlight">${s.basicAvailable}</span></div>
        <div class="pl-account-stat"><span class="label">到期时间</span><span class="value">${escapeHtmlPl(s.expireDate)}</span></div>
      </div>
      <div class="pl-account-card">
        <h4>互通账号</h4>
        <div class="pl-account-stat"><span class="label">已购总量</span><span class="value">${s.externalTotal}</span></div>
        <div class="pl-account-stat"><span class="label">已分配</span><span class="value">${s.externalUsed}</span></div>
        <div class="pl-account-stat"><span class="label">可分配</span><span class="value highlight">${s.externalAvailable}</span></div>
        <div class="pl-account-stat"><span class="label">到期时间</span><span class="value">${escapeHtmlPl(s.expireDate)}</span></div>
      </div>`;
  }

  function renderOrderPanel() {
    document.getElementById('orderTableBody').innerHTML = PurchaseLicenseOrders.map(
      (o) => `
      <tr>
        <td>${escapeHtmlPl(o.id)}</td>
        <td>${escapeHtmlPl(o.type)}</td>
        <td>${o.count}</td>
        <td>${escapeHtmlPl(o.amount)}</td>
        <td><span style="color:var(--primary)">${escapeHtmlPl(o.status)}</span></td>
        <td>${escapeHtmlPl(o.payTime)}</td>
        <td>${escapeHtmlPl(o.expireDate)}</td>
      </tr>`
    ).join('');
  }

  function populateDeptFilter() {
    const depts = [...new Set(employees.map((e) => e.dept))].sort();
    const sel = document.getElementById('filterDept');
    sel.innerHTML =
      '<option value="">请选择</option>' +
      depts.map((d) => `<option value="${escapeHtmlPl(d)}">${escapeHtmlPl(d)}</option>`).join('');
  }

  function applyFilters() {
    const name = document.getElementById('filterName').value.trim();
    const dept = document.getElementById('filterDept').value;
    const basic = document.getElementById('filterBasic').value;
    const external = document.getElementById('filterExternal').value;

    filtered = employees.filter((e) => {
      if (name && !e.name.includes(name)) return false;
      if (dept && e.dept !== dept) return false;
      if (basic === 'yes' && !e.basicOpened) return false;
      if (basic === 'no' && e.basicOpened) return false;
      if (external === 'yes' && !e.externalOpened) return false;
      if (external === 'no' && e.externalOpened) return false;
      return true;
    });
    page = 1;
    renderTable();
  }

  function resetFilters() {
    document.getElementById('filterName').value = '';
    document.getElementById('filterDept').value = '';
    document.getElementById('filterBasic').value = '';
    document.getElementById('filterExternal').value = '';
    filtered = [...employees];
    page = 1;
    renderTable();
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }

  function getPageSlice() {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  function renderToggle(on, empId, type) {
    return `<button type="button" class="toggle-switch${on ? ' on' : ''}" data-toggle="${type}" data-id="${empId}" aria-label="切换开通状态"></button>`;
  }

  function renderAccountRow(emp, type, isFirst) {
    const acc = getAccountFields(emp, type);
    const typeLabel = type === 'basic' ? '基础账号' : '互通账号';
    const rowCls = type === 'basic' ? 'pl-row-basic' : 'pl-row-external';
    const dash = '<span class="cell-muted">--</span>';

    const mergeCells = isFirst
      ? `
        <td class="col-check" rowspan="2"><input type="checkbox" class="row-check" data-id="${emp.id}"${selectedIds.has(emp.id) ? ' checked' : ''} /></td>
        <td class="col-name" rowspan="2">${escapeHtmlPl(emp.name)}</td>
        <td class="col-phone" rowspan="2">${maskPhone(emp.phone)}</td>
        <td class="col-wechat" rowspan="2">${escapeHtmlPl(emp.wechat)}</td>
        <td class="col-dept" rowspan="2">${escapeHtmlPl(emp.dept)}</td>`
      : '';

    return `
      <tr class="${rowCls}" data-emp-id="${emp.id}">
        ${mergeCells}
        <td class="col-type">${typeLabel}</td>
        <td class="col-toggle">${renderToggle(acc.opened, emp.id, type)}</td>
        <td>${acc.license ? escapeHtmlPl(acc.license) : dash}</td>
        <td class="col-time">${acc.createTime ? escapeHtmlPl(acc.createTime) : dash}</td>
        <td class="col-time">${acc.activateTime ? escapeHtmlPl(acc.activateTime) : dash}</td>
        <td class="col-time">${acc.expireTime ? escapeHtmlPl(acc.expireTime) : dash}</td>
      </tr>`;
  }

  function renderTable() {
    const slice = getPageSlice();
    const tbody = document.getElementById('empTableBody');
    const empty = document.getElementById('empEmpty');

    document.getElementById('tableTotal').textContent = filtered.length;

    if (slice.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
    } else {
      empty.classList.add('hidden');
      tbody.innerHTML = slice
        .map((emp) => renderAccountRow(emp, 'basic', true) + renderAccountRow(emp, 'external', false))
        .join('');
    }

    renderPagination();
    syncCheckAll();
    bindRowEvents();
  }

  function renderPagination() {
    const totalPages = getTotalPages();
    if (page > totalPages) page = totalPages;

    const btns = document.getElementById('pageBtns');
    let html = '';
    html += `<button type="button" class="page-btn" data-page="prev"${page <= 1 ? ' disabled' : ''}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
        if (i === 3 || i === totalPages - 2) html += '<span class="page-ellipsis">…</span>';
        continue;
      }
      html += `<button type="button" class="page-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button type="button" class="page-btn" data-page="next"${page >= totalPages ? ' disabled' : ''}>›</button>`;
    btns.innerHTML = html;

    btns.querySelectorAll('.page-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.page;
        if (p === 'prev' && page > 1) page--;
        else if (p === 'next' && page < totalPages) page++;
        else if (p !== 'prev' && p !== 'next') page = parseInt(p, 10);
        renderTable();
      });
    });
  }

  function syncCheckAll() {
    const slice = getPageSlice();
    const checkAll = document.getElementById('checkAll');
    if (slice.length === 0) {
      checkAll.checked = false;
      checkAll.indeterminate = false;
      return;
    }
    const allChecked = slice.every((e) => selectedIds.has(e.id));
    const someChecked = slice.some((e) => selectedIds.has(e.id));
    checkAll.checked = allChecked;
    checkAll.indeterminate = !allChecked && someChecked;
  }

  function bindRowEvents() {
    document.querySelectorAll('.row-check').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = parseInt(cb.dataset.id, 10);
        if (cb.checked) selectedIds.add(id);
        else selectedIds.delete(id);
        syncCheckAll();
      });
    });

    document.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const type = btn.dataset.toggle;
        const emp = employees.find((e) => e.id === id);
        if (!emp) return;

        const prefix = type === 'basic' ? 'basic' : 'external';
        const next = !emp[`${prefix}Opened`];
        emp[`${prefix}Opened`] = next;

        if (next) {
          const now = new Date();
          const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          emp[`${prefix}License`] = `LIC-${type === 'basic' ? 'B' : 'E'}-${Date.now().toString().slice(-8)}`;
          emp[`${prefix}CreateTime`] = ts;
          emp[`${prefix}ActivateTime`] = ts;
          emp[`${prefix}ExpireTime`] = meta.accountSummary.expireDate + ' 23:59';
          showToast(`已为 ${emp.name} 开通${type === 'basic' ? '基础' : '互通'}账号`);
        } else {
          emp[`${prefix}License`] = null;
          emp[`${prefix}CreateTime`] = null;
          emp[`${prefix}ActivateTime`] = null;
          emp[`${prefix}ExpireTime`] = null;
          showToast(`已关闭 ${emp.name} 的${type === 'basic' ? '基础' : '互通'}账号`);
        }

        applyFilters();
      });
    });
  }

  function getSelectedEmployees() {
    return employees.filter((e) => selectedIds.has(e.id));
  }

  function batchOpen(type) {
    const list = getSelectedEmployees();
    if (list.length === 0) {
      showToast('请先勾选员工');
      return;
    }
    const label = type === 'basic' ? '基础账号' : '互通账号';
    const prefix = type === 'basic' ? 'basic' : 'external';
    let count = 0;
    list.forEach((emp) => {
      if (!emp[`${prefix}Opened`]) {
        emp[`${prefix}Opened`] = true;
        const now = new Date();
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        emp[`${prefix}License`] = `LIC-${type === 'basic' ? 'B' : 'E'}-${Date.now().toString().slice(-8)}-${emp.id}`;
        emp[`${prefix}CreateTime`] = ts;
        emp[`${prefix}ActivateTime`] = ts;
        emp[`${prefix}ExpireTime`] = meta.accountSummary.expireDate + ' 23:59';
        count++;
      }
    });
    showToast(count > 0 ? `已为 ${count} 名员工开通${label}` : '所选员工均已开通');
    applyFilters();
  }

  function batchAssign() {
    const list = getSelectedEmployees();
    if (list.length === 0) {
      showToast('请先勾选员工');
      return;
    }
    openModal(
      '批量分配账号',
      `<p>已选择 <strong>${list.length}</strong> 名员工，系统将按可用许可自动分配基础账号与互通账号。</p>
       <p style="margin-top:12px;font-size:13px;color:var(--text-secondary)">当前可分配：基础账号 ${meta.accountSummary.basicAvailable} 个，互通账号 ${meta.accountSummary.externalAvailable} 个。</p>`
    );
  }

  function exportEmployees() {
    const headers = ['姓名', '手机号', '微信账号', '部门', '账号类型', '是否开通', '接口许可密钥', '创建时间', '激活时间', '失效时间'];
    const rows = [];
    filtered.forEach((emp) => {
      ['basic', 'external'].forEach((type) => {
        const acc = getAccountFields(emp, type);
        rows.push([
          emp.name,
          emp.phone,
          emp.wechat,
          emp.dept,
          type === 'basic' ? '基础账号' : '互通账号',
          acc.opened ? '是' : '否',
          acc.license || '',
          acc.createTime || '',
          acc.activateTime || '',
          acc.expireTime || '',
        ]);
      });
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '员工接口许可.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('导出成功');
  }

  function switchPanel(name) {
    activePanel = name;
    document.querySelectorAll('.pl-sub-tab').forEach((t) => t.classList.toggle('active', t.dataset.panel === name));
    document.querySelectorAll('.pl-panel').forEach((p) => {
      const id = p.id;
      const panelName = id.replace('panel', '').toLowerCase();
      p.classList.toggle('active', panelName === name);
    });
    const url = new URL(window.location.href);
    url.searchParams.set('tab', name);
    window.history.replaceState({}, '', url);
  }

  function initAutoAssign() {
    const toggle = document.getElementById('toggleAutoAssign');
    document.getElementById('autoAssignTip').textContent = meta.autoAssignTip;
    if (meta.autoAssign) toggle.classList.add('on');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
      meta.autoAssign = toggle.classList.contains('on');
      showToast(meta.autoAssign ? '已开启自动分配' : '已关闭自动分配');
    });
  }

  function initFromQuery() {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && ['account', 'employee', 'order'].includes(tab)) {
      switchPanel(tab);
    }
  }

  function bindEvents() {
    document.getElementById('plSubTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.pl-sub-tab');
      if (tab) switchPanel(tab.dataset.panel);
    });

    document.getElementById('btnSearch').addEventListener('click', applyFilters);
    document.getElementById('btnReset').addEventListener('click', (e) => {
      e.preventDefault();
      resetFilters();
    });

    document.getElementById('checkAll').addEventListener('change', (e) => {
      getPageSlice().forEach((emp) => {
        if (e.target.checked) selectedIds.add(emp.id);
        else selectedIds.delete(emp.id);
      });
      renderTable();
    });

    document.getElementById('btnBatchBasic').addEventListener('click', () => batchOpen('basic'));
    document.getElementById('btnBatchExternal').addEventListener('click', () => batchOpen('external'));
    document.getElementById('btnBatchAssign').addEventListener('click', batchAssign);
    document.getElementById('btnExport').addEventListener('click', exportEmployees);

    document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10);
      page = 1;
      renderTable();
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOk').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', closeModal);
  }

  function init() {
    renderAccountPanel();
    renderOrderPanel();
    populateDeptFilter();
    initAutoAssign();
    filtered = [...employees];
    renderTable();
    bindEvents();
    initFromQuery();
  }

  init();
})();
