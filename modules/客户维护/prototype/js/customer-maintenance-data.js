/**
 * 客户维护分析 - Mock 数据（对齐企微「联系客户统计」行为数据）
 */
const CustomerMaintenanceMeta = {
  updateTime: '2026-06-04 09:30:00',
  intro:
    '展示员工在企业微信里日常维护客户的情况：加好友、聊天、回复速度等。数据按天统计，通常次日更新。',
  metrics: [
    {
      key: 'newApplyCnt',
      label: '主动加好友',
      tip: '员工主动发起的好友申请次数，包括搜手机号、扫码、从群聊添加等方式。',
    },
    {
      key: 'newContactCnt',
      label: '新增客户',
      tip: '当天成功添加的新客户人数。',
    },
    {
      key: 'chatCnt',
      label: '聊天客户数',
      tip: '员工至少发过一条消息的单聊客户人数（不含群聊）。',
    },
    {
      key: 'messageCnt',
      label: '发出消息数',
      tip: '员工在单聊里发出的消息总条数。',
    },
    {
      key: 'replyPercentage',
      label: '咨询回复率',
      tip: '客户主动发起聊天的日子里，员工有回复的天数占比。越高说明响应越及时。',
      unit: '%',
    },
    {
      key: 'avgReplyTime',
      label: '平均回复时长',
      tip: '客户先发消息后，员工首次回复的平均等待时间（分钟）。越短越好。',
      unit: '分钟',
    },
    {
      key: 'negativeFeedbackCnt',
      label: '被删/拉黑',
      tip: '当天删除员工或把员工拉黑的客户人数。需关注客户流失。',
    },
  ],
};

const CustomerMaintenanceData = {
  summary: {
    newApplyCnt: 86,
    newContactCnt: 52,
    chatCnt: 318,
    messageCnt: 2846,
    replyPercentage: 78.5,
    avgReplyTime: 14,
    negativeFeedbackCnt: 7,
  },
  trend: [
    { date: '06-01', newContactCnt: 6, chatCnt: 42, messageCnt: 380, replyPercentage: 72, avgReplyTime: 18 },
    { date: '06-02', newContactCnt: 8, chatCnt: 45, messageCnt: 410, replyPercentage: 75, avgReplyTime: 16 },
    { date: '06-03', newContactCnt: 9, chatCnt: 48, messageCnt: 425, replyPercentage: 80, avgReplyTime: 13 },
    { date: '06-04', newContactCnt: 7, chatCnt: 44, messageCnt: 398, replyPercentage: 79, avgReplyTime: 15 },
    { date: '06-05', newContactCnt: 10, chatCnt: 52, messageCnt: 468, replyPercentage: 82, avgReplyTime: 12 },
    { date: '06-06', newContactCnt: 6, chatCnt: 46, messageCnt: 392, replyPercentage: 76, avgReplyTime: 17 },
    { date: '06-07', newContactCnt: 6, chatCnt: 41, messageCnt: 373, replyPercentage: 84, avgReplyTime: 11 },
  ],
  employees: [
    {
      userid: 'chengcc',
      name: '程翠翠',
      dept: '安徽省',
      phone: '18621616320',
      totals: {
        newApplyCnt: 18,
        newContactCnt: 12,
        chatCnt: 68,
        messageCnt: 620,
        replyPercentage: 85.2,
        avgReplyTime: 9,
        negativeFeedbackCnt: 1,
      },
      daily: [
        { statDate: '2026-06-07', newApplyCnt: 3, newContactCnt: 2, chatCnt: 10, messageCnt: 92, replyPercentage: 88, avgReplyTime: 8, negativeFeedbackCnt: 0 },
        { statDate: '2026-06-06', newApplyCnt: 2, newContactCnt: 1, chatCnt: 9, messageCnt: 85, replyPercentage: 82, avgReplyTime: 10, negativeFeedbackCnt: 0 },
        { statDate: '2026-06-05', newApplyCnt: 4, newContactCnt: 3, chatCnt: 12, messageCnt: 110, replyPercentage: 90, avgReplyTime: 7, negativeFeedbackCnt: 0 },
      ],
    },
    {
      userid: 'wangm',
      name: '王明',
      dept: '华南二区',
      phone: '13611112222',
      totals: {
        newApplyCnt: 12,
        newContactCnt: 5,
        chatCnt: 42,
        messageCnt: 280,
        replyPercentage: 58.3,
        avgReplyTime: 32,
        negativeFeedbackCnt: 3,
      },
      daily: [
        { statDate: '2026-06-07', newApplyCnt: 2, newContactCnt: 0, chatCnt: 5, messageCnt: 28, replyPercentage: 55, avgReplyTime: 35, negativeFeedbackCnt: 1 },
        { statDate: '2026-06-06', newApplyCnt: 1, newContactCnt: 1, chatCnt: 6, messageCnt: 32, replyPercentage: 60, avgReplyTime: 30, negativeFeedbackCnt: 1 },
      ],
    },
    {
      userid: 'zhuxt',
      name: '朱晓涛',
      dept: '华东区',
      phone: '13700000000',
      totals: {
        newApplyCnt: 22,
        newContactCnt: 15,
        chatCnt: 75,
        messageCnt: 710,
        replyPercentage: 81.0,
        avgReplyTime: 12,
        negativeFeedbackCnt: 1,
      },
      daily: [
        { statDate: '2026-06-07', newApplyCnt: 4, newContactCnt: 3, chatCnt: 11, messageCnt: 105, replyPercentage: 83, avgReplyTime: 11, negativeFeedbackCnt: 0 },
      ],
    },
    {
      userid: 'lisa',
      name: '李沙',
      dept: '运营部',
      phone: '13900001111',
      totals: {
        newApplyCnt: 15,
        newContactCnt: 10,
        chatCnt: 58,
        messageCnt: 520,
        replyPercentage: 76.5,
        avgReplyTime: 15,
        negativeFeedbackCnt: 1,
      },
      daily: [],
    },
    {
      userid: 'zhangw',
      name: '张伟',
      dept: '华北区',
      phone: '13800002222',
      totals: {
        newApplyCnt: 19,
        newContactCnt: 10,
        chatCnt: 75,
        messageCnt: 716,
        replyPercentage: 88.0,
        avgReplyTime: 8,
        negativeFeedbackCnt: 1,
      },
      daily: [],
    },
    {
      userid: 'zhaol',
      name: '赵磊',
      dept: '华东区',
      phone: '13700000001',
      totals: { newApplyCnt: 14, newContactCnt: 9, chatCnt: 62, messageCnt: 540, replyPercentage: 79.0, avgReplyTime: 14, negativeFeedbackCnt: 0 },
      daily: [],
    },
    {
      userid: 'sunh',
      name: '孙慧',
      dept: '华南二区',
      phone: '13600000002',
      totals: { newApplyCnt: 11, newContactCnt: 7, chatCnt: 48, messageCnt: 410, replyPercentage: 74.0, avgReplyTime: 18, negativeFeedbackCnt: 1 },
      daily: [],
    },
    {
      userid: 'wuj',
      name: '吴静',
      dept: '运营部',
      phone: '13500000003',
      totals: { newApplyCnt: 16, newContactCnt: 11, chatCnt: 70, messageCnt: 630, replyPercentage: 86.0, avgReplyTime: 10, negativeFeedbackCnt: 0 },
      daily: [],
    },
    {
      userid: 'zhouy',
      name: '周洋',
      dept: '华北区',
      phone: '13400000004',
      totals: { newApplyCnt: 10, newContactCnt: 6, chatCnt: 40, messageCnt: 350, replyPercentage: 70.0, avgReplyTime: 20, negativeFeedbackCnt: 2 },
      daily: [],
    },
    {
      userid: 'xux',
      name: '徐欣',
      dept: '安徽省',
      phone: '13300000005',
      totals: { newApplyCnt: 13, newContactCnt: 8, chatCnt: 55, messageCnt: 480, replyPercentage: 82.0, avgReplyTime: 11, negativeFeedbackCnt: 0 },
      daily: [],
    },
    {
      userid: 'hej',
      name: '何杰',
      dept: '华东区',
      phone: '13200000006',
      totals: { newApplyCnt: 9, newContactCnt: 5, chatCnt: 38, messageCnt: 290, replyPercentage: 68.0, avgReplyTime: 22, negativeFeedbackCnt: 1 },
      daily: [],
    },
    {
      userid: 'gaoy',
      name: '高燕',
      dept: '华南二区',
      phone: '13100000007',
      totals: { newApplyCnt: 17, newContactCnt: 12, chatCnt: 72, messageCnt: 680, replyPercentage: 87.0, avgReplyTime: 9, negativeFeedbackCnt: 0 },
      daily: [],
    },
  ],
};

function escapeHtmlCm(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function formatReplyTime(minutes) {
  if (minutes == null || minutes === '' || Number.isNaN(minutes)) return '—';
  const m = Math.round(Number(minutes));
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} 小时 ${rest} 分` : `${h} 小时`;
}

function formatPercent(val) {
  if (val == null || val === '') return '—';
  return `${Number(val).toFixed(1)}%`;
}
