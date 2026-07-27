/**
 * 购买接口许可 - Mock 数据
 */
const PurchaseLicenseMeta = {
  autoAssign: false,
  autoAssignTip:
    '开启后，员工登录企业微信时将自动分配接口许可密钥，无需手动操作。关闭后需管理员手动开通或批量分配。',
  accountSummary: {
    basicTotal: 50,
    basicUsed: 7,
    basicAvailable: 43,
    externalTotal: 20,
    externalUsed: 3,
    externalAvailable: 17,
    expireDate: '2027-06-30',
  },
};

const PurchaseLicenseEmployees = [
  { id: 1, name: '范朝阳', phone: '15812340448', wechat: 'fanchaoyang_wx', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 2, name: '方波', phone: '15812340448', wechat: 'fangbo2024', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 3, name: '范思琪', phone: '15812340448', wechat: 'fansiqisiqi', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 4, name: '胡慧慧', phone: '15812340448', wechat: 'huhuihui88', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 5, name: '范凯强', phone: '15812340448', wechat: 'fankaiqiang', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 6, name: '黄杰', phone: '15812340448', wechat: 'huangjie_sc', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 7, name: '黄丽', phone: '15812340448', wechat: 'huangli_wx', dept: '智达科技', basicOpened: false, externalOpened: false },
  { id: 8, name: '李明', phone: '13987651234', wechat: 'liming_zd', dept: '智达科技', basicOpened: true, externalOpened: false, basicLicense: 'LIC-B-20260301-001', basicCreateTime: '2026-03-01 10:00', basicActivateTime: '2026-03-01 10:05', basicExpireTime: '2027-06-30 23:59' },
  { id: 9, name: '王芳', phone: '13698765432', wechat: 'wangfang_zd', dept: '智达科技', basicOpened: true, externalOpened: true, basicLicense: 'LIC-B-20260302-002', basicCreateTime: '2026-03-02 09:30', basicActivateTime: '2026-03-02 09:35', basicExpireTime: '2027-06-30 23:59', externalLicense: 'LIC-E-20260302-001', externalCreateTime: '2026-03-02 09:40', externalActivateTime: '2026-03-02 09:45', externalExpireTime: '2027-06-30 23:59' },
  { id: 10, name: '张伟', phone: '13765432109', wechat: 'zhangwei_zd', dept: '华东区', basicOpened: false, externalOpened: false },
  { id: 11, name: '刘洋', phone: '13543210987', wechat: 'liuyang_zd', dept: '华东区', basicOpened: true, externalOpened: false, basicLicense: 'LIC-B-20260305-003', basicCreateTime: '2026-03-05 14:20', basicActivateTime: '2026-03-05 14:25', basicExpireTime: '2027-06-30 23:59' },
  { id: 12, name: '陈静', phone: '13876543210', wechat: 'chenjing_zd', dept: '华南二区', basicOpened: false, externalOpened: false },
];

const PurchaseLicenseOrders = [
  { id: 'ORD20260301001', type: '基础账号', count: 50, amount: '2500.00', status: '已完成', payTime: '2026-03-01 09:00', expireDate: '2027-06-30' },
  { id: 'ORD20260301002', type: '互通账号', count: 20, amount: '4000.00', status: '已完成', payTime: '2026-03-01 09:15', expireDate: '2027-06-30' },
  { id: 'ORD20260215001', type: '基础账号', count: 10, amount: '500.00', status: '已完成', payTime: '2026-02-15 11:30', expireDate: '2027-02-14' },
];

function escapeHtmlPl(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || '—';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
