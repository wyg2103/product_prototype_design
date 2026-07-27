# 官方朋友圈

## 范围与入口

- 商家后台：`prototype/index.html`（列表）、`moment-create.html`（创建/发布）、`detail.html`（详情）。
- 企微客户端员工端：`employee-messages.html`（消息入口）→ `employee-assistant.html`（企迈企微助手）→ `employee-task-list.html`（任务列表）→ `employee-moment-publish.html`（个人发表）。
- 企业发表入口及待办展示：`employee-moments.html`、`employee-moment-pending.html`。
- `employee-workbench.html` 为员工端跳转入口。

## 商家后台与企微客户端联动

1. 商家后台创建并发布个人发表任务后，任务在员工端的「企迈企微助手」中可见，员工可进入任务详情并发表。
2. 企业发表走企微「客户朋友圈」路径；下发成功后对应 `moment_id`，以支持终止任务。
3. 任务状态统一为待发布、执行中、已终止。计划终止时间、实际终止时间、终止原因在两端的展示与拦截规则必须一致。
4. 已发表的客户朋友圈不能撤回；终止只阻止尚未发表或补发的员工任务。

## 迭代检查

- 修改创建、发布、终止或状态字段时，至少检查列表、详情、员工任务列表和员工发表页。
- 修改企业发表规则时，检查 `moment_id` 与企业客户端展示；修改个人发表规则时，检查助手消息与个人发表链路。
- 对应 PRD 与截图：`../../docs/prd/官方朋友圈/`。
