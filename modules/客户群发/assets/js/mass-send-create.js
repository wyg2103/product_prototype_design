/**
 * 新建客户群发
 */
(function () {
  const DEMO_STAFF = ['程翠翠', '李沙', '朱晓涛'];

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function updatePreview() {
    const text = document.getElementById('welcomeText').value.trim();
    const bubble = document.getElementById('previewBubble');
    if (text) {
      bubble.textContent = text;
      bubble.classList.remove('empty');
    } else {
      bubble.textContent = '输入欢迎语后在此预览';
      bubble.classList.add('empty');
    }
  }

  function bindCounter(inputId, countId) {
    const input = document.getElementById(inputId);
    const count = document.getElementById(countId);
    input.addEventListener('input', () => {
      count.textContent = input.value.length;
      if (inputId === 'welcomeText') updatePreview();
    });
  }

  function bindOptionCards() {
    document.querySelectorAll('.option-cards, .segment-control').forEach((group) => {
      group.querySelectorAll('label.option-card, label.segment-item').forEach((label) => {
        label.addEventListener('click', () => {
          const name = label.querySelector('input')?.name;
          if (!name) return;
          document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
            input.closest('label')?.classList.toggle('active', input === label.querySelector('input'));
          });
        });
      });
    });
  }

  function getStaffNames() {
    return [...document.querySelectorAll('.staff-chip')].map((el) => el.dataset.name);
  }

  function renderStaffChips(names) {
    const container = document.getElementById('staffChips');
    container.innerHTML = names
      .map(
        (name) => `
      <span class="staff-chip" data-name="${name}">
        <span class="avatar">${name.charAt(0)}</span>
        ${name}
        <button type="button" class="remove" aria-label="移除">×</button>
      </span>`
      )
      .join('');

    container.querySelectorAll('.remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('.staff-chip')?.remove();
      });
    });
  }

  function init() {
    bindCounter('taskName', 'nameCount');
    bindCounter('welcomeText', 'welcomeCount');
    bindOptionCards();
    renderStaffChips(['程翠翠']);

    const toggle = document.getElementById('toggleRange');
    const toggleLabel = document.getElementById('toggleLabel');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
      toggleLabel.textContent = toggle.classList.contains('on')
        ? '已开启，员工可调整发送范围'
        : '已关闭，员工不可调整发送范围';
    });

    document.getElementById('btnAddStaff').addEventListener('click', () => {
      const existing = getStaffNames();
      const next = DEMO_STAFF.find((n) => !existing.includes(n));
      if (next) {
        renderStaffChips([...existing, next]);
        showToast(`已添加员工「${next}」`);
      } else {
        showToast('演示数据已全部添加');
      }
    });

    document.getElementById('btnViewEstimate').addEventListener('click', (e) => {
      e.preventDefault();
      showToast('预估可触达 128 人');
    });

    document.getElementById('btnAddAttach').addEventListener('click', () => {
      showToast('请选择要上传的附件');
    });

    document.querySelectorAll('.tool-chip').forEach((btn) => {
      btn.addEventListener('click', () => showToast(`已选择：${btn.textContent.trim()}`));
    });

    document.getElementById('btnSave').addEventListener('click', () => showToast('草稿已保存'));
    document.getElementById('btnPublish').addEventListener('click', () => {
      showToast('保存并发布成功');
      setTimeout(() => { location.href = 'mass-send.html'; }, 800);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
