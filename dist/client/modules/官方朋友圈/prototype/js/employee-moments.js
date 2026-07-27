/**
 * 企微客户端朋友圈任务
 * 个人发表：消息「企迈企微助手」→ 点击查看 → 任务详情 → 发送朋友圈 → 发表（无二次确认）
 * 企业发表：消息「客户朋友圈」→ 我发表的 / 待你发表
 */
const EmployeeMoments = (function () {
  function escapeHtml(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function showToast(msg) {
    const el = document.getElementById('empToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2000);
  }

  function contentText(task) {
    return (task.content || '').replace(/^\[链接\]\s*/, '');
  }

  function titleOf(task) {
    return task.taskName || contentText(task).slice(0, 20) || '朋友圈任务';
  }

  function attachLabel(task) {
    if (task.type === '链接' || task.url) return '渠道活码';
    if (task.type === '图片' || task.image) return '图片素材';
    return '官方素材';
  }

  function personalTodos() {
    return listEmployeeMomentTasks().filter((t) => t._type === 'personal' && t._empStatus === 'todo');
  }

  function personalAll() {
    return listEmployeeMomentTasks().filter((t) => t._type === 'personal');
  }

  function enterpriseTodos() {
    return listEmployeeMomentTasks().filter((t) => t._type === 'enterprise' && t._empStatus === 'todo');
  }

  function formatChatTime(value) {
    if (!value) return '';
    const m = String(value).match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (!m) return value;
    return `${Number(m[2])}月${Number(m[3])}日 ${m[4]}:${m[5]}`;
  }

  function publishUrl(task) {
    return `employee-moment-publish.html?type=${encodeURIComponent(task._type)}&send=${encodeURIComponent(task._send)}&id=${encodeURIComponent(task.id)}`;
  }

  /* ---------- 消息列表 ---------- */
  function initMessages() {
    const personal = personalTodos();
    const enterprise = enterpriseTodos();

    const assistantBadge = document.getElementById('assistantBadge');
    const assistantPreview = document.getElementById('assistantPreview');
    const count = Math.max(personal.length, 1);
    if (assistantBadge) {
      const n = personal.length || 0;
      assistantBadge.hidden = n === 0;
      assistantBadge.textContent = String(n || 5);
      if (n === 0) {
        assistantBadge.hidden = false;
        assistantBadge.textContent = '1';
      }
    }
    if (assistantPreview) {
      assistantPreview.textContent = personal.length
        ? `【待发朋友圈任务】你有一条朋友圈任务待完成哦！`
        : `【营销任务】亲，企业管理员有给你发布...`;
    }

    const momentsBadge = document.getElementById('momentsBadge');
    const momentsPreview = document.getElementById('momentsPreview');
    if (enterprise.length > 0) {
      momentsBadge.hidden = false;
      momentsBadge.textContent = String(enterprise.length);
      momentsPreview.textContent = '管理员通知你发表内容到客户的朋友圈';
    } else {
      momentsBadge.hidden = true;
      momentsPreview.textContent = '暂无待发表内容';
    }
  }

  function openBlockDialog(title, descHtml, onOk) {
    const mask = document.getElementById('blockMask');
    const dialog = document.getElementById('blockDialog');
    const titleEl = document.getElementById('blockTitle');
    const descEl = document.getElementById('blockDesc');
    const okBtn = document.getElementById('blockOk');
    if (!mask || !dialog) {
      showToast(title);
      return;
    }
    titleEl.textContent = title;
    descEl.innerHTML = descHtml;
    mask.classList.add('show');
    dialog.classList.add('show');
    const close = () => {
      mask.classList.remove('show');
      dialog.classList.remove('show');
      okBtn.onclick = null;
      if (typeof onOk === 'function') onOk();
    };
    okBtn.onclick = close;
    mask.onclick = close;
  }

  function stoppedDesc(task) {
    const reason = task._stopReason || (typeof getStopReason === 'function' ? getStopReason(task) : null);
    const reasonText =
      reason === 'expired' ? '已到达计划终止时间，任务自动终止' : '已被管理员手动终止';
    const when = typeof getStopDisplayTime === 'function' ? getStopDisplayTime(task) : task.stoppedAt || task.terminateTime;
    const planned =
      task.terminateTime && task.stoppedAt && task.terminateTime !== task.stoppedAt
        ? `<li>计划终止时间：${escapeHtml(task.terminateTime)}</li>`
        : '';
    return `
      <ul>
        <li>任务「${escapeHtml(titleOf(task))}」${reasonText}</li>
        <li>实际终止时间：${escapeHtml(when || '-')}</li>
        ${planned}
        <li>未执行员工不可再发表或补发</li>
        <li>已成功发表的内容不受影响（已发表不可撤回）</li>
      </ul>`;
  }

  /* ---------- 助手会话 ---------- */
  function initAssistant() {
    const todos = personalTodos();
    const stopped = personalAll().filter((t) => t._empStatus === 'expired').slice(0, 2);
    const scroll = document.getElementById('chatScroll');
    const cards = todos.length ? todos.slice(0, 4) : [];

    let html = '';
    if (!cards.length) {
      html += `<div class="chat-time">刚刚</div>
        <div class="chat-row">
          <div class="chat-avatar"></div>
          <div class="chat-card">
            <div class="chat-card-title">【待发朋友圈任务】</div>
            <div class="chat-card-body" style="margin-top:8px">当前没有待完成的朋友圈任务。管理员发布后会在此提醒你。
              <div style="margin-top:8px"><a class="chat-link" href="employee-task-list.html">查看任务列表</a></div>
            </div>
          </div>
        </div>`;
    }

    cards.forEach((t, idx) => {
      const name = titleOf(t);
      const time = formatChatTime(t.publishTime || t.time);
      if (idx > 0 || !cards.length) html += `<div class="chat-time">${escapeHtml(time || '今天')}</div>`;
      else if (idx === 0) html += `<div class="chat-time">${escapeHtml(time || '今天')}</div>`;
      html += `
        <div class="chat-row">
          <div class="chat-avatar"></div>
          <div class="chat-card">
            <div class="chat-card-head">
              <div class="chat-card-title">【待发朋友圈任务】</div>
              ${idx === 0 ? `<span class="chat-new">⌃ ${todos.length}条新消息</span>` : ''}
            </div>
            <div class="chat-card-body">
              你有一条朋友圈任务待完成哦！请打开“点击查看”前往总部分享的素材，点击“发送朋友圈”即可进行发送操作。
              <div class="name">任务名称：${escapeHtml(name)}</div>
              请尽快完成哦！
              <div style="margin-top:8px">
                <a class="chat-link" href="employee-task-list.html?focus=${encodeURIComponent(t.id)}">点击查看</a>
              </div>
            </div>
          </div>
        </div>`;
    });

    stopped.forEach((t) => {
      const reason = t._stopReason || (typeof getStopReason === 'function' ? getStopReason(t) : null);
      const reasonShort = reason === 'expired' ? '已到终止时间自动终止' : '已被管理员终止';
      const when =
        typeof getStopDisplayTime === 'function' ? getStopDisplayTime(t) : t.stoppedAt || t.terminateTime;
      html += `
        <div class="chat-time">${escapeHtml(formatChatTime(when || t.time))}</div>
        <div class="chat-row">
          <div class="chat-avatar"></div>
          <div class="chat-card stopped">
            <div class="chat-card-title">【任务已终止】</div>
            <div class="chat-card-body" style="margin-top:8px">
              任务「${escapeHtml(titleOf(t))}」${reasonShort}，无需再执行。
              <div class="chat-stopped-tag">已终止 · ${escapeHtml(when || '-')}</div>
              <div style="margin-top:8px">
                <a class="chat-link" href="employee-task-list.html?filter=stopped">查看已终止任务</a>
              </div>
            </div>
          </div>
        </div>`;
    });

    html += `
      <div class="chat-time">昨天 10:40</div>
      <div class="chat-row">
        <div class="chat-avatar"></div>
        <div class="chat-card">
          <div class="chat-card-head">
            <div class="chat-card-title">【营销任务】</div>
          </div>
          <div class="chat-card-body">
            亲，企业管理员有给你发布一条营销任务，需要你确认并发送哦！请前往聊天侧边栏-任务中心查看详情
          </div>
        </div>
      </div>`;

    scroll.innerHTML = html;
  }

  /* ---------- 任务详情列表 ---------- */
  let taskFilter = 'todo';

  function statusLabel(task) {
    if (task._empStatus === 'done') return ['done', '已发送'];
    if (task._empStatus === 'expired') return ['stopped', '已终止'];
    return ['todo', '待发送'];
  }

  function updateFilterCounts(all) {
    const todo = all.filter((t) => t._empStatus === 'todo').length;
    const stopped = all.filter((t) => t._empStatus === 'expired').length;
    const elTodo = document.getElementById('cntTodo');
    const elStopped = document.getElementById('cntStopped');
    const elAll = document.getElementById('cntAll');
    if (elTodo) elTodo.textContent = String(todo);
    if (elStopped) elStopped.textContent = String(stopped);
    if (elAll) elAll.textContent = String(all.length);
  }

  function renderTaskList(keyword) {
    const box = document.getElementById('taskList');
    const all = personalAll().filter(
      (t) => t._empStatus === 'todo' || t._empStatus === 'done' || t._empStatus === 'expired'
    );
    updateFilterCounts(all);

    let rows = all;
    if (taskFilter === 'todo') rows = all.filter((t) => t._empStatus === 'todo');
    else if (taskFilter === 'stopped') rows = all.filter((t) => t._empStatus === 'expired');

    const kw = (keyword || '').trim();
    if (kw) {
      rows = rows.filter((t) => titleOf(t).includes(kw) || contentText(t).includes(kw));
    }

    if (!rows.length) {
      box.innerHTML = `
        <div class="task-empty">
          <div class="illus">∅</div>
          ${taskFilter === 'stopped' ? '暂无已终止任务' : '暂无待发送任务'}<br>
          <span style="font-size:12px;color:#bbb">可切换上方筛选查看其他状态</span>
        </div>`;
      return;
    }

    box.innerHTML = rows
      .map((t) => {
        const [cls, label] = statusLabel(t);
        const stopped = t._empStatus === 'expired';
        let btn = '';
        if (t._empStatus === 'todo') {
          btn = `<a class="task-send-btn" href="${publishUrl(t)}">发送朋友圈</a>`;
        } else if (stopped) {
          btn = `<button type="button" class="task-send-btn disabled" data-act="stopped" data-type="${escapeHtml(t._type)}" data-send="${escapeHtml(t._send)}" data-id="${escapeHtml(t.id)}">已终止</button>`;
        } else {
          btn = `<button type="button" class="task-send-btn disabled" disabled>已发送</button>`;
        }
        const tip = stopped
          ? `<div class="task-tip-line danger">${
              (t._stopReason || (typeof getStopReason === 'function' && getStopReason(t))) === 'expired'
                ? '已到终止时间'
                : '管理员已终止'
            } · ${escapeHtml(
              (typeof getStopDisplayTime === 'function' ? getStopDisplayTime(t) : t.stoppedAt || t.terminateTime) || '-'
            )} · 不可再发表</div>`
          : t.terminateTime
            ? `<div class="task-tip-line">请于 ${escapeHtml(t.terminateTime)} 前完成发表</div>`
            : '';
        return `
        <div class="task-card ${stopped ? 'stopped' : ''}" data-id="${escapeHtml(t.id)}">
          <div class="task-card-top">
            <div class="task-card-name">${escapeHtml(titleOf(t))}</div>
            <span class="task-tag">朋友圈</span>
            <span class="task-status ${cls}">${label}</span>
          </div>
          <div class="task-content">${escapeHtml(contentText(t))}</div>
          <div class="task-attach">
            <span>${escapeHtml(attachLabel(t))}</span>
            <svg class="link-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          </div>
          <div class="task-foot">
            <div class="task-time">任务接收时间：${escapeHtml(t.publishTime || t.time || '-')}${tip}</div>
            ${btn}
          </div>
        </div>`;
      })
      .join('');

    box.querySelectorAll('[data-act="stopped"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const task = findEmployeeMoment(btn.dataset.type, btn.dataset.send, btn.dataset.id);
        if (!task) return;
        openBlockDialog('任务已终止，无法发表', stoppedDesc(task));
      });
    });
  }

  function initTaskList() {
    const q = new URLSearchParams(location.search);
    if (q.get('filter') === 'stopped') taskFilter = 'stopped';
    else if (q.get('filter') === 'all') taskFilter = 'all';

    document.querySelectorAll('#taskFilters .task-filter').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === taskFilter);
      btn.addEventListener('click', () => {
        taskFilter = btn.dataset.filter;
        document.querySelectorAll('#taskFilters .task-filter').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        renderTaskList(document.getElementById('taskSearch').value);
      });
    });

    renderTaskList('');
    const input = document.getElementById('taskSearch');
    input.addEventListener('input', () => renderTaskList(input.value));

    const focusId = q.get('focus');
    if (focusId) {
      setTimeout(() => {
        const card = [...document.querySelectorAll('.task-card')].find(
          (el) => el.dataset.id === focusId
        );
        if (card) {
          card.style.boxShadow = '0 0 0 2px rgba(61,126,255,0.35)';
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
    }
  }

  /* ---------- 发表页（直接发表；终止态拦截） ---------- */
  function renderBlockedPublish(task) {
    document.getElementById('publishBottom').style.display = 'none';
    document.getElementById('btnSimStop').hidden = true;
    const reason = task._stopReason || (typeof getStopReason === 'function' ? getStopReason(task) : null);
    const reasonText =
      reason === 'expired'
        ? '已到达计划终止时间，任务自动终止，员工端无法再发表或补发。'
        : '管理员已终止该任务，员工端无法再发表或补发。';
    const when =
      typeof getStopDisplayTime === 'function' ? getStopDisplayTime(task) : task.stoppedAt || task.terminateTime;
    document.getElementById('publishBody').innerHTML = `
      <div class="publish-blocked">
        <div class="block-icon">!</div>
        <h2>任务已终止</h2>
        <p>${reasonText}</p>
        <div class="meta-box">
          <div><b>任务名称：</b>${escapeHtml(titleOf(task))}</div>
          <div><b>实际终止时间：</b>${escapeHtml(when || '-')}</div>
          ${
            task.terminateTime
              ? `<div><b>计划终止时间：</b>${escapeHtml(task.terminateTime)}</div>`
              : ''
          }
          <div><b>任务状态：</b>已终止</div>
          <div style="margin-top:6px;color:#999;font-size:12px">已成功发表的内容不受影响（已发表不可撤回）</div>
        </div>
        <a href="employee-task-list.html?filter=stopped" class="publish-btn" style="display:inline-flex;align-items:center;justify-content:center;margin-top:20px;width:100%;text-decoration:none">返回任务列表</a>
      </div>`;
  }

  function initPublish() {
    const q = new URLSearchParams(location.search);
    let task = findEmployeeMoment(
      q.get('type') || 'personal',
      q.get('send') || 'immediate',
      q.get('id')
    );

    if (!task || task._empStatus === 'pending_admin') {
      document.getElementById('publishBody').innerHTML =
        '<div class="task-empty"><div class="illus">∅</div>任务不存在或尚未下发</div>';
      document.getElementById('btnPublish').disabled = true;
      document.getElementById('btnSimStop').hidden = true;
      return;
    }

    if (task._empStatus === 'expired') {
      renderBlockedPublish(task);
      return;
    }

    if (task._empStatus === 'done') {
      document.getElementById('publishBottom').style.display = 'none';
      document.getElementById('btnSimStop').hidden = true;
      document.getElementById('publishBody').innerHTML =
        '<div class="task-empty"><div class="illus">✓</div>该任务已发表</div>';
      return;
    }

    document.getElementById('backLink').href = 'employee-task-list.html';
    document.getElementById('btnSimStop').hidden = false;
    document.getElementById('publishBody').innerHTML = `
      <div class="publish-text" id="publishText" contenteditable="true">${escapeHtml(contentText(task))}</div>
      <div class="publish-attach">
        <div class="thumb">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </div>
        <div class="label">${escapeHtml(attachLabel(task))}</div>
        <button type="button" class="close" id="btnRemoveAttach" aria-label="移除">×</button>
      </div>
      <a href="#" class="publish-setting" id="btnVisibility">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>可见的客户</span>
        <span class="val" id="visibilityVal">公开</span>
        <span class="chev">›</span>
      </a>
      <a href="#" class="publish-setting" id="btnLocation">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
        <span>所在位置</span>
        <span class="chev">›</span>
      </a>
      ${
        task.terminateTime
          ? `<p style="margin-top:16px;font-size:12px;color:#999;line-height:1.5">请在终止时间 ${escapeHtml(task.terminateTime)} 前完成发表，超时或被管理员终止后将无法操作。</p>`
          : ''
      }`;

    document.getElementById('btnRemoveAttach').addEventListener('click', () => {
      document.querySelector('.publish-attach')?.remove();
    });
    document.getElementById('btnVisibility').addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById('visibilityVal');
      el.textContent = el.textContent === '公开' ? '部分可见' : '公开';
    });
    document.getElementById('btnLocation').addEventListener('click', (e) => {
      e.preventDefault();
      showToast('选择所在位置（原型占位）');
    });

    // 模拟：发表过程中任务被管理员终止
    document.getElementById('btnSimStop').addEventListener('click', () => {
      const updated = terminateMomentTask(task._type, task._send, task.id);
      if (!updated) {
        showToast('无法终止该任务');
        return;
      }
      openBlockDialog('任务已被管理员终止', stoppedDesc(updated), () => {
        location.href = 'employee-task-list.html?filter=stopped';
      });
    });

    document.getElementById('btnPublish').addEventListener('click', () => {
      // 发表前再次校验：若已被终止则拦截
      const latest = findEmployeeMoment(task._type, task._send, task.id);
      if (!latest || latest._empStatus === 'expired') {
        openBlockDialog(
          '任务已终止，无法发表',
          stoppedDesc(latest || task),
          () => {
            location.href = 'employee-task-list.html?filter=stopped';
          }
        );
        return;
      }
      if (latest._empStatus !== 'todo') {
        showToast('任务状态已变更，无法发表');
        return;
      }
      const visibility = document.getElementById('visibilityVal')?.textContent || '公开';
      markEmployeePublished(task._type, task._send, task.id, { visibility });
      showToast('发表成功');
      setTimeout(() => {
        location.href = 'employee-task-list.html';
      }, 800);
    });
  }

  /* ---------- 客户朋友圈（企业发表） ---------- */
  function formatTimelineDate(value) {
    if (!value) return { isToday: true };
    const m = String(value).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return { isToday: false, day: '-', month: '' };
    const now = new Date();
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) return { isToday: true };
    return { isToday: false, day: String(Number(m[3])), month: `${Number(m[2])}月` };
  }

  function groupByDate(items) {
    const map = new Map();
    items.forEach((item) => {
      const key = (item.time || '').slice(0, 10) || 'today';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }

  function initHome() {
    const todos = enterpriseTodos();
    const bar = document.getElementById('pendingBar');
    const text = document.getElementById('pendingText');
    if (bar && text) {
      if (todos.length > 0) {
        bar.hidden = false;
        text.textContent = `有${todos.length}条内容待你发表`;
      } else {
        bar.hidden = true;
      }
    }

    const published = listEmployeeMomentTasks()
      .filter((t) => t._type === 'enterprise' && t._empStatus === 'done')
      .map((t) => ({
        content: contentText(t),
        tag: '企业发表',
        time: (t._publishInfo && t._publishInfo.sendTime) || t.publishTime || t.time,
      }));

    const demo = [
      { content: '哈哈哈', tag: '渠道活码', time: '2026-07-14 10:00:00' },
      { content: '528测试528测试528测试', tag: '渠道活码', time: '2026-07-14 17:15:00' },
      { content: '珍珠奶茶9.9元', tag: '', time: '2026-07-13 12:00:00' },
    ];

    const groups = groupByDate([...published, ...demo]);
    const root = document.getElementById('timelineRoot');
    if (!root) return;

    const parts = [];
    parts.push(`
      <div class="cm-day">
        <div class="cm-date today">今天</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;">
            <a class="cm-compose" href="employee-moment-pending.html">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </a>
            <span class="cm-compose-label">发表到客户的朋友圈</span>
          </div>
        </div>
      </div>`);

    groups.forEach(([dateKey, rows]) => {
      const info = formatTimelineDate(dateKey);
      if (info.isToday) return;
      parts.push(`
        <div class="cm-day">
          <div class="cm-date"><span class="d">${escapeHtml(info.day)}</span><span class="m">${escapeHtml(info.month)}</span></div>
          <div class="cm-posts">
            ${rows
              .map(
                (r) => `
              <div class="cm-post">
                <div class="cm-post-text">${escapeHtml(r.content)}</div>
                ${r.tag ? `<div class="cm-post-tag">${escapeHtml(r.tag)}</div>` : ''}
              </div>`
              )
              .join('')}
          </div>
        </div>`);
    });
    root.innerHTML = parts.join('');

    document.querySelectorAll('.cm-tab[data-panel]').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        showToast(tab.dataset.panel === 'stats' ? '统计（原型占位）' : '配置（原型占位）');
      });
    });
  }

  /* 企业发表待发表列表：直接发表，无二次确认 */
  function initPending() {
    const box = document.getElementById('pendingList');
    const countEl = document.getElementById('pendingCount');
    if (!box) return;

    const todos = enterpriseTodos();
    if (countEl) countEl.textContent = String(todos.length);

    if (!todos.length) {
      box.innerHTML = `<div class="task-empty">暂无待发表内容</div>`;
      return;
    }

    box.innerHTML = todos
      .map((t) => {
        const deadline = t.terminateTime
          ? `<div class="pending-deadline">请于 ${escapeHtml(t.terminateTime)} 前发表，超时将自动终止</div>`
          : '';
        return `
      <div class="pending-card">
        <div class="pending-card-top">
          <div class="pending-tip">管理员通知你发表内容到客户的朋友圈</div>
          <a class="pending-btn" href="${publishUrl(t)}" style="display:inline-flex;align-items:center;text-decoration:none">发表</a>
        </div>
        <div class="pending-content">${escapeHtml(contentText(t))}</div>
        ${deadline}
        <div class="pending-foot">
          <div>${escapeHtml(formatChatTime(t.publishTime || t.time))}</div>
          <span>›</span>
        </div>
      </div>`;
      })
      .join('');
  }

  return {
    initMessages,
    initAssistant,
    initTaskList,
    initPublish,
    initHome,
    initPending,
  };
})();
