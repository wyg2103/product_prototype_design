/**
 * 任务下发情况 + 执行数据
 */
(function () {
  let ctx = null;

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

  function healthIcon(health) {
    const map = { normal: '✓', partial: '!', abnormal: '×', fail: '×', pending: '…' };
    return map[health] || '?';
  }

  function renderHeader() {
    const { task, detail } = ctx;
    const statusCls = task.status === 'completed' ? 'done' : task.status === 'running' ? 'running' : 'scheduled';
    document.getElementById('pageTabTitle').innerHTML = `${escapeHtmlMass(task.name)} · 下发情况 <span class="close">×</span>`;
    document.getElementById('taskHeader').innerHTML = `
      <div class="task-header-main">
        <a href="mass-send.html" class="task-back">← 返回列表</a>
        <h1 class="task-title">${escapeHtmlMass(task.name)}</h1>
        <p class="task-meta">
          <span class="status-tag ${statusCls}">${escapeHtmlMass(task.statusLabel)}</span>
          <span class="health-pill ${detail.health}">${escapeHtmlMass(detail.healthLabel)}</span>
          <span>所属：${escapeHtmlMass(task.staff)}</span>
          <span>发送时间：${escapeHtmlMass(task.sendTime)}</span>
        </p>
      </div>
      <div class="task-header-actions">
        <button type="button" class="btn-outline" id="btnHeaderSync">刷新数据</button>
        ${task.status === 'running' ? '<button type="button" class="btn-outline" id="btnHeaderRemind">提醒发送</button>' : ''}
        <a href="mass-send-guide.html${detail.recommendedScene ? '?scene=' + detail.recommendedScene : ''}" class="btn-primary" id="btnHeaderGuide">如何自查</a>
      </div>`;

    document.getElementById('btnHeaderSync')?.addEventListener('click', () => showToast('已从企业微信拉取最新数据'));
    document.getElementById('btnHeaderRemind')?.addEventListener('click', () => {
      const left = 3 - (task.remindCount || 0);
      showToast(left > 0 ? `已提醒员工发送（还可提醒 ${left} 次）` : '24 小时内最多提醒 3 次，请让员工手动发送');
    });
  }

  function renderHealthBanner() {
    const { detail } = ctx;
    const guideHref = detail.recommendedScene
      ? `mass-send-guide.html?scene=${detail.recommendedScene}`
      : 'mass-send-guide.html';

    document.getElementById('healthBanner').className = `health-banner health-${detail.health}`;
    document.getElementById('healthBanner').innerHTML = `
      <div class="health-banner-icon">${healthIcon(detail.health)}</div>
      <div class="health-banner-body">
        <div class="health-banner-title">${escapeHtmlMass(detail.healthLabel)}</div>
        <p class="health-banner-summary">${escapeHtmlMass(detail.healthSummary)}</p>
        ${
          detail.health === 'normal'
            ? '<p class="health-banner-tip">当前任务下发与执行均正常，可在「执行数据」查看明细。</p>'
            : `<div class="health-banner-actions">
                <a href="${guideHref}" class="btn-primary btn-sm">按步骤自查</a>
                <button type="button" class="btn-outline btn-sm" data-switch="stats">查看执行数据</button>
              </div>`
        }
      </div>`;

    document.querySelector('[data-switch="stats"]')?.addEventListener('click', () => switchPanel('stats'));
  }

  function renderIssues() {
    const { detail } = ctx;
    const section = document.getElementById('issuesSection');
    const list = document.getElementById('issueList');
    const guideLink = document.getElementById('guideLink');

    if (!detail.issues || detail.issues.length === 0) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');
    if (detail.recommendedScene) {
      guideLink.href = `mass-send-guide.html?scene=${detail.recommendedScene}`;
    }

    const levelLabel = { fail: '需处理', warn: '需关注', ok: '正常' };
    list.innerHTML = detail.issues
      .map(
        (issue) => `
      <article class="issue-card ${issue.level}">
        <div class="issue-card-head">
          <span class="issue-level">${levelLabel[issue.level] || '提示'}</span>
          <h4 class="issue-title">${escapeHtmlMass(issue.title)}</h4>
          ${issue.related ? `<span class="issue-related">${escapeHtmlMass(issue.related)}</span>` : ''}
        </div>
        <p class="issue-plain">${escapeHtmlMass(issue.plain)}</p>
        <div class="issue-fix">
          <strong>建议处理</strong>
          <p>${escapeHtmlMass(issue.fix)}</p>
        </div>
        ${
          issue.scene
            ? `<a href="mass-send-guide.html?scene=${issue.scene}" class="issue-guide-link">查看详细排查步骤 →</a>`
            : ''
        }
      </article>`
      )
      .join('');
  }

  function renderPipeline() {
    const { detail } = ctx;
    const icons = { ok: '✓', warn: '!', fail: '×', pending: '…' };
    document.getElementById('syncMeta').textContent = `数据更新于 ${detail.apiSyncTime || detail.updateTime || '—'}`;
    document.getElementById('pipeline').innerHTML = detail.pipeline
      .map(
        (p) => `
      <div class="pipeline-item">
        <span class="pipeline-dot ${p.status}">${icons[p.status] || '·'}</span>
        <div class="pipeline-body">
          <div class="pipeline-label">${escapeHtmlMass(p.label)}</div>
          <div class="pipeline-detail">${escapeHtmlMass(p.detail)}</div>
          ${p.time && p.time !== '—' ? `<div class="pipeline-time">${escapeHtmlMass(p.time)}</div>` : ''}
        </div>
      </div>`
      )
      .join('');
  }

  function renderChecks() {
    const { detail } = ctx;
    const icons = { ok: '✓', warn: '⚠', fail: '×' };
    document.getElementById('checkCards').innerHTML = (detail.checks || [])
      .map(
        (c) => `
      <div class="diagnose-card ${c.level}">
        <span class="diagnose-card-icon">${icons[c.level]}</span>
        <div>
          <div class="diagnose-card-title">${escapeHtmlMass(c.title)}</div>
          <div class="diagnose-card-desc">${escapeHtmlMass(c.desc)}</div>
        </div>
      </div>`
      )
      .join('') || '<p class="section-hint">暂无检查项</p>';
  }

  function renderSummary() {
    const { detail } = ctx;
    document.getElementById('statsUpdateTime').textContent = detail.updateTime || '—';
    const b = detail.summary.unreachedBreakdown;
    document.getElementById('statsCards').innerHTML = `
      <div class="stat-card"><div class="label">已执行员工</div><div class="value">${detail.summary.executedStaff}</div></div>
      <div class="stat-card"><div class="label">未执行员工</div><div class="value">${detail.summary.unexecutedStaff}</div></div>
      <div class="stat-card"><div class="label">已送达客户</div><div class="value">${detail.summary.reachedCustomers}</div></div>
      <div class="stat-card">
        <div class="label">未送达客户</div>
        <div class="value">${detail.summary.unreachedTotal}</div>
        <div class="sub">非好友 ${b.notFriend} · 达上限 ${b.limitReached} · 员工未执行 ${b.staffNotExec}</div>
      </div>`;
  }

  function renderEmployees(list) {
    const tbody = document.getElementById('empTableBody');
    const empty = document.getElementById('empEmpty');
    if (!list.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    tbody.innerHTML = list
      .map(
        (e) => `
      <tr>
        <td>${escapeHtmlMass(e.name)}</td>
        <td>${e.phone}</td>
        <td>${escapeHtmlMass(e.dept)}</td>
        <td><span class="status-tag ${e.taskStatus === 2 ? 'done' : 'running'}">${escapeHtmlMass(e.taskStatusLabel)}</span>
          ${e.issue ? `<div class="issue-tag">${escapeHtmlMass(e.issue)}</div>` : ''}</td>
        <td class="${e.inAppScope ? 'scope-yes' : 'scope-no'}">${e.inAppScope ? '可以' : '不可以'}</td>
        <td>${escapeHtmlMass(e.clientVersion)}${parseFloat(e.clientVersion) < 2.75 ? ' ⚠' : ''}</td>
        <td>${e.deliverTime}</td>
        <td>${e.execTime}</td>
        <td>${e.reached} / ${e.unreached}</td>
        <td>${e.remindCount ?? 0}/3</td>
        <td class="mass-actions">
          ${e.taskStatus === 0 && e.inAppScope ? `<a href="#" data-remind="${e.userid}">提醒</a>` : ''}
          <a href="#" data-detail="${e.userid}">详情</a>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('[data-remind]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('已提醒该员工发送');
      });
    });
    tbody.querySelectorAll('[data-detail]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const emp = ctx.detail.employees.find((x) => x.userid === a.dataset.detail);
        if (!emp) return;
        openModal(
          `员工 - ${emp.name}`,
          `<div class="detail-row"><label>任务状态</label><span>${escapeHtmlMass(emp.taskStatusLabel)}</span></div>
          <div class="detail-row"><label>能否收到任务</label><span>${emp.inAppScope ? '可以 — 系统会给他推送待发送任务' : '不可以 — 这是收不到任务的常见原因，请联系管理员开通使用权限'}</span></div>
          <div class="detail-row"><label>企业微信版本</label><span>${escapeHtmlMass(emp.clientVersion)}${parseFloat(emp.clientVersion) < 2.75 ? '（版本偏低，建议更新）' : ''}</span></div>
          ${emp.issue ? `<p class="issue-tag" style="margin-top:12px">${escapeHtmlMass(emp.issue)}</p>` : ''}
          ${!emp.inAppScope ? '<p style="margin-top:12px"><a href="mass-send-guide.html?scene=staff-no-task">查看「员工收不到任务」排查步骤 →</a></p>' : ''}`
        );
      });
    });
  }

  function renderCustomers() {
    const list = ctx.detail.customers || [];
    const tbody = document.getElementById('customerTableBody');
    const empty = document.getElementById('customerEmpty');
    if (!list.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      document.getElementById('customerTotal').textContent = '0';
      return;
    }
    empty.classList.add('hidden');
    tbody.innerHTML = list
      .map(
        (c) => `
      <tr>
        <td>${escapeHtmlMass(c.name)}</td>
        <td>${c.phone}</td>
        <td>${escapeHtmlMass(c.owner)}</td>
        <td>${escapeHtmlMass(c.sender)}</td>
        <td class="${c.status === '发送成功' ? 'status-success' : 'status-fail'}">${c.status}</td>
        <td>${escapeHtmlMass(c.failReason)}</td>
        <td>${c.sendTime}</td>
      </tr>`
      )
      .join('');
    document.getElementById('customerTotal').textContent = list.length;
  }

  function drawLineChart(canvasId, value, maxVal) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const c = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    c.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const pad = { t: 20, r: 20, b: 36, l: 40 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#fafbfc';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#e5e6eb';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (chartH / 4) * i;
      c.beginPath();
      c.moveTo(pad.l, y);
      c.lineTo(w - pad.r, y);
      c.stroke();
    }
    const point = ctx.detail.chartPoints[0] || { time: '—', staff: 0, customers: 0 };
    const x = pad.l + chartW * 0.65;
    const y = pad.t + chartH * (1 - value / maxVal);
    c.strokeStyle = '#00b578';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(pad.l, y);
    c.lineTo(x, y);
    c.stroke();
    c.fillStyle = '#00b578';
    c.beginPath();
    c.arc(x, y, 5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#646a73';
    c.font = '11px sans-serif';
    c.textAlign = 'center';
    c.fillText(point.time, x, h - 12);
  }

  function switchPanel(name) {
    document.querySelectorAll('.task-main-tab').forEach((t) => t.classList.toggle('active', t.dataset.panel === name));
    document.querySelectorAll('.task-panel').forEach((p) => p.classList.toggle('active', p.id === (name === 'delivery' ? 'panelDelivery' : 'panelStats')));
  }

  function renderAll() {
    renderHeader();
    renderHealthBanner();
    renderIssues();
    renderPipeline();
    renderChecks();
    renderSummary();
    renderEmployees(ctx.detail.employees.filter((e) => e.status === '已执行'));
    renderCustomers();
    const pt = ctx.detail.chartPoints[0] || { staff: 0, customers: 0 };
    drawLineChart('chartStaff', pt.staff, 1);
    drawLineChart('chartCustomer', pt.customers, Math.max(pt.customers, 4));
  }

  function init() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || '1';
    ctx = getMassSendTaskDetail(id);

    if (!ctx) {
      document.querySelector('.task-detail-scroll').innerHTML =
        '<div class="task-not-found"><h2>未找到该任务</h2><p><a href="mass-send.html">返回群发列表</a></p></div>';
      return;
    }

    if (params.get('tab') === 'stats') {
      switchPanel('stats');
    }

    renderAll();

    document.querySelectorAll('.task-main-tab').forEach((tab) => {
      tab.addEventListener('click', () => switchPanel(tab.dataset.panel));
    });

    document.getElementById('btnResync').addEventListener('click', () => showToast('已从企业微信拉取最新数据'));

    document.querySelectorAll('.chart-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach((t) => t.classList.toggle('active', t === tab));
        showToast(tab.dataset.chart === 'day' ? '已切换为按天查看' : '已切换为按时段查看');
      });
    });

    document.querySelectorAll('.inner-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.inner-tab').forEach((t) => t.classList.toggle('active', t === tab));
        if (tab.dataset.emp === 'unexecuted') {
          renderEmployees(ctx.detail.employees.filter((e) => e.status === '未执行'));
        } else {
          renderEmployees(ctx.detail.employees.filter((e) => e.status === '已执行'));
        }
      });
    });

    document.getElementById('btnExportEmp').addEventListener('click', () => showToast('正在导出员工数据'));
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOk').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
