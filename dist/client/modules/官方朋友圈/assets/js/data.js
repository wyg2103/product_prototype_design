/**
 * 官方朋友圈 - 共享 Mock 数据
 * 任务状态：待发布 | 执行中 | 已终止
 *
 * 字段约定：
 * - terminateTime：计划终止时间（可空=长期有效），手动终止时不覆盖
 * - stoppedAt：实际停止时间
 * - stopReason：manual | expired
 * - moment_id：企业发表对接企微 cancel_moment_task 的 id；个人发表为 null（仅 SCRM 侧拦截）
 */
const MOMENT_STATUS = {
  DRAFT: '待发布',
  RUNNING: '执行中',
  STOPPED: '已终止',
};

const DataStore = {
  personal: {
    immediate: [
      {
        id: 1,
        taskName: '测试朋友圈状态',
        type: '链接',
        content: '528测试528测试528测试',
        url: 'https://example.com/channel',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-15 10:57:42',
        publishTime: '2026-07-15 10:57:42',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-08-01 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['周玉', '钱朝阳'],
      },
      {
        id: 2,
        taskName: 'xyy5666',
        type: '链接',
        content: '528测试528测试528测试',
        url: 'https://example.com/xyy',
        creator: '朱晓涛',
        creatorAvatar: '朱',
        time: '2026-07-15 10:50:18',
        publishTime: '2026-07-15 10:50:18',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-07-30 18:00:00',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['周玉'],
      },
      {
        id: 3,
        taskName: 'xyy',
        type: '链接',
        content: '528测试528测试528测试',
        url: 'https://example.com/code',
        creator: 'Lee',
        creatorAvatar: 'L',
        time: '2026-07-15 10:50:05',
        publishTime: '2026-07-15 10:50:05',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: null,
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['周玉', '王明'],
      },
      {
        id: 4,
        taskName: '周末门店探店文案',
        type: '文本',
        content: '周末到店打卡，新品奶茶第二杯半价，快来打卡吧～',
        creator: '程翠翠',
        creatorAvatar: '程',
        time: '2026-07-16 09:20:00',
        publishTime: '2026-07-16 09:20:00',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-07-25 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: true,
        targets: ['全员导购'],
      },
      {
        id: 5,
        taskName: '会员日活动预告',
        type: '图片',
        content: '本周六会员日，积分翻倍！',
        image: true,
        creator: '宁叶卫',
        creatorAvatar: '宁',
        time: '2026-07-16 14:05:11',
        publishTime: '2026-07-16 14:05:11',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-07-28 12:00:00',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['门店A', '门店B'],
      },
      /* 演示：仍标「执行中」但终止时间已过，进入页面会被 sync 为已终止 */
      {
        id: 12,
        taskName: '到点自动终止演示',
        type: '文本',
        content: '该任务用于演示到达终止时间后管理端与员工端状态同步',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-18 09:00:00',
        publishTime: '2026-07-18 09:00:00',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-07-20 12:00:00',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['周玉', '钱朝阳'],
      },
      {
        id: 8,
        taskName: '已终止-暑期促销',
        type: '文本',
        content: '暑期促销活动已提前结束，请勿再发表',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-10 11:00:00',
        publishTime: '2026-07-10 11:00:00',
        sendType: '立即发送',
        status: '已终止',
        terminateTime: '2026-07-20 23:59:59',
        stoppedAt: '2026-07-12 16:30:00',
        stopReason: 'manual',
        moment_id: null,
        isGuide: false,
        targets: ['周玉', '钱朝阳'],
      },
      {
        id: 9,
        taskName: '已终止-错误素材',
        type: '链接',
        content: '[链接] 旧版活动链接（已作废）',
        url: 'https://example.com/old',
        creator: '朱锦涛',
        creatorAvatar: '朱',
        time: '2026-07-11 08:40:00',
        publishTime: '2026-07-11 08:40:00',
        sendType: '立即发送',
        status: '已终止',
        terminateTime: '2026-07-15 23:59:59',
        stoppedAt: '2026-07-11 09:15:22',
        stopReason: 'manual',
        moment_id: null,
        isGuide: false,
        targets: ['周玉'],
      },
      {
        id: 10,
        taskName: '草稿-待发布示例',
        type: '文本',
        content: '尚未下发的草稿，员工端不可见',
        creator: '程翠翠',
        creatorAvatar: '程',
        time: '2026-07-18 10:00:00',
        publishTime: '',
        sendType: '立即发送',
        status: '待发布',
        terminateTime: null,
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['周玉'],
      },
    ],
    scheduled: [
      {
        id: 6,
        taskName: '七夕礼遇预热',
        type: '文本',
        content: '七夕礼遇即将开启，提前收藏心仪好礼',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-20 09:00:00',
        publishTime: '2026-07-20 09:00:00',
        sendType: '定时发送',
        status: '执行中',
        terminateTime: '2026-08-10 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['全部员工'],
      },
      {
        id: 7,
        taskName: '定时链接任务',
        type: '链接',
        content: '[链接] 新品上市限时优惠',
        url: 'https://example.com/new',
        creator: '朱锦涛',
        creatorAvatar: '朱',
        time: '2026-07-19 08:30:00',
        publishTime: '2026-07-19 08:30:00',
        sendType: '定时发送',
        status: '待发布',
        terminateTime: '2026-08-01 12:00:00',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        isGuide: false,
        targets: ['宁叶卫', 'Lee'],
      },
    ],
  },
  enterprise: {
    immediate: [
      {
        id: 101,
        type: '文本',
        content: '企业品牌周统一宣发：品质生活从一杯好茶开始',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-15 10:28:09',
        publishTime: '2026-07-15 10:28:09',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-08-01 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: 'mom_101',
        targets: ['企业全员'],
      },
      {
        id: 102,
        type: '链接',
        content: '[链接] 宝子们 好奇萌萌桑囤一波',
        url: 'https://example.com/item/abc',
        creator: 'Lee',
        creatorAvatar: 'L',
        time: '2026-07-12 18:34:24',
        publishTime: '2026-07-12 18:34:24',
        sendType: '立即发送',
        status: '已终止',
        terminateTime: '2026-07-20 23:59:59',
        stoppedAt: '2026-07-13 10:00:00',
        stopReason: 'manual',
        moment_id: 'mom_102',
        targets: ['品牌部', '运营部'],
      },
      {
        id: 103,
        type: '图片',
        content: '夏日海报合集',
        image: true,
        creator: '宁叶卫',
        creatorAvatar: '宁',
        time: '2026-07-14 14:20:11',
        publishTime: '2026-07-14 14:20:11',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: null,
        stoppedAt: null,
        stopReason: null,
        moment_id: 'mom_103',
        targets: ['华东大区'],
      },
      {
        id: 104,
        type: '文本',
        content: '企业品牌统一宣发文案（草稿）',
        creator: '程翠翠',
        creatorAvatar: '程',
        time: '2026-07-12 16:45:00',
        publishTime: '',
        sendType: '立即发送',
        status: '待发布',
        terminateTime: '2026-07-25 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        targets: ['华南大区'],
      },
      {
        id: 105,
        type: '链接',
        content: '[链接] 会员专享福利领取',
        url: 'https://example.com/vip',
        creator: '朱锦涛',
        creatorAvatar: '朱',
        time: '2026-07-13 10:00:00',
        publishTime: '2026-07-13 10:00:00',
        sendType: '定时发送',
        status: '执行中',
        terminateTime: '2026-07-31 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: 'mom_105',
        targets: ['会员运营组'],
      },
      /* 企业发表：到点自动终止演示（模拟 cancel_moment_task） */
      {
        id: 107,
        type: '文本',
        content: '企业发表到点终止演示：到达终止时间后应调用停止接口',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-18 11:00:00',
        publishTime: '2026-07-18 11:00:00',
        sendType: '立即发送',
        status: '执行中',
        terminateTime: '2026-07-21 18:00:00',
        stoppedAt: null,
        stopReason: null,
        moment_id: 'mom_107',
        targets: ['品牌部'],
      },
    ],
    scheduled: [
      {
        id: 106,
        type: '文本',
        content: '定时企业发表 - 中秋礼盒预售',
        creator: '李沙',
        creatorAvatar: '李',
        time: '2026-07-25 08:00:00',
        publishTime: '2026-07-25 08:00:00',
        sendType: '定时发送',
        status: '待发布',
        terminateTime: '2026-09-01 23:59:59',
        stoppedAt: null,
        stopReason: null,
        moment_id: null,
        targets: ['全国门店'],
      },
    ],
  },
};

const MOMENT_STORE_KEY = 'moment_datastore_v3';

function persistMomentStore() {
  try {
    sessionStorage.setItem(MOMENT_STORE_KEY, JSON.stringify(DataStore));
  } catch (_) {
    /* ignore */
  }
}

function hydrateMomentStore() {
  try {
    const raw = sessionStorage.getItem(MOMENT_STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && saved.personal && saved.enterprise) {
      DataStore.personal = saved.personal;
      DataStore.enterprise = saved.enterprise;
    }
  } catch (_) {
    /* ignore */
  }
}

hydrateMomentStore();

function nowStamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function nextMomentId(type) {
  let max = type === 'enterprise' ? 100 : 0;
  ['immediate', 'scheduled'].forEach((send) => {
    const pool = DataStore[type] && DataStore[type][send];
    if (!pool) return;
    pool.forEach((r) => {
      const n = Number(r.id);
      if (!Number.isNaN(n) && n > max) max = n;
    });
  });
  return max + 1;
}

function makeWxMomentId(localId) {
  return `mom_${localId}`;
}

function ensureEnterpriseMomentId(row) {
  if (!row) return null;
  if (!row.moment_id) row.moment_id = makeWxMomentId(row.id);
  return row.moment_id;
}

function parseMomentTime(value) {
  if (!value) return null;
  const t = new Date(String(value).replace(/-/g, '/')).getTime();
  return Number.isNaN(t) ? null : t;
}

function isTerminateTimePassed(row, now) {
  const t = parseMomentTime(row && row.terminateTime);
  return t != null && t < (now != null ? now : Date.now());
}

/** 格式化计划终止时间：空值显示「长期有效」 */
function formatTerminateTime(value) {
  if (!value) return '长期有效';
  return String(value);
}

function getMomentStatus(row) {
  if (!row) return MOMENT_STATUS.DRAFT;
  if (row.status) return row.status;
  if (row.sendStatus === '已终止') return MOMENT_STATUS.STOPPED;
  if (row.sendStatus === '待发送' || row.sendStatus === '待发布') return MOMENT_STATUS.DRAFT;
  return MOMENT_STATUS.RUNNING;
}

function getStopReason(row) {
  if (!row || getMomentStatus(row) !== MOMENT_STATUS.STOPPED) return null;
  if (row.stopReason === 'expired' || row.stopReason === 'manual') return row.stopReason;
  if (row.stoppedAt && row.terminateTime && row.stoppedAt === row.terminateTime) return 'expired';
  return 'manual';
}

function getStopReasonLabel(row) {
  const reason = getStopReason(row);
  if (reason === 'expired') return '到达终止时间自动终止';
  if (reason === 'manual') return '管理员手动终止';
  return '';
}

function getStopDisplayTime(row) {
  if (!row) return '';
  return row.stoppedAt || row.terminateTime || '';
}

function statusClassName(status) {
  if (status === MOMENT_STATUS.STOPPED) return 'status-tag stopped';
  if (status === MOMENT_STATUS.DRAFT) return 'status-tag draft';
  return 'status-tag running';
}

/**
 * 到点自动终止（模拟服务端调度 + 企微 cancel_moment_task）
 * 执行中且已过计划 terminateTime → 已终止，保留计划时间，写入 stoppedAt
 */
function syncExpiredMomentTasks() {
  let changed = false;
  const now = Date.now();
  ['personal', 'enterprise'].forEach((type) => {
    ['immediate', 'scheduled'].forEach((send) => {
      const pool = (DataStore[type] && DataStore[type][send]) || [];
      pool.forEach((row) => {
        if (getMomentStatus(row) !== MOMENT_STATUS.RUNNING) return;
        if (!isTerminateTimePassed(row, now)) return;
        row.status = MOMENT_STATUS.STOPPED;
        row.stoppedAt = row.terminateTime;
        row.stopReason = 'expired';
        if (type === 'enterprise') ensureEnterpriseMomentId(row);
        changed = true;
      });
    });
  });
  if (changed) persistMomentStore();
  return changed;
}

/** 页面渲染前调用，保证管理端/员工端状态一致 */
function ensureMomentTasksSynced() {
  syncExpiredMomentTasks();
}

syncExpiredMomentTasks();

/** 新增朋友圈任务（保存/发布） */
function addMomentTask(type, task) {
  const send = task.sendType === '定时发送' ? 'scheduled' : 'immediate';
  if (!DataStore[type]) DataStore[type] = { immediate: [], scheduled: [] };
  if (!DataStore[type][send]) DataStore[type][send] = [];
  const row = {
    id: nextMomentId(type),
    stoppedAt: null,
    stopReason: null,
    moment_id: null,
    ...task,
    status: task.status || MOMENT_STATUS.DRAFT,
  };
  if (type === 'enterprise' && row.status === MOMENT_STATUS.RUNNING) {
    row.moment_id = makeWxMomentId(row.id);
  }
  if (type === 'personal') {
    row.moment_id = null;
  }
  DataStore[type][send].unshift(row);
  persistMomentStore();
  syncExpiredMomentTasks();
  return row;
}

/**
 * 手动终止任务（仅执行中可终止）
 * - 保留 terminateTime（计划截止）
 * - 写入 stoppedAt / stopReason=manual
 * - 企业发表：模拟 cancel_moment_task(moment_id)
 * - 个人发表：无企微 moment_id，仅 SCRM 侧停止下发与发表
 */
function terminateMomentTask(type, send, id) {
  syncExpiredMomentTasks();
  const pool = DataStore[type] && DataStore[type][send];
  if (!pool) return null;
  const row = pool.find((r) => String(r.id) === String(id));
  if (!row || getMomentStatus(row) !== MOMENT_STATUS.RUNNING) return null;

  if (type === 'enterprise') {
    ensureEnterpriseMomentId(row);
    row.cancelApi = 'cancel_moment_task';
  }

  row.status = MOMENT_STATUS.STOPPED;
  row.stoppedAt = nowStamp();
  row.stopReason = 'manual';
  persistMomentStore();
  return row;
}

/** 待发布 → 执行中（下发给员工） */
function publishMomentTask(type, send, id) {
  syncExpiredMomentTasks();
  const pool = DataStore[type] && DataStore[type][send];
  if (!pool) return null;
  const row = pool.find((r) => String(r.id) === String(id));
  if (!row || getMomentStatus(row) !== MOMENT_STATUS.DRAFT) return null;
  row.status = MOMENT_STATUS.RUNNING;
  row.publishTime = nowStamp();
  row.stoppedAt = null;
  row.stopReason = null;
  if (type === 'enterprise') {
    ensureEnterpriseMomentId(row);
  } else {
    row.moment_id = null;
  }
  persistMomentStore();
  syncExpiredMomentTasks();
  return row;
}

const EMP_PUBLISH_KEY = 'moment_employee_publish_v1';

function loadEmployeePublishMap() {
  try {
    return JSON.parse(sessionStorage.getItem(EMP_PUBLISH_KEY) || '{}') || {};
  } catch (_) {
    return {};
  }
}

function saveEmployeePublishMap(map) {
  try {
    sessionStorage.setItem(EMP_PUBLISH_KEY, JSON.stringify(map));
  } catch (_) {
    /* ignore */
  }
}

function getEmployeePublishKey(type, send, id) {
  return `${type}:${send}:${id}`;
}

function isEmployeePublished(type, send, id) {
  const map = loadEmployeePublishMap();
  return !!map[getEmployeePublishKey(type, send, id)];
}

function markEmployeePublished(type, send, id, meta) {
  const map = loadEmployeePublishMap();
  map[getEmployeePublishKey(type, send, id)] = {
    sendTime: nowStamp(),
    visibility: (meta && meta.visibility) || '公开',
    ...(meta || {}),
  };
  saveEmployeePublishMap(map);
  return map[getEmployeePublishKey(type, send, id)];
}

function getEmployeePublishInfo(type, send, id) {
  const map = loadEmployeePublishMap();
  return map[getEmployeePublishKey(type, send, id)] || null;
}

function enrichEmployeeMoment(type, send, row) {
  const status = getMomentStatus(row);
  if (status === MOMENT_STATUS.DRAFT) {
    return {
      ...row,
      _type: type,
      _send: send,
      _adminStatus: status,
      _empStatus: 'pending_admin',
      _publishInfo: null,
      _stopReason: null,
    };
  }
  const published = isEmployeePublished(type, send, row.id);
  let empStatus = 'todo';
  if (status === MOMENT_STATUS.STOPPED) empStatus = 'expired';
  else if (published) empStatus = 'done';
  return {
    ...row,
    _type: type,
    _send: send,
    _adminStatus: status,
    _empStatus: empStatus,
    _publishInfo: getEmployeePublishInfo(type, send, row.id),
    _stopReason: getStopReason(row),
  };
}

/** 员工端可见任务：待发布不下发；执行中/已终止可见 */
function listEmployeeMomentTasks() {
  syncExpiredMomentTasks();
  const list = [];
  ['personal', 'enterprise'].forEach((type) => {
    ['immediate', 'scheduled'].forEach((send) => {
      const pool = (DataStore[type] && DataStore[type][send]) || [];
      pool.forEach((row) => {
        if (getMomentStatus(row) === MOMENT_STATUS.DRAFT) return;
        list.push(enrichEmployeeMoment(type, send, row));
      });
    });
  });
  return list.sort((a, b) => String(b.time).localeCompare(String(a.time)));
}

function findEmployeeMoment(type, send, id) {
  syncExpiredMomentTasks();
  const row = findMoment(type, send, id);
  if (!row) return null;
  return enrichEmployeeMoment(type, send, row);
}

const GROUPS = {
  personal: [
    { id: 'all', label: '全部' },
    { id: 'default', label: '默认分组' },
    { id: 'holiday', label: '节日运营', children: ['法定节假日…'] },
    { id: 'daily', label: '日常运营' },
  ],
  enterprise: [
    { id: 'all', label: '全部' },
    { id: 'default', label: '默认分组' },
    { id: 'g123', label: '123' },
    { id: 'g321', label: '321' },
  ],
};

/** 任务记录：员工发送执行情况 */
const TASK_RECORDS = [
  {
    id: 'r1',
    employee: '周玉',
    phone: '13812345678',
    department: '华东一区',
    sent: true,
    sendTime: '2026-06-03 17:05:22',
    visibilityScope: '公开',
    commentCount: 3,
    likeCount: 8,
    comments: [
      { userId: 'wm_10001', nickname: '吃货小王', time: '2026-06-03 17:20:11' },
      { userId: 'wm_10002', nickname: '美食达人Lily', time: '2026-06-03 17:35:40' },
      { userId: 'wm_10003', nickname: '周末探店', time: '2026-06-03 18:02:05' },
    ],
    likes: [
      { userId: 'wm_20001', nickname: '张三', time: '2026-06-03 17:18:00' },
      { userId: 'wm_20002', nickname: '李四', time: '2026-06-03 17:19:33' },
      { userId: 'wm_20003', nickname: '王五', time: '2026-06-03 17:22:15' },
      { userId: 'wm_20004', nickname: '赵六', time: '2026-06-03 17:30:00' },
      { userId: 'wm_20005', nickname: '钱七', time: '2026-06-03 17:45:20' },
      { userId: 'wm_20006', nickname: '孙八', time: '2026-06-03 18:00:11' },
      { userId: 'wm_20007', nickname: '周九', time: '2026-06-03 18:10:45' },
      { userId: 'wm_20008', nickname: '吴十', time: '2026-06-03 18:25:00' },
    ],
  },
  {
    id: 'r2',
    employee: '钱朝阳',
    phone: '13987654321',
    department: '华东一区',
    sent: true,
    sendTime: '2026-06-03 17:12:08',
    visibilityScope: '不分可见',
    commentCount: 1,
    likeCount: 2,
    comments: [{ userId: 'wm_10010', nickname: '朝阳粉丝', time: '2026-06-03 19:00:00' }],
    likes: [
      { userId: 'wm_20010', nickname: '用户A', time: '2026-06-03 17:30:00' },
      { userId: 'wm_20011', nickname: '用户B', time: '2026-06-03 17:55:12' },
    ],
  },
  {
    id: 'r3',
    employee: '王明',
    phone: '13611112222',
    department: '华南二区',
    sent: false,
    sendTime: '',
    visibilityScope: '不分可见',
    commentCount: 0,
    likeCount: 0,
    comments: [],
    likes: [],
  },
  {
    id: 'r4',
    employee: '谢鹏飞',
    phone: '13733334444',
    department: '华南二区',
    sent: true,
    sendTime: '2026-06-03 18:20:00',
    visibilityScope: '公开',
    commentCount: 0,
    likeCount: 5,
    comments: [],
    likes: [
      { userId: 'wm_30001', nickname: '鹏飞好友1', time: '2026-06-03 18:25:00' },
      { userId: 'wm_30002', nickname: '鹏飞好友2', time: '2026-06-03 18:30:00' },
      { userId: 'wm_30003', nickname: '鹏飞好友3', time: '2026-06-03 18:35:00' },
      { userId: 'wm_30004', nickname: '鹏飞好友4', time: '2026-06-03 18:40:00' },
      { userId: 'wm_30005', nickname: '鹏飞好友5', time: '2026-06-03 18:45:00' },
    ],
  },
  {
    id: 'r5',
    employee: '王丽',
    phone: '13555556666',
    department: '华北三区',
    sent: false,
    sendTime: '',
    visibilityScope: '公开',
    commentCount: 0,
    likeCount: 0,
    comments: [],
    likes: [],
  },
  {
    id: 'r6',
    employee: '王锐强',
    phone: '13477778888',
    department: '华北三区',
    sent: true,
    sendTime: '2026-06-03 16:50:15',
    visibilityScope: '不分可见',
    commentCount: 2,
    likeCount: 0,
    comments: [
      { userId: 'wm_40001', nickname: '老顾客', time: '2026-06-03 17:00:00' },
      { userId: 'wm_40002', nickname: '新顾客', time: '2026-06-03 17:15:30' },
    ],
    likes: [],
  },
];

function findMoment(type, send, id) {
  const pool = DataStore[type] && DataStore[type][send];
  if (!pool) return null;
  return pool.find((r) => String(r.id) === String(id)) || null;
}

function getDetailUrl(type, send, id) {
  return `detail.html?type=${encodeURIComponent(type)}&send=${encodeURIComponent(send)}&id=${encodeURIComponent(id)}`;
}

function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}
