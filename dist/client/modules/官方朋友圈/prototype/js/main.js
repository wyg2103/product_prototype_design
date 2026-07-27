/**
 * 官方朋友圈 - 列表页交互
 */

let state = {
  mainTab: 'personal',
  sendType: 'immediate',
  groupId: 'all',
  page: 1,
  pageSize: 10,
  selected: new Set(),
  filters: {
    employee: '',
    dateStart: '',
    dateEnd: '',
    status: '',
  },
};

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

let confirmCallback = null;

function resetModalFooter(mode) {
  const cancelBtn = document.getElementById('modalCancel');
  const okBtn = document.getElementById('modalOk');
  if (mode === 'confirm') {
    cancelBtn.classList.remove('hidden');
    okBtn.textContent = '确定';
    okBtn.className = 'btn-primary';
  } else if (mode === 'danger') {
    cancelBtn.classList.remove('hidden');
    okBtn.textContent = '确定终止';
    okBtn.className = 'btn-danger';
  } else {
    cancelBtn.classList.add('hidden');
    okBtn.textContent = '知道了';
    okBtn.className = 'btn-primary';
  }
}

function openModal(title, bodyHtml) {
  confirmCallback = null;
  resetModalFooter('info');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modal').classList.add('show');
}

function openConfirmModal(options) {
  const { title, bodyHtml, okText, danger, onConfirm } = options;
  confirmCallback = onConfirm || null;
  resetModalFooter(danger ? 'danger' : 'confirm');
  if (okText) document.getElementById('modalOk').textContent = okText;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  confirmCallback = null;
  document.getElementById('modal').classList.remove('show');
  resetModalFooter('info');
}

function taskLabel(row) {
  return row.taskName || (row.content || '').slice(0, 16) || '未命名任务';
}

function confirmPublishTask(row) {
  const label = taskLabel(row);
  const targets = (row.targets || []).join('、') || '所选员工';
  openConfirmModal({
    title: '确认发布任务？',
    okText: '确认发布',
    bodyHtml: `
      <p class="confirm-lead">确定发布任务「${escapeHtml(label)}」吗？</p>
      <div class="confirm-impact">
        <div class="confirm-impact-title">操作影响</div>
        <ul>
          <li>任务状态将由「待发布」变为「执行中」</li>
          <li>任务将下发至员工企微工作台「官方朋友圈」：${escapeHtml(targets)}</li>
          <li>员工需在计划终止时间前确认发表至客户朋友圈；未设置则长期有效</li>
          <li>已下发后，未执行员工可持续收到提醒，直至发表或任务被终止</li>
          <li>已成功发表的内容不会因后续终止而撤回</li>
        </ul>
      </div>`,
    onConfirm: () => {
      const updated = publishMomentTask(state.mainTab, state.sendType, row.id);
      if (!updated) {
        showToast('该任务无法发布（可能已发布或已终止）');
        return;
      }
      showToast(`已发布「${label}」，员工可在企微客户端执行`);
      renderTable();
    },
  });
}

function confirmStopTask(row) {
  const label = taskLabel(row);
  const isEnterprise = state.mainTab === 'enterprise';
  const apiLine = isEnterprise
    ? '<li>将模拟调用企微「停止发表企业朋友圈」（cancel_moment_task），仅停止尚未发表的成员任务</li>'
    : '<li>个人发表任务无企微 moment_id，仅在 SCRM 侧停止下发与员工发表（不调用 cancel 接口）</li>';
  openConfirmModal({
    title: '确认终止任务？',
    okText: '确定终止',
    danger: true,
    bodyHtml: `
      <p class="confirm-lead">确定终止任务「${escapeHtml(label)}」吗？</p>
      <div class="confirm-impact">
        <div class="confirm-impact-title">操作影响</div>
        <ul>
          <li>任务状态将变为「已终止」，此操作不可恢复</li>
          ${apiLine}
          <li>未执行的员工将无法再发表该朋友圈（不可发表、不可补发）</li>
          <li>员工端任务将显示为已终止/已过期</li>
          <li>已成功发表的内容不受影响，客户仍可正常查看（已发表不可撤回）</li>
        </ul>
      </div>`,
    onConfirm: () => {
      const updated = terminateMomentTask(state.mainTab, state.sendType, row.id);
      if (!updated) {
        showToast('该任务已终止或无法终止');
        return;
      }
      if (isEnterprise && updated.moment_id) {
        showToast(`已终止「${label}」（模拟 cancel：${updated.moment_id}）`);
      } else {
        showToast(`已终止任务「${label}」`);
      }
      renderTable();
    },
  });
}

function getRows() {
  const pool = DataStore[state.mainTab] && DataStore[state.mainTab][state.sendType];
  const rows = pool || [];
  const filters = state.filters;
  return rows.filter((row) => {
    const creator = String(row.creator || '').toLowerCase();
    const publishDate = String(row.publishTime || row.time || '').slice(0, 10);
    if (filters.employee && !creator.includes(filters.employee.toLowerCase())) return false;
    if (filters.dateStart && publishDate < filters.dateStart) return false;
    if (filters.dateEnd && publishDate > filters.dateEnd) return false;
    if (filters.status && getMomentStatus(row) !== filters.status) return false;
    return true;
  });
}

function hasActiveFilters() {
  return Object.values(state.filters).some(Boolean);
}

function renderGroups() {
  const list = GROUPS[state.mainTab];
  const ul = document.getElementById('groupTree');
  ul.innerHTML = list
    .map((g) => {
      const active = g.id === state.groupId ? 'active' : '';
      let html = `<li class="${active}" data-group="${g.id}">${g.label}</li>`;
      if (g.children) {
        html += g.children.map((c) => `<li class="sub-item">${c}</li>`).join('');
      }
      return html;
    })
    .join('');
  ul.querySelectorAll('li[data-group]').forEach((li) => {
    li.addEventListener('click', () => {
      state.groupId = li.dataset.group;
      renderGroups();
      showToast(`已切换到分组：${li.textContent}`);
    });
  });
}

function renderRowActions(r, tab) {
  const status = getMomentStatus(r);
  const publishLink =
    status === MOMENT_STATUS.DRAFT
      ? `<a href="#" data-action="publish" data-id="${r.id}">发布</a>`
      : '';
  const stopLink =
    status === MOMENT_STATUS.RUNNING
      ? `<a href="#" data-action="stop" data-id="${r.id}">终止</a>`
      : status === MOMENT_STATUS.STOPPED
        ? '<span class="action-disabled">已终止</span>'
        : '';
  return `
    <a href="${getDetailUrl(tab, state.sendType, r.id)}">详情</a>
    ${publishLink}
    ${stopLink}
    <a href="#" data-action="guide" data-id="${r.id}">设置为导购任务</a>
    <a href="#" data-action="copy" data-id="${r.id}">复制</a>`;
}

function renderStatusCell(r) {
  const status = getMomentStatus(r);
  return `<td><span class="${statusClassName(status)}">${escapeHtml(status)}</span></td>`;
}

function renderTerminateCell(r) {
  const text = formatTerminateTime(r.terminateTime);
  const cls = r.terminateTime ? '' : ' terminate-long';
  let sub = '';
  if (getMomentStatus(r) === MOMENT_STATUS.STOPPED && r.stoppedAt) {
    const reason = typeof getStopReasonLabel === 'function' ? getStopReasonLabel(r) : '';
    sub = `<div class="terminate-sub">${escapeHtml(reason || '已终止')} · ${escapeHtml(r.stoppedAt)}</div>`;
  }
  return `<td class="terminate-cell${cls}"><div>${escapeHtml(text)}</div>${sub}</td>`;
}

function renderTable() {
  if (typeof ensureMomentTasksSynced === 'function') ensureMomentTasksSynced();
  const rows = getRows();
  const isPersonal = state.mainTab === 'personal';
  const thead = document.getElementById('tableHead');
  const tbody = document.getElementById('tableBody');

  if (isPersonal) {
    thead.innerHTML = `
      <tr>
        <th class="col-check"><input type="checkbox" id="checkAll" /></th>
        <th>任务名称</th>
        <th>内容类型</th>
        <th>内容</th>
        <th>状态</th>
        <th>创建人</th>
        <th>创建时间</th>
        <th>终止时间</th>
        <th>操作</th>
      </tr>`;
    tbody.innerHTML = rows.length
      ? rows
        .map(
          (r) => `
      <tr data-id="${r.id}">
        <td class="col-check"><input type="checkbox" class="row-check" value="${r.id}" /></td>
        <td>${escapeHtml(r.taskName)}${r.isGuide ? '<br><span class="tag-guide">已设为导购任务</span>' : ''}</td>
        <td>${r.type}</td>
        <td class="content-cell">${escapeHtml(r.content)}${r.url ? `<span class="url">${escapeHtml(r.url)}</span>` : ''}</td>
        ${renderStatusCell(r)}
        <td>${escapeHtml(r.creator)}</td>
        <td>${r.time}</td>
        ${renderTerminateCell(r)}
        <td class="actions">${renderRowActions(r, 'personal')}</td>
      </tr>`
        )
        .join('')
      : '<tr><td colspan="9" class="table-empty">暂无符合条件的朋友圈任务</td></tr>';
  } else {
    thead.innerHTML = `
      <tr>
        <th class="col-check"><input type="checkbox" id="checkAll" /></th>
        <th>内容类型</th>
        <th>内容</th>
        <th>状态</th>
        <th>创建人</th>
        <th>创建时间</th>
        <th>终止时间</th>
        <th>操作</th>
      </tr>`;
    tbody.innerHTML = rows.length
      ? rows
        .map(
          (r) => `
      <tr data-id="${r.id}">
        <td class="col-check"><input type="checkbox" class="row-check" value="${r.id}" /></td>
        <td>${r.type}</td>
        <td class="content-cell">
          ${r.image ? '<img class="thumb-img" src="data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="#e8f8f1" width="48" height="48"/><text x="24" y="28" text-anchor="middle" fill="#00b373" font-size="10">图</text></svg>') + '" alt="" />' : ''}
          ${escapeHtml(r.content)}${r.url ? `<span class="url">${escapeHtml(r.url)}</span>` : ''}
        </td>
        ${renderStatusCell(r)}
        <td>${escapeHtml(r.creator)}</td>
        <td>${r.time}</td>
        ${renderTerminateCell(r)}
        <td class="actions">${renderRowActions(r, 'enterprise')}</td>
      </tr>`
        )
        .join('')
      : '<tr><td colspan="8" class="table-empty">暂无符合条件的朋友圈任务</td></tr>';
  }

  const defaultTotal = state.mainTab === 'personal'
    ? (state.sendType === 'immediate' ? 96 : 12)
    : (state.sendType === 'immediate' ? 40 : 5);
  const total = hasActiveFilters() ? rows.length : defaultTotal;
  document.getElementById('totalCount').textContent = total;

  bindTableEvents();
  updateActionBar();
}

function findRow(id) {
  return getRows().find((r) => String(r.id) === String(id));
}

function bindTableEvents() {
  const checkAll = document.getElementById('checkAll');
  if (checkAll) {
    checkAll.checked = false;
    checkAll.onchange = () => {
      document.querySelectorAll('.row-check').forEach((cb) => {
        cb.checked = checkAll.checked;
        if (checkAll.checked) state.selected.add(cb.value);
        else state.selected.delete(cb.value);
      });
      if (!checkAll.checked) state.selected.clear();
    };
  }

  document.querySelectorAll('.row-check').forEach((cb) => {
    cb.onchange = () => {
      if (cb.checked) state.selected.add(cb.value);
      else state.selected.delete(cb.value);
    };
  });

  document.querySelectorAll('[data-action]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.dataset.id;
      const action = a.dataset.action;
      const row = findRow(id);
      if (!row) return;

      if (action === 'guide') {
        showToast(`已将「${taskLabel(row)}」设为导购任务（原型演示）`);
      } else if (action === 'copy') {
        showToast('已复制任务配置（原型演示）');
      } else if (action === 'publish') {
        confirmPublishTask(row);
      } else if (action === 'stop') {
        confirmStopTask(row);
      }
    });
  });
}

function updateActionBar() {
  const isPersonal = state.mainTab === 'personal';
  const isSync = state.mainTab === 'sync';
  const bar = document.querySelector('.action-bar');
  bar.classList.toggle('mode-personal', isPersonal);
  bar.classList.toggle('mode-enterprise', state.mainTab === 'enterprise');
  document.getElementById('btnPublishTask').classList.toggle('hidden', !isPersonal);
  document.getElementById('btnPublishEnterprise').classList.toggle('hidden', isPersonal || isSync);
  document.getElementById('panelList').classList.toggle('hidden', isSync);
  document.getElementById('panelSync').classList.toggle('active', isSync);
  document.getElementById('contentPanels').classList.toggle('hidden', isSync);
  document.getElementById('paginationBar').classList.toggle('hidden', isSync);
}

function switchMainTab(tab) {
  state.mainTab = tab;
  state.groupId = 'all';
  state.selected.clear();

  document.querySelectorAll('.sub-tab').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });

  if (tab === 'sync') {
    updateActionBar();
    return;
  }

  document.getElementById('panelSync').classList.remove('active');
  renderGroups();
  renderTable();
  updateActionBar();
}

function initFromQuery() {
  const q = new URLSearchParams(location.search);
  const tab = q.get('tab');
  const send = q.get('send');
  if (tab === 'personal' || tab === 'enterprise') {
    state.mainTab = tab;
    document.querySelectorAll('.sub-tab').forEach((el) => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
  }
  if (send === 'scheduled' || send === 'immediate') {
    state.sendType = send;
    document.querySelectorAll('.send-tab').forEach((el) => {
      el.classList.toggle('active', el.dataset.send === send);
    });
  }
}

function init() {
  initFromQuery();

  document.querySelectorAll('.sub-tab').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.tab === state.mainTab) return;
      state.sendType = 'immediate';
      document.querySelectorAll('.send-tab').forEach((t) => {
        t.classList.toggle('active', t.dataset.send === 'immediate');
      });
      switchMainTab(el.dataset.tab);
    });
  });

  document.querySelectorAll('.send-tab').forEach((el) => {
    el.addEventListener('click', () => {
      state.sendType = el.dataset.send;
      document.querySelectorAll('.send-tab').forEach((t) => t.classList.toggle('active', t === el));
      renderTable();
    });
  });

  document.getElementById('btnSearch').addEventListener('click', () => {
    state.filters = {
      employee: document.getElementById('filterEmployee').value.trim(),
      dateStart: document.getElementById('dateStart').value,
      dateEnd: document.getElementById('dateEnd').value,
      status: document.getElementById('filterStatus').value,
    };
    state.page = 1;
    state.selected.clear();
    renderTable();
    const count = getRows().length;
    showToast(hasActiveFilters() ? `已按条件筛选，共 ${count} 条` : '已显示全部任务');
  });

  document.getElementById('btnReset').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('filterEmployee').value = '';
    document.getElementById('dateStart').value = '';
    document.getElementById('dateEnd').value = '';
    document.getElementById('filterStatus').value = '';
    state.filters = { employee: '', dateStart: '', dateEnd: '', status: '' };
    state.page = 1;
    state.selected.clear();
    renderTable();
    showToast('已清空搜索条件');
  });

  document.getElementById('btnPublishTask').addEventListener('click', () => {
    window.location.href = 'moment-create.html';
  });

  document.getElementById('btnPublishEnterprise').addEventListener('click', () => {
    window.location.href = 'moment-create.html?mode=enterprise';
  });

  document.getElementById('btnBatchGuide').addEventListener('click', () => {
    const n = document.querySelectorAll('.row-check:checked').length;
    showToast(n ? `已批量设置 ${n} 条为导购任务（原型）` : '请先勾选列表项');
  });

  document.getElementById('btnBatchDelete').addEventListener('click', () => {
    const n = document.querySelectorAll('.row-check:checked').length;
    if (!n) {
      showToast('请先勾选要删除的项');
      return;
    }
    if (confirm(`确定删除选中的 ${n} 条记录？（原型，不会真实删除）`)) {
      showToast('批量删除成功（原型演示）');
    }
  });

  document.getElementById('btnBatchGroup').addEventListener('click', () => {
    showToast('打开批量分组弹窗（原型演示）');
  });

  document.getElementById('addGroup').addEventListener('click', (e) => {
    e.preventDefault();
    const name = prompt('请输入新分组名称：');
    if (name) showToast(`已添加分组「${name}」（原型演示）`);
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalOk').addEventListener('click', () => {
    const cb = confirmCallback;
    closeModal();
    if (typeof cb === 'function') cb();
  });
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });

  document.querySelectorAll('.page-btns button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      state.page = parseInt(btn.dataset.page, 10);
      document.querySelectorAll('.page-btns button[data-page]').forEach((b) => {
        b.classList.toggle('active', parseInt(b.dataset.page, 10) === state.page);
      });
      showToast(`切换到第 ${state.page} 页（原型演示）`);
    });
  });

  document.getElementById('gotoBtn').addEventListener('click', () => {
    const p = parseInt(document.getElementById('gotoInput').value, 10);
    if (p >= 1) showToast(`前往第 ${p} 页（原型演示）`);
  });

  if (state.mainTab === 'sync') {
    switchMainTab('sync');
  } else {
    renderGroups();
    renderTable();
    updateActionBar();
  }
}

document.addEventListener('DOMContentLoaded', init);
