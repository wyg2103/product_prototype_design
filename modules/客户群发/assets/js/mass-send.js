/**
 * 客户群发列表
 */
(function () {
  let sendType = 'immediate';

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

  function statusClass(status) {
    if (status === 'completed') return 'done';
    if (status === 'running') return 'running';
    return 'scheduled';
  }

  function deliveryCell(row) {
    const map = {
      delivered: ['ok', '正常'],
      partial: ['partial', '部分异常'],
      fail: ['fail', '下发失败'],
      pending: ['pending', '待下发'],
    };
    const [cls, label] = map[row.deliveryStatus] || ['pending', row.deliveryLabel || '待同步'];
    const tag = `<span class="delivery-tag ${cls}">${escapeHtmlMass(label)}</span>`;
    return `<a href="mass-send-stats.html?id=${row.id}" class="delivery-link">${tag}</a>`;
  }

  function renderActions(row) {
    const stats = `<a href="mass-send-stats.html?id=${row.id}&tab=stats">数据统计</a>`;
    if (row.status === 'running') {
      return `
        <a href="#" data-act="remind" data-id="${row.id}">提醒发送</a>
        <a href="#" data-act="stop" data-id="${row.id}">终止</a>
        <a href="#" data-act="view" data-id="${row.id}">查看</a>
        ${stats}
        <a href="#" data-act="copy" data-id="${row.id}">复制</a>
        <a href="#" data-act="refresh" data-id="${row.id}">刷新状态</a>`;
    }
    return `
      <a href="#" data-act="view" data-id="${row.id}">查看</a>
      ${stats}
      <a href="#" data-act="copy" data-id="${row.id}">复制</a>
      <a href="#" data-act="refresh" data-id="${row.id}">刷新状态</a>`;
  }

  function getRows() {
    return MassSendData[sendType] || [];
  }

  function renderTable() {
    const rows = getRows();
    const tbody = document.getElementById('massTableBody');
    document.getElementById('massTotal').textContent = rows.length;

    tbody.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td>${escapeHtmlMass(r.name)}</td>
        <td class="content-cell">${escapeHtmlMass(r.content)}</td>
        <td><span class="staff-tag"><span class="dot">${escapeHtmlMass((r.staff || '?').charAt(0))}</span>${escapeHtmlMass(r.staff)}</span></td>
        <td>${deliveryCell(r)}</td>
        <td>${r.sendTime}</td>
        <td><span class="status-tag ${statusClass(r.status)}">${r.statusLabel}</span></td>
        <td>${r.unsent}</td>
        <td>${r.sent}</td>
        <td>${escapeHtmlMass(r.creator)}</td>
        <td>${r.createTime}</td>
        <td class="mass-actions">${renderActions(r)}</td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('[data-act]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const act = a.dataset.act;
        const row = getRows().find((x) => String(x.id) === a.dataset.id);
        if (!row) return;
        if (act === 'view') {
          openModal(
            '群发任务详情',
            `<div class="detail-row"><label>任务名称</label><span>${escapeHtmlMass(row.name)}</span></div>
            <div class="detail-row"><label>任务下发</label><span>${escapeHtmlMass(row.deliveryLabel || '—')}</span></div>
            <div class="detail-row"><label>数据更新时间</label><span>${escapeHtmlMass(row.apiSyncTime || '—')}</span></div>
            <div class="detail-row"><label>提醒次数</label><span>${row.remindCount ?? 0} / 3（24 小时内）</span></div>
            <p style="margin-top:12px">点击列表「任务下发」可查看原因；<a href="mass-send-stats.html?id=${row.id}&tab=stats">查看执行数据 →</a></p>`
          );
        } else if (act === 'remind') {
          const left = 3 - (row.remindCount || 0);
          showToast(left > 0 ? `已提醒员工发送（还可提醒 ${left} 次）` : '24 小时内最多提醒 3 次，请让员工手动发送');
        } else {
          const map = {
            stop: `已终止任务「${row.name}」`,
            copy: `已复制任务「${row.name}」`,
            refresh: '数据已刷新',
          };
          showToast(map[act] || '操作成功');
        }
      });
    });
  }

  function init() {
    renderTable();

    document.querySelectorAll('.mass-type-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        sendType = tab.dataset.type;
        document.querySelectorAll('.mass-type-tab').forEach((t) => t.classList.toggle('active', t === tab));
        renderTable();
      });
    });

    document.getElementById('btnQuery').addEventListener('click', () => showToast('已按条件查询'));
    document.getElementById('btnReset').addEventListener('click', () => {
      ['filterStaff', 'filterCreator', 'filterName', 'filterSendStart', 'filterSendEnd'].forEach((id) => {
        document.getElementById(id).value = '';
      });
      document.getElementById('filterStatus').value = '';
      showToast('已重置筛选条件');
    });
    document.getElementById('btnRefresh').addEventListener('click', () => showToast('已刷新全部任务状态'));
    document.getElementById('btnSyncApi').addEventListener('click', () => showToast('正在从企业微信拉取最新数据…'));
    document.getElementById('btnExport').addEventListener('click', () => showToast('正在导出表格'));
    document.getElementById('btnHelp').addEventListener('click', (e) => {
      e.preventDefault();
      openModal(
        '什么是客户群发？',
        '<p style="line-height:1.7;color:#646a73;font-size:13px">在后台创建群发后，<strong>不会自动发到客户微信</strong>，需要员工在自己手机的企业微信里打开「群发助手」并点击发送。只有<strong>能使用本系统的员工</strong>才会收到待发送任务。</p>'
      );
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOk').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
