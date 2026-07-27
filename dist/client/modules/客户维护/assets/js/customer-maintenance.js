/**
 * 客户维护分析
 */
(function () {
  const meta = CustomerMaintenanceMeta;
  const data = CustomerMaintenanceData;
  let chartMetric = 'newContactCnt';
  let filteredEmployees = [...data.employees];
  let page = 1;
  let pageSize = 10;

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

  function metricClass(key, val) {
    if (key === 'replyPercentage') {
      if (val >= 80) return 'good';
      if (val < 65) return 'warn';
    }
    if (key === 'avgReplyTime') {
      if (val <= 15) return 'good';
      if (val >= 25) return 'warn';
    }
    if (key === 'negativeFeedbackCnt' && val >= 2) return 'danger';
    return '';
  }

  function formatMetricValue(key, val) {
    if (key === 'replyPercentage') return formatPercent(val);
    if (key === 'avgReplyTime') return formatReplyTime(val);
    return val ?? '—';
  }

  function renderSummary() {
    document.getElementById('summaryCards').innerHTML = meta.metrics
      .map((m) => {
        const val = data.summary[m.key];
        const cls = metricClass(m.key, val);
        return `
        <div class="cm-stat">
          <div class="cm-stat-head">
            <span class="cm-stat-label">${escapeHtmlCm(m.label)}</span>
            <span class="cm-stat-tip" title="${escapeHtmlCm(m.tip)}">?</span>
          </div>
          <div class="cm-stat-value ${cls}">${formatMetricValue(m.key, val)}</div>
        </div>`;
      })
      .join('');
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  }

  function getPageSlice() {
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }

  function renderPagination() {
    const totalPages = getTotalPages();
    if (page > totalPages) page = totalPages;

    document.getElementById('tableTotal').textContent = filteredEmployees.length;

    const container = document.getElementById('pageBtns');
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('…');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }

    container.innerHTML = `
      <button type="button" id="btnPagePrev" ${page <= 1 ? 'disabled' : ''}>‹</button>
      ${pages
        .map((p) =>
          p === '…'
            ? '<span class="page-ellipsis">…</span>'
            : `<button type="button" class="${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`
        )
        .join('')}
      <button type="button" id="btnPageNext" ${page >= totalPages ? 'disabled' : ''}>›</button>`;

    document.getElementById('btnPagePrev').addEventListener('click', () => goToPage(page - 1));
    document.getElementById('btnPageNext').addEventListener('click', () => goToPage(page + 1));
    container.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => goToPage(parseInt(btn.dataset.page, 10)));
    });
  }

  function goToPage(p) {
    page = Math.min(Math.max(1, p), getTotalPages());
    renderTableBody();
    renderPagination();
  }

  function renderTableBody() {
    const list = getPageSlice();
    document.getElementById('empTableBody').innerHTML = list
      .map((emp) => {
        const t = emp.totals;
        const replyCls = metricClass('replyPercentage', t.replyPercentage);
        const timeCls = metricClass('avgReplyTime', t.avgReplyTime);
        const lossCls = metricClass('negativeFeedbackCnt', t.negativeFeedbackCnt);
        return `
      <tr>
        <td>
          <div class="cm-staff-cell">
            <span class="cm-staff-avatar">${escapeHtmlCm(emp.name.charAt(0))}</span>
            <div>
              <div>${escapeHtmlCm(emp.name)}</div>
              <div style="font-size:12px;color:var(--text-placeholder)">${emp.phone}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtmlCm(emp.dept)}</td>
        <td class="cm-num">${t.newApplyCnt}</td>
        <td class="cm-num good">${t.newContactCnt}</td>
        <td class="cm-num">${t.chatCnt}</td>
        <td class="cm-num">${t.messageCnt}</td>
        <td class="cm-num ${replyCls}">${formatPercent(t.replyPercentage)}</td>
        <td class="cm-num ${timeCls}">${formatReplyTime(t.avgReplyTime)}</td>
        <td class="cm-num ${lossCls}">${t.negativeFeedbackCnt}</td>
        <td class="mass-actions"><a href="#" data-detail="${emp.userid}">每日明细</a></td>
      </tr>`;
      })
      .join('');

    document.querySelectorAll('[data-detail]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const emp = data.employees.find((x) => x.userid === a.dataset.detail);
        if (!emp) return;
        showEmployeeDetail(emp);
      });
    });
  }

  function renderTable() {
    document.getElementById('empTotal').textContent = filteredEmployees.length;
    renderTableBody();
    renderPagination();
  }

  function showEmployeeDetail(emp) {
    const rows = emp.daily.length
      ? emp.daily
          .map(
            (d) => `
        <tr>
          <td>${d.statDate}</td>
          <td class="cm-num">${d.newApplyCnt}</td>
          <td class="cm-num">${d.newContactCnt}</td>
          <td class="cm-num">${d.chatCnt}</td>
          <td class="cm-num">${d.messageCnt}</td>
          <td class="cm-num">${formatPercent(d.replyPercentage)}</td>
          <td class="cm-num">${formatReplyTime(d.avgReplyTime)}</td>
          <td class="cm-num">${d.negativeFeedbackCnt}</td>
        </tr>`
          )
          .join('')
      : '<tr><td colspan="8" style="text-align:center;color:var(--text-placeholder);padding:24px">所选日期范围内暂无逐日明细</td></tr>';

    openModal(
      `${emp.name} · 每日维护明细`,
      `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6">按天查看该员工在企业微信里维护客户的情况。数据通常次日更新。</p>
      <div class="table-wrap">
        <table class="cm-detail-table">
          <thead>
            <tr>
              <th>日期</th><th>主动加好友</th><th>新增客户</th><th>聊天客户数</th>
              <th>发出消息数</th><th>咨询回复率</th><th>平均回复时长</th><th>被删/拉黑</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
    );
  }

  function showMetricHelp() {
    openModal(
      '指标说明',
      `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.65">以下数据来自企业微信对员工「联系客户」行为的按日统计，帮助管理者了解员工是否在积极维护客户。</p>
      <ul style="font-size:13px;color:var(--text-secondary);line-height:1.85;padding-left:18px">
        ${meta.metrics.map((m) => `<li><strong style="color:var(--text)">${escapeHtmlCm(m.label)}</strong>：${escapeHtmlCm(m.tip)}</li>`).join('')}
      </ul>
      <p style="font-size:12px;color:var(--text-placeholder);margin-top:14px">说明：不含群聊数据；回复率与回复时长仅在客户主动发起聊天的场景下统计。</p>`
    );
  }

  function drawChart(metric) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const pad = { t: 24, r: 24, b: 40, l: 48 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const points = data.trend;
    const values = points.map((p) => p[metric]);
    const maxVal = Math.max(...values, 1) * 1.15;
    const mInfo = meta.metrics.find((m) => m.key === metric);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#e5e6eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
      const labelVal = maxVal * (1 - i / 4);
      ctx.fillStyle = '#bbbfc4';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      const display =
        metric === 'replyPercentage'
          ? `${Math.round(labelVal)}%`
          : metric === 'avgReplyTime'
            ? `${Math.round(labelVal)}分`
            : Math.round(labelVal);
      ctx.fillText(display, pad.l - 8, y + 4);
    }

    const stepX = chartW / Math.max(points.length - 1, 1);
    ctx.strokeStyle = '#00b578';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = pad.l + stepX * i;
      const y = pad.t + chartH * (1 - p[metric] / maxVal);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((p, i) => {
      const x = pad.l + stepX * i;
      const y = pad.t + chartH * (1 - p[metric] / maxVal);
      ctx.fillStyle = '#00b578';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#646a73';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.date, x, h - 14);
    });

    ctx.fillStyle = '#646a73';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(mInfo ? mInfo.label : '', pad.l, 16);
  }

  function getDateRangeLabel() {
    const start = document.getElementById('filterStart').value;
    const end = document.getElementById('filterEnd').value;
    if (start && end) return `${start}_${end}`;
    return '全部日期';
  }

  function csvCell(val) {
    const s = val == null ? '' : String(val);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportEmployees() {
    if (!filteredEmployees.length) {
      showToast('当前没有可导出的数据');
      return;
    }

    const headers = [
      '员工姓名',
      '手机号',
      '部门',
      '主动加好友',
      '新增客户',
      '聊天客户数',
      '发出消息数',
      '咨询回复率',
      '平均回复时长',
      '被删/拉黑',
    ];

    const rows = filteredEmployees.map((emp) => {
      const t = emp.totals;
      return [
        emp.name,
        emp.phone,
        emp.dept,
        t.newApplyCnt,
        t.newContactCnt,
        t.chatCnt,
        t.messageCnt,
        formatPercent(t.replyPercentage),
        formatReplyTime(t.avgReplyTime),
        t.negativeFeedbackCnt,
      ];
    });

    const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `员工维护明细_${getDateRangeLabel()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${filteredEmployees.length} 条员工数据`);
  }

  function applyFilters() {
    const dept = document.getElementById('filterDept').value.trim();
    const name = document.getElementById('filterName').value.trim();
    const sortKey = document.getElementById('filterSort').value;

    filteredEmployees = data.employees.filter((e) => {
      if (dept && e.dept !== dept) return false;
      if (name && !e.name.includes(name)) return false;
      return true;
    });

    filteredEmployees.sort((a, b) => {
      const av = a.totals[sortKey];
      const bv = b.totals[sortKey];
      if (sortKey === 'avgReplyTime') return av - bv;
      return bv - av;
    });

    page = 1;
    renderTable();
  }

  function init() {
    document.getElementById('cmIntro').textContent = meta.intro;
    document.getElementById('cmUpdateTime').textContent = meta.updateTime;

    renderSummary();
    renderTable();
    drawChart(chartMetric);

    document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10) || 10;
      page = 1;
      renderTable();
    });

    document.getElementById('btnQuery').addEventListener('click', () => {
      applyFilters();
      showToast('已按条件更新');
    });
    document.getElementById('btnReset').addEventListener('click', () => {
      document.getElementById('filterDept').value = '';
      document.getElementById('filterName').value = '';
      document.getElementById('filterSort').value = 'newContactCnt';
      filteredEmployees = [...data.employees];
      page = 1;
      renderTable();
      showToast('已重置筛选');
    });
    document.getElementById('btnRefresh').addEventListener('click', () => showToast('已从企业微信拉取最新数据'));
    document.getElementById('btnExport').addEventListener('click', () => exportEmployees());
    document.getElementById('btnExportEmp').addEventListener('click', () => exportEmployees());
    document.getElementById('btnHelp').addEventListener('click', (e) => {
      e.preventDefault();
      showMetricHelp();
    });

    document.querySelectorAll('.cm-chart-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        chartMetric = tab.dataset.metric;
        document.querySelectorAll('.cm-chart-tab').forEach((t) => t.classList.toggle('active', t === tab));
        drawChart(chartMetric);
      });
    });

    window.addEventListener('resize', () => drawChart(chartMetric));

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOk').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
