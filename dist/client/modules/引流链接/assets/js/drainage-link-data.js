/**
 * 引流链接 - Mock 数据
 */
const DrainageLinkStore = {
  groups: [
    { id: 'all', label: '全部' },
    { id: 'default', label: '默认分组' },
    { id: 'g234', label: '234' },
    { id: 'g11', label: '11' },
    { id: 'g1234567', label: '1234567' },
    { id: 'ghehe', label: '呵呵呵' },
    { id: 'glbs', label: 'LBS引流入群' },
  ],
  creators: ['林家庆', 'Lee', '李沙', '程翠翠', '朱晓涛', '宁叶卫'],
  fallbackCodes: [
    { id: 'fc1', label: 'ss测试渠道活码' },
    { id: 'fc4', label: 'lbs测试' },
    { id: 'fc5', label: '测试' },
    { id: 'fc2', label: '华东区兜底活码' },
    { id: 'fc3', label: '全国通用兜底活码' },
  ],
  links: [
    {
      id: 1,
      name: '林测试入群链接',
      channelActivity: 'ss测试渠道活码',
      createdAt: '2025-05-16 14:30:39',
      creator: '林家庆',
      groupId: 'none',
      groupLabel: '未分组',
      remark: '--',
      tab: 'lbs-group',
      pageTitle: '扫码进群',
      qrNameType: 'custom',
      qrName: '选择兜底活码',
      pageStyle: 'custom',
      guideText: '长按识别二维码入群，海量福利',
      useOfficialCode: false,
      fallbackCodeId: 'fc1',
    },
    {
      id: 2,
      name: '企微官方',
      channelActivity: 'lbs测试',
      createdAt: '2025-06-17 14:20:00',
      creator: 'Lee',
      groupId: 'none',
      groupLabel: '未分组',
      remark: '--',
      tab: 'lbs-group',
      pageTitle: '扫码进群',
      qrNameType: 'custom',
      qrName: '选择兜底活码',
      pageStyle: 'custom',
      guideText: '长按识别二维码入群，海量福利',
      useOfficialCode: false,
      fallbackCodeId: 'fc4',
    },
    {
      id: 3,
      name: 'LBS引流入群-官方活码',
      channelActivity: '测试',
      createdAt: '2025-06-16 10:15:00',
      creator: '--',
      groupId: 'none',
      groupLabel: '未分组',
      remark: '--',
      tab: 'lbs-group',
      pageTitle: '扫码进群',
      qrNameType: 'custom',
      qrName: '选择兜底活码',
      pageStyle: 'custom',
      guideText: '长按识别二维码入群，海量福利',
      useOfficialCode: true,
      fallbackCodeId: 'fc5',
    },
    {
      id: 4,
      name: '华东区门店入群',
      channelActivity: '华东区兜底活码',
      createdAt: '2025-05-22 09:15:20',
      creator: '李沙',
      groupId: 'default',
      groupLabel: '默认分组',
      remark: '华东试点',
      tab: 'lbs-group',
      pageTitle: '扫码进群',
      qrNameType: 'default',
      qrName: '',
      pageStyle: 'default',
      guideText: '长按识别二维码入群',
      useOfficialCode: false,
      fallbackCodeId: 'fc2',
    },
    {
      id: 5,
      name: 'LBS加好友测试',
      channelActivity: 'ss测试渠道活码',
      createdAt: '2025-03-10 11:20:00',
      creator: '朱晓涛',
      groupId: 'default',
      groupLabel: '默认分组',
      remark: '',
      tab: 'lbs-friend',
      pageTitle: '添加福利官',
      qrNameType: 'custom',
      qrName: '选择兜底活码',
      pageStyle: 'custom',
      copy1: '1、长按识别企微好友码，添加【店铺福利官】',
      copy2: '2、识别【店铺福利官】发您的二维码，即可入群',
      csJump: false,
      fallbackCodeId: 'fc1',
    },
    {
      id: 6,
      name: '渠道引流加好友',
      channelActivity: '华东区兜底活码',
      createdAt: '2025-02-28 08:55:33',
      creator: '宁叶卫',
      groupId: 'g234',
      groupLabel: '234',
      remark: '渠道测试',
      tab: 'friend',
      pageTitle: '扫码关注',
      qrNameType: 'default',
      qrName: '',
      pageStyle: 'default',
      guideText: '扫码了解更多',
      useOfficialCode: false,
      fallbackCodeId: 'fc2',
    },
  ],
};

/** 补齐 LBS 引流入群列表至 45 条（演示分页） */
(function padLbsGroupLinks() {
  const base = DrainageLinkStore.links.filter((l) => l.tab === 'lbs-group').length;
  const names = ['五一活动引流', '618入群链接', '门店推广链接', '新客入群', '会员专属群'];
  const activities = ['全国通用兜底活码', 'ss测试渠道活码', 'lbs测试', '测试'];
  const people = ['程翠翠', '林家庆', 'Lee', '李沙', '--'];
  let nextId = 100;
  for (let i = base; i < 45; i++) {
    const day = String(Math.max(1, 28 - (i % 28))).padStart(2, '0');
    const month = i % 2 === 0 ? '05' : '04';
    DrainageLinkStore.links.push({
      id: nextId++,
      name: names[i % names.length] + (i > 4 ? '-' + i : ''),
      channelActivity: activities[i % activities.length],
      createdAt: `2025-${month}-${day} ${10 + (i % 12)}:${String(i % 60).padStart(2, '0')}:00`,
      creator: people[i % people.length],
      groupId: i % 3 === 0 ? 'default' : 'none',
      groupLabel: i % 3 === 0 ? '默认分组' : '未分组',
      remark: i % 5 === 0 ? '活动备注' : '--',
      tab: 'lbs-group',
      pageTitle: '扫码进群',
      qrNameType: 'custom',
      qrName: '选择兜底活码',
      pageStyle: 'custom',
      guideText: '长按识别二维码入群，海量福利',
      useOfficialCode: i % 7 === 0,
      fallbackCodeId: DrainageLinkStore.fallbackCodes[i % DrainageLinkStore.fallbackCodes.length].id,
    });
  }
})();

/** 补齐 LBS 加好友列表至 43 条（演示分页） */
(function padLbsFriendLinks() {
  const base = DrainageLinkStore.links.filter((l) => l.tab === 'lbs-friend').length;
  const names = ['门店福利官', 'LBS好友引流', '华东加好友', '新客福利官', '618加好友'];
  const codes = ['ss测试渠道活码', 'lbs测试', '华东区兜底活码', '全国通用兜底活码', '测试'];
  const people = ['林家庆', 'Lee', '李沙', '程翠翠', '--'];
  let nextId = 200;
  for (let i = base; i < 43; i++) {
    const day = String(Math.max(1, 28 - (i % 28))).padStart(2, '0');
    const month = i % 2 === 0 ? '06' : '05';
    DrainageLinkStore.links.push({
      id: nextId++,
      name: names[i % names.length] + (i > 4 ? '-' + i : ''),
      channelActivity: codes[i % codes.length],
      createdAt: `2025-${month}-${day} ${9 + (i % 10)}:${String(i % 60).padStart(2, '0')}:00`,
      creator: people[i % people.length],
      groupId: i % 3 === 0 ? 'default' : 'none',
      groupLabel: i % 3 === 0 ? '默认分组' : '未分组',
      remark: i % 4 === 0 ? 'LBS好友' : '--',
      tab: 'lbs-friend',
      pageTitle: '添加福利官',
      qrNameType: 'custom',
      qrName: '选择兜底活码',
      pageStyle: 'custom',
      copy1: '1、长按识别企微好友码，添加【店铺福利官】',
      copy2: '2、识别【店铺福利官】发您的二维码，即可入群',
      csJump: i % 5 === 0,
      fallbackCodeId: DrainageLinkStore.fallbackCodes[i % DrainageLinkStore.fallbackCodes.length].id,
    });
  }
})();

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function findDrainageLink(id) {
  return DrainageLinkStore.links.find((l) => String(l.id) === String(id));
}

/** C 端门店 Mock 数据 */
const DrainageLinkStores = {
  cities: [
    { id: 'hefei', label: '合肥市' },
    { id: 'shanghai', label: '上海市' },
    { id: 'beijing', label: '北京市' },
  ],
  stores: [
    { id: 's1', name: '盛连祥', cityId: 'hefei' },
    { id: 's2', name: '企迈数店HD测试门店', cityId: 'hefei' },
    { id: 's3', name: '疯狂星期四', cityId: 'hefei' },
    { id: 's4', name: '技术支持门店', cityId: 'hefei' },
    { id: 's5', name: '三级门店1', cityId: 'hefei' },
    { id: 's6', name: '华东旗舰店', cityId: 'shanghai' },
    { id: 's7', name: '浦东体验店', cityId: 'shanghai' },
    { id: 's8', name: '朝阳门店', cityId: 'beijing' },
  ],
  nearestStoreId: 's2',
};
