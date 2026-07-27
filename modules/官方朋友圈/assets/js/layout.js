/**
 * 共享布局：顶栏 + 侧栏（SVG 图标）
 */
(function (global) {
  const ICONS = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 17l5-5 4 4 7-8"/><path d="M14 8h6v6"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M9 21V12h6v9"/></svg>',
    moments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 14h2"/></svg>',
    bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h1M9 10h1M9 14h1M14 6h1M14 10h1M14 14h1M9 18h6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    welcome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z"/></svg>',
    mass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 12L16 8"/><circle cx="12" cy="12" r="4"/></svg>',
    material: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    assistant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg>',
    components: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M16 16h2v2h-2zM13 19h2v2h-2zM19 19h2v2h-2z"/></svg>',
  };

  function getMenuTemplate() {
    return [
      { id: 'overview', label: '企微概览', icon: 'grid' },
      {
        id: 'components',
        label: '组件库',
        icon: 'components',
        children: [
          { id: 'batch-import', label: '批量导入', href: '../../组件库/prototype/component-library.html' },
        ],
      },
      {
        id: 'growth',
        label: '增长获客',
        icon: 'trend',
        children: [
          { id: 'channel-code', label: '渠道活码', href: '#' },
          { id: 'community-code', label: '社群活码', href: '#' },
          { id: 'batch-add', label: '批量加好友', href: '#' },
          { id: 'auto-group', label: '自动拉群', href: '#' },
          { id: 'drainage-link', label: '引流链接', href: '../../引流链接/prototype/drainage-link.html' },
          { id: 'business-code', label: '业务引流码', href: '#' },
        ],
      },
      {
        id: 'reach',
        label: '用户触达',
        icon: 'send',
        children: [
          { id: 'welcome', label: '好友欢迎语', href: '#' },
          { id: 'mass-send', label: '客户群发', href: '../../客户群发/prototype/mass-send.html' },
          { id: 'community-mass', label: '社群群发', href: '#' },
          { id: 'assistant', label: '群发助手', href: '#' },
          { id: 'material', label: '素材库', href: '#' },
          { id: 'radar', label: '任务雷达', href: '#' },
        ],
      },
      { id: 'store', label: '门店运营', icon: 'store' },
      {
        id: 'moments',
        label: '朋友圈运营',
        icon: 'moments',
        children: [{ id: 'official', label: '官方朋友圈', href: '../../官方朋友圈/prototype/index.html' }],
      },
      { id: 'marketing', label: '营销互动', icon: 'target' },
      { id: 'follow', label: '客户跟进', icon: 'users' },
      { id: 'convert', label: '客户转化', icon: 'chart' },
      { id: 'sidebar', label: '企微侧边栏', icon: 'panel' },
      { id: 'customer', label: '客户管理', icon: 'user', children: [
          { id: 'customer-maintenance', label: '客户维护分析', href: '../../客户维护/prototype/customer-maintenance.html' },
        ],
      },
      { id: 'community', label: '社群运营', icon: 'chat' },
      { id: 'alipay', label: '支付宝社群', icon: 'wallet' },
      { id: 'stats', label: '数据统计', icon: 'bar' },
      {
        id: 'enterprise',
        label: '企业管理',
        icon: 'building',
        children: [
          { id: 'purchase-license', label: '购买接口许可', href: '../../引流链接/prototype/purchase-license.html' },
        ],
      },
    ];
  }

  function icon(name) {
    return `<span class="svg-icon">${ICONS[name] || ''}</span>`;
  }

  function renderHeader() {
    return `
    <header class="top-header">
      <div class="logo-area">
        <span class="logo-icon">餐</span>
        <span class="logo-text">餐饮 2.0</span>
        <span class="logo-caret">${icon('chevron')}</span>
      </div>
      <nav class="main-nav">
        <a href="#">品牌管理</a>
        <a href="../../官方朋友圈/prototype/index.html" class="active">社交客户管理 SCRM</a>
        <a href="#">会员管理 CRM</a>
        <a href="#">营销管理</a>
        <a href="#">卡券管理</a>
        <a href="#">业务运营 <span class="nav-caret">▾</span></a>
      </nav>
      <div class="header-right">
        <div class="search-box">
          ${icon('search')}
          <input type="text" placeholder="搜索功能名称..." />
          <span class="hint">⌘K</span>
        </div>
        <button type="button" class="btn-feedback">问题反馈</button>
        <button type="button" class="icon-btn" title="通知">${icon('bell')}<span class="badge">2</span></button>
        <button type="button" class="icon-btn" title="下载">${icon('download')}</button>
        <button type="button" class="icon-btn" title="设置">${icon('settings')}</button>
        <div class="user-profile">
          <span class="user-avatar">李</span>
          <span class="user-name">李沙</span>
        </div>
      </div>
    </header>`;
  }

  function renderSidebar(options) {
    const { expandModule, activeItem } = options;
    const menu = getMenuTemplate();

    const items = menu
      .map((item) => {
        if (item.children) {
          const expanded = item.id === expandModule ? ' expanded' : '';
          const subs = item.children
            .map(
              (c) =>
                `<li><a href="${c.href || '#'}" class="${c.id === activeItem ? 'active' : ''}">${c.label}</a></li>`
            )
            .join('');
          return `
        <li class="menu-item${expanded}">
          <span class="menu-label">
            <span class="menu-icon">${ICONS[item.icon]}</span>
            <span class="menu-text">${item.label}</span>
            <span class="arrow">${ICONS.chevron}</span>
          </span>
          <ul class="sub-menu">${subs}</ul>
        </li>`;
        }
        return `
      <li class="menu-item">
        <a href="#">
          <span class="menu-icon">${ICONS[item.icon]}</span>
          <span class="menu-text">${item.label}</span>
        </a>
      </li>`;
      })
      .join('');

    const licenseBtn =
      activeItem === 'purchase-license'
        ? ''
        : `<a href="../../引流链接/prototype/purchase-license.html" class="side-license-btn">购买接口许可</a>`;

    return `
    <aside class="side-nav">
      <div class="side-nav-head">SCRM 导航</div>
      <ul class="menu-list">${items}</ul>
      ${licenseBtn}
      <div class="side-footer">
        <button type="button" class="side-foot-btn" title="新户"><span class="menu-icon sm">${ICONS.user}</span></button>
        <button type="button" class="side-foot-btn" title="更新"><span class="menu-icon sm">${ICONS.download}</span></button>
        <button type="button" class="side-foot-btn" title="记录"><span class="menu-icon sm">${ICONS.bar}</span></button>
      </div>
    </aside>`;
  }

  function bindSidebar() {
    document.querySelectorAll('.menu-item .menu-label').forEach((label) => {
      label.addEventListener('click', () => {
        label.closest('.menu-item').classList.toggle('expanded');
      });
    });
  }

  function renderPerspectiveSwitch(active) {
    const adminActive = active === 'admin' ? 'active' : '';
    const clientActive = active === 'client' ? 'active' : '';
    return `
    <div class="perspective-switch" id="perspectiveSwitch">
      <div class="perspective-switch-inner">
        <span class="perspective-label">视角</span>
        <div class="perspective-tabs">
          <a href="../../官方朋友圈/prototype/index.html" class="perspective-tab ${adminActive}" data-view="admin">商家后台</a>
          <a href="../../官方朋友圈/prototype/employee-messages.html" class="perspective-tab ${clientActive}" data-view="client">企微客户端</a>
        </div>
        <span class="perspective-hint">官方朋友圈 · 管理端 / 员工端原型切换</span>
      </div>
    </div>`;
  }

  function mountPerspectiveSwitch(active) {
    if (document.getElementById('perspectiveSwitch')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = renderPerspectiveSwitch(active);
    document.body.insertBefore(wrap.firstElementChild, document.body.firstChild);
    document.body.classList.add('has-perspective-switch');
  }

  function mountLayout(options = {}) {
    const expandModule = options.expandModule || 'moments';
    const activeItem = options.activeItem || 'official';
    const perspective = options.perspective || 'admin';

    mountPerspectiveSwitch(perspective);

    const headerEl = document.getElementById('app-header');
    const sidebarEl = document.getElementById('app-sidebar');
    if (headerEl) headerEl.innerHTML = renderHeader();
    if (sidebarEl) {
      sidebarEl.innerHTML = renderSidebar({ expandModule, activeItem });
      bindSidebar();
    }
  }

  global.AppLayout = { mountLayout, mountPerspectiveSwitch, icon, ICONS };
})(window);
