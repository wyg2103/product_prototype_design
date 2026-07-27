/**
 * 朋友圈详情页
 */
(function () {
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || 'personal';
  const send = params.get('send') || 'immediate';
  const id = params.get('id');

  const SOURCE_LABEL = { personal: '个人发表', enterprise: '企业发表' };

  let filteredRecords = [...TASK_RECORDS];

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

  function formatPreviewDate(publishTime) {
    if (!publishTime) return '';
    const m = publishTime.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return publishTime;
    return `${m[2]}月${m[3]}日`;
  }

  function renderMoment(moment) {
    const isPersonal = type === 'personal';
    document.getElementById('breadcrumbSource').textContent = SOURCE_LABEL[type] || type;
    document.getElementById('backList').href =
      `index.html?tab=${type}&send=${send}`;

    const displayName = moment.creator || '—';
    const avatar = moment.creatorAvatar || displayName.charAt(0);
    document.getElementById('previewName').textContent = displayName;
    document.getElementById('previewAvatar').textContent = avatar;
    document.getElementById('previewDate').textContent = formatPreviewDate(moment.publishTime || moment.time);
    document.getElementById('previewContent').textContent =
      (moment.content || '—').replace(/^\[链接\]\s*/, '');

    const targets = moment.targets || [];
    const taskNameRow = isPersonal && moment.taskName
      ? `<div class="meta-row"><label>任务名称</label><div class="value">${escapeHtml(moment.taskName)}</div></div>`
      : '';

    const status = getMomentStatus(moment);
    const statusClass =
      status === '已终止'
        ? 'status-terminated'
        : status === '执行中'
          ? 'status-sent'
          : 'status-pending';

    const stopReasonLabel =
      status === '已终止' && typeof getStopReasonLabel === 'function' ? getStopReasonLabel(moment) : '';
    const stoppedAtRow =
      status === '已终止' && moment.stoppedAt
        ? `<div class="meta-row"><label>实际终止时间</label><div class="value">${escapeHtml(moment.stoppedAt)}${stopReasonLabel ? `（${escapeHtml(stopReasonLabel)}）` : ''}</div></div>`
        : '';
    const momentIdRow =
      !isPersonal && moment.moment_id
        ? `<div class="meta-row"><label>企微 moment_id</label><div class="value mono">${escapeHtml(moment.moment_id)}</div></div>`
        : !isPersonal && status === '执行中'
          ? `<div class="meta-row"><label>企微 moment_id</label><div class="value">下发后生成（对接 cancel_moment_task）</div></div>`
          : '';

    document.getElementById('detailMeta').innerHTML = `
      ${taskNameRow}
      <div class="meta-row">
        <label>创建者</label>
        <div class="value">
          <span class="tag-user"><span class="icon">${escapeHtml(displayName.charAt(0))}</span>${escapeHtml(displayName)}</span>
        </div>
      </div>
      <div class="meta-row"><label>消息内容</label><div class="value">${escapeHtml(moment.content)}</div></div>
      <div class="meta-row"><label>内容类型</label><div class="value">${escapeHtml(moment.type)}</div></div>
      <div class="meta-row"><label>群发类型</label><div class="value">${escapeHtml(moment.sendType || '立即发送')}</div></div>
      <div class="meta-row"><label>任务状态</label><div class="value ${statusClass}">${escapeHtml(status)}</div></div>
      <div class="meta-row"><label>发布时间</label><div class="value">${escapeHtml(moment.publishTime || (status === '待发布' ? '-' : moment.time))}</div></div>
      <div class="meta-row"><label>计划终止时间</label><div class="value">${escapeHtml(formatTerminateTime(moment.terminateTime))}</div></div>
      ${stoppedAtRow}
      ${momentIdRow}
      <div class="meta-row">
        <label>任务对象</label>
        <div class="value">
          <div class="targets-box">
            <div class="targets-tags">
              ${targets.map((t) => `<span class="target-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="targets-footer">共计 ${targets.length} 个对象</div>
          </div>
        </div>
      </div>`;
  }

  function renderInteractTable(rows, columns) {
    if (!rows.length) {
      return '<p style="color:#909399;text-align:center;padding:24px">暂无数据</p>';
    }
    const heads = columns.map((c) => `<th>${c.label}</th>`).join('');
    const body = rows
      .map(
        (r) =>
          `<tr>${columns.map((c) => `<td>${escapeHtml(r[c.key])}</td>`).join('')}</tr>`
      )
      .join('');
    return `<table class="interact-table"><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function bindRecordsTable() {
    const tbody = document.getElementById('recordsBody');
    if (!filteredRecords.length) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="empty-records">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = filteredRecords
      .map((r) => {
        const sentLabel = r.sent
          ? '<span class="status-badge yes">已发送</span>'
          : '<span class="status-badge no">未发送</span>';
        const commentCell = r.sent && r.commentCount > 0
          ? `<a href="#" class="count-link" data-interact="comment" data-rid="${r.id}">${r.commentCount}</a>`
          : '<span class="cell-dash">-</span>';
        const likeCell = r.sent && r.likeCount > 0
          ? `<a href="#" class="count-link" data-interact="like" data-rid="${r.id}">${r.likeCount}</a>`
          : '<span class="cell-dash">-</span>';
        const sendTime = r.sent && r.sendTime ? r.sendTime : '<span class="cell-dash">-</span>';
        const visibility = r.visibilityScope === '公开'
          ? '<span class="visibility-tag public">公开</span>'
          : '<span class="visibility-tag">不分可见</span>';
        const phoneMask = r.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

        return `<tr>
          <td>${escapeHtml(r.employee)}</td>
          <td>${phoneMask}</td>
          <td>${escapeHtml(r.department)}</td>
          <td>${sentLabel}</td>
          <td class="send-time-cell">${sendTime}</td>
          <td>${visibility}</td>
          <td>${commentCell}</td>
          <td>${likeCell}</td>
          <td class="actions"><a href="#" data-action="employee-detail" data-rid="${r.id}">员工详情</a></td>
        </tr>`;
      })
      .join('');

    tbody.querySelectorAll('[data-interact]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const rec = TASK_RECORDS.find((x) => x.id === a.dataset.rid);
        if (!rec) return;
        if (a.dataset.interact === 'comment') {
          openModal(
            `评论明细 - ${rec.employee}`,
            renderInteractTable(rec.comments, [
              { key: 'userId', label: '用户ID' },
              { key: 'nickname', label: '用户昵称' },
              { key: 'time', label: '评论时间' },
            ])
          );
        } else {
          openModal(
            `点赞明细 - ${rec.employee}`,
            renderInteractTable(rec.likes, [
              { key: 'userId', label: '用户ID' },
              { key: 'nickname', label: '点赞用户昵称' },
              { key: 'time', label: '点赞时间' },
            ])
          );
        }
      });
    });

    tbody.querySelectorAll('[data-action="employee-detail"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const rec = TASK_RECORDS.find((x) => x.id === a.dataset.rid);
        if (!rec) return;
        openModal(
          `员工详情 - ${rec.employee}`,
          `<div class="detail-row"><label>员工</label><span>${escapeHtml(rec.employee)}</span></div>
          <div class="detail-row"><label>手机号</label><span>${escapeHtml(rec.phone)}</span></div>
          <div class="detail-row"><label>所在部门</label><span>${escapeHtml(rec.department)}</span></div>
          <div class="detail-row"><label>是否发送</label><span>${rec.sent ? '已发送' : '未发送'}</span></div>
          <div class="detail-row"><label>发送时间</label><span>${rec.sent && rec.sendTime ? rec.sendTime : '-'}</span></div>
          <div class="detail-row"><label>朋友圈可见范围</label><span>${escapeHtml(rec.visibilityScope || '-')}</span></div>`
        );
      });
    });
  }

  function initFilters() {
    const emps = [...new Set(TASK_RECORDS.map((r) => r.employee))];
    const depts = [...new Set(TASK_RECORDS.map((r) => r.department))];
    const empSel = document.getElementById('filterEmp');
    const deptSel = document.getElementById('filterDept');
    emps.forEach((e) => {
      const o = document.createElement('option');
      o.value = e;
      o.textContent = e;
      empSel.appendChild(o);
    });
    depts.forEach((d) => {
      const o = document.createElement('option');
      o.value = d;
      o.textContent = d;
      deptSel.appendChild(o);
    });

    const phoneInput = document.getElementById('filterPhone');
    const counter = document.getElementById('phoneCounter');
    phoneInput.addEventListener('input', () => {
      counter.textContent = `${phoneInput.value.length}/11`;
    });
  }

  function applyFilter() {
    const emp = document.getElementById('filterEmp').value;
    const phone = document.getElementById('filterPhone').value.trim();
    const dept = document.getElementById('filterDept').value;

    filteredRecords = TASK_RECORDS.filter((r) => {
      if (emp && r.employee !== emp) return false;
      if (dept && r.department !== dept) return false;
      if (phone && !r.phone.includes(phone)) return false;
      return true;
    });
    bindRecordsTable();
  }

  function init() {
    if (typeof ensureMomentTasksSynced === 'function') ensureMomentTasksSynced();
    const moment = findMoment(type, send, id);
    if (!moment) {
      document.getElementById('detailRoot').innerHTML =
        '<p style="padding:40px;color:#909399">未找到该朋友圈记录，<a href="index.html">返回列表</a></p>';
      return;
    }

    renderMoment(moment);
    initFilters();
    bindRecordsTable();

    document.getElementById('btnRecordSearch').addEventListener('click', () => {
      applyFilter();
      showToast('已按条件筛选任务记录');
    });

    document.getElementById('btnRecordClear').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('filterEmp').value = '';
      document.getElementById('filterPhone').value = '';
      document.getElementById('filterDept').value = '';
      document.getElementById('phoneCounter').textContent = '0/11';
      filteredRecords = [...TASK_RECORDS];
      bindRecordsTable();
      showToast('已清空搜索条件');
    });

    document.getElementById('btnExport').addEventListener('click', () => {
      showToast('正在导出 Excel（原型演示）');
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOk').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
