/**
 * 组件库 · 批量调整导入
 * 步骤：1 上传文件 → 2 数据导入（校验）→ 3 完成导入
 */
(function () {
  const RISK_LABEL = {
    1: '极低风险',
    2: '低风险',
    3: '中低风险',
    4: '中风险',
    5: '中高风险',
    6: '高风险',
    7: '极高风险',
  };

  /** 模拟上传后解析出的数据 */
  const MOCK_ROWS = [
    {
      id: 1,
      phone: '示例：15011112222',
      risk: '5',
      reason: '经常刷单退款',
      error: '数据无效',
      editing: false,
    },
    {
      id: 2,
      phone: '13812345678',
      risk: '3',
      reason: '疑似异常下单',
      error: '',
      editing: false,
    },
    {
      id: 3,
      phone: '13900001111',
      risk: '6',
      reason: '高频退款投诉',
      error: '',
      editing: false,
    },
  ];

  let step = 1;
  let rows = [];
  let fileName = '';
  let importResult = { ok: 0, skip: 0 };

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function openModal() {
    resetState();
    $('batchImportModal').classList.add('show');
    $('batchImportModal').setAttribute('aria-hidden', 'false');
    render();
  }

  function closeModal() {
    $('batchImportModal').classList.remove('show');
    $('batchImportModal').setAttribute('aria-hidden', 'true');
  }

  function resetState() {
    step = 1;
    rows = [];
    fileName = '';
    importResult = { ok: 0, skip: 0 };
    $('biErrorOnly').checked = true;
    $('biFileName').hidden = true;
    $('biFileName').textContent = '';
    $('biFileInput').value = '';
  }

  function setStep(n) {
    step = n;
    document.querySelectorAll('#biStepper .bi-step').forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.toggle('active', s === step);
      el.classList.toggle('done', s < step);
    });
    document.querySelectorAll('.bi-panel').forEach((p) => p.classList.remove('active'));
    $(`biStep${step}`).classList.add('active');

    const errorOnlyWrap = $('biErrorOnlyWrap');
    const btnImport = $('biImport');
    const btnDone = $('biDone');
    const btnCancel = $('biCancel');

    btnCancel.hidden = false;
    if (step === 1) {
      errorOnlyWrap.hidden = true;
      btnImport.hidden = true;
      btnDone.hidden = true;
      btnCancel.textContent = '取消';
    } else if (step === 2) {
      errorOnlyWrap.hidden = false;
      btnImport.hidden = false;
      btnDone.hidden = true;
      btnCancel.textContent = '取消';
      renderTable();
    } else {
      errorOnlyWrap.hidden = true;
      btnImport.hidden = true;
      btnDone.hidden = false;
      btnCancel.hidden = true;
      renderSuccess();
    }
  }

  function handleFile(file) {
    if (!file) return;
    const ok = /\.(xlsx|xls|csv)$/i.test(file.name);
    if (!ok) {
      showToast('请上传 Excel / CSV 文件');
      return;
    }
    fileName = file.name;
    $('biFileName').hidden = false;
    $('biFileName').textContent = `已选择：${fileName}`;
    // 原型：选择文件后进入数据校验步骤
    rows = MOCK_ROWS.map((r) => ({ ...r }));
    showToast('文件解析完成，请核对数据');
    setTimeout(() => setStep(2), 400);
  }

  function visibleRows() {
    const onlyError = $('biErrorOnly').checked;
    if (onlyError) return rows.filter((r) => r.error);
    return rows;
  }

  function updateAlert() {
    const total = rows.length;
    const err = rows.filter((r) => r.error).length;
    $('biAlert').textContent = `预计导入 ${total} 条数据，其中 ${err} 条可能有误，请按照提示调整后再导入。(有误数据，将会跳过不会导入系统)`;
  }

  function renderTable() {
    updateAlert();
    const list = visibleRows();
    const tbody = $('biTableBody');
    const empty = $('biEmpty');

    if (!list.length) {
      tbody.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    tbody.innerHTML = list
      .map((r) => {
        if (r.editing) {
          return `
          <tr data-id="${r.id}">
            <td><input class="bi-edit-input" data-field="phone" value="${escapeHtml(r.phone)}" /></td>
            <td><input class="bi-edit-input" data-field="risk" value="${escapeHtml(r.risk)}" /></td>
            <td><input class="bi-edit-input" data-field="reason" value="${escapeHtml(r.reason)}" /></td>
            <td>
              <a class="bi-link" data-act="save">保存</a>
              <a class="bi-link" data-act="cancel">取消</a>
            </td>
          </tr>`;
        }
        return `
        <tr data-id="${r.id}">
          <td>
            ${escapeHtml(r.phone)}
            ${r.error ? `<div class="bi-cell-error">${escapeHtml(r.error)}</div>` : ''}
          </td>
          <td>${escapeHtml(r.risk)}${RISK_LABEL[r.risk] ? `（${RISK_LABEL[r.risk]}）` : ''}</td>
          <td>${escapeHtml(r.reason)}</td>
          <td>
            <a class="bi-link" data-act="edit">修改</a>
            <a class="bi-link" data-act="delete">删除</a>
          </td>
        </tr>`;
      })
      .join('');

    tbody.querySelectorAll('[data-act]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = Number(a.closest('tr').dataset.id);
        const row = rows.find((x) => x.id === id);
        if (!row) return;
        const act = a.dataset.act;
        if (act === 'edit') {
          row._backup = { phone: row.phone, risk: row.risk, reason: row.reason, error: row.error };
          row.editing = true;
          renderTable();
        } else if (act === 'delete') {
          rows = rows.filter((x) => x.id !== id);
          renderTable();
          showToast('已删除该行');
        } else if (act === 'cancel') {
          if (row._backup) Object.assign(row, row._backup);
          row.editing = false;
          renderTable();
        } else if (act === 'save') {
          const tr = a.closest('tr');
          row.phone = tr.querySelector('[data-field="phone"]').value.trim();
          row.risk = tr.querySelector('[data-field="risk"]').value.trim();
          row.reason = tr.querySelector('[data-field="reason"]').value.trim();
          // 简单校验：示例开头 / 非 11 位手机号视为无效
          const phoneOk = /^1\d{10}$/.test(row.phone);
          row.error = phoneOk ? '' : '数据无效';
          if (!row.risk || Number(row.risk) < 1 || Number(row.risk) > 7) {
            row.error = row.error || '风险等级无效';
          }
          if (!row.reason || row.reason.length > 50) {
            row.error = row.error || '操作原因无效';
          }
          row.editing = false;
          renderTable();
          showToast(row.error ? '已保存，但仍有校验错误' : '已保存');
        }
      });
    });
  }

  function doImport() {
    const valid = rows.filter((r) => !r.error);
    const skip = rows.filter((r) => r.error).length;
    if (!rows.length) {
      showToast('没有可导入的数据');
      return;
    }
    importResult = { ok: valid.length, skip };
    setStep(3);
  }

  function renderSuccess() {
    $('biSuccessText').textContent = `成功导入 ${importResult.ok} 条数据，跳过 ${importResult.skip} 条错误数据。`;
    const list = $('biSuccessList');
    list.innerHTML = `
      <li><strong>文件：</strong>${escapeHtml(fileName || '未命名文件')}</li>
      <li><strong>成功：</strong>${importResult.ok} 条</li>
      <li><strong>跳过：</strong>${importResult.skip} 条（有误数据未入库）</li>
    `;
    $('biCancel').hidden = true;
  }

  function render() {
    setStep(step);
  }

  function bind() {
    $('btnOpenBatchImport').addEventListener('click', openModal);
    $('biClose').addEventListener('click', closeModal);
    $('biCancel').addEventListener('click', closeModal);
    $('biDone').addEventListener('click', closeModal);
    $('biImport').addEventListener('click', doImport);

    $('batchImportModal').addEventListener('click', (e) => {
      if (e.target.id === 'batchImportModal') closeModal();
    });

    $('biDownloadTpl').addEventListener('click', (e) => {
      e.preventDefault();
      showToast('模板已开始下载（原型演示）');
    });

    $('biSelectFile').addEventListener('click', () => $('biFileInput').click());
    $('biFileInput').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      handleFile(file);
    });

    const zone = $('biDropzone');
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file);
    });

    $('biErrorOnly').addEventListener('change', renderTable);

    // 支持 URL 参数直接打开
    if (new URLSearchParams(location.search).get('open') === '1') {
      openModal();
    }
  }

  document.addEventListener('DOMContentLoaded', bind);
})();
