/**
 * 群发问题自查助手
 */
(function () {
  const g = MassSendGuide;
  let quizStep = 0;
  let activeScenario = null;

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function levelLabel(level) {
    if (level === 'high') return '<span class="level-tag high">优先检查</span>';
    if (level === 'medium') return '<span class="level-tag medium">建议检查</span>';
    return '<span class="level-tag low">可选</span>';
  }

  function renderScenarios() {
    document.getElementById('scenarioGrid').innerHTML = g.scenarios
      .map(
        (s) => `
      <button type="button" class="scenario-card" data-id="${s.id}" style="--accent:${s.color}">
        <span class="scenario-icon">${s.icon}</span>
        <span class="scenario-title">${esc(s.title)}</span>
        <span class="scenario-desc">${esc(s.desc)}</span>
        <span class="scenario-arrow">开始排查 →</span>
      </button>`
      )
      .join('');

    document.querySelectorAll('.scenario-card').forEach((btn) => {
      btn.addEventListener('click', () => openScenario(btn.dataset.id));
    });
  }

  function openScenario(id) {
    const scenario = g.scenarios.find((s) => s.id === id);
    const checks = g.checks[id];
    if (!scenario || !checks) return;

    activeScenario = id;
    document.getElementById('checkSectionTitle').textContent = scenario.title;
    document.getElementById('checkSectionDesc').textContent = scenario.desc;
    document.getElementById('checkList').innerHTML = checks
      .map(
        (c, i) => `
      <article class="check-item" data-id="${c.id}">
        <div class="check-item-head">
          <span class="check-num">${i + 1}</span>
          <div class="check-item-title-wrap">
            <h3>${esc(c.title)} ${levelLabel(c.level)}</h3>
            <p class="check-plain">${esc(c.plain)}</p>
          </div>
          <label class="check-done"><input type="checkbox" class="check-box" /> 已核对</label>
        </div>
        <div class="check-item-body">
          <div class="check-block">
            <strong>怎么查</strong>
            <p>${esc(c.howTo)}</p>
          </div>
          <div class="check-block fix">
            <strong>解决办法</strong>
            <p>${esc(c.fix)}</p>
          </div>
        </div>
      </article>`
      )
      .join('');

    document.getElementById('checkSection').classList.remove('hidden');
    document.getElementById('checkSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.querySelectorAll('.check-box').forEach((box) => {
      box.addEventListener('change', updateProgress);
    });
    updateProgress();
  }

  function updateProgress() {
    const total = document.querySelectorAll('.check-box').length;
    const done = document.querySelectorAll('.check-box:checked').length;
    const summary = document.getElementById('checkSummary');
    if (done === total && total > 0) {
      summary.classList.add('all-done');
      summary.querySelector('p').innerHTML =
        `您已完成全部 ${total} 项核对。若问题仍在，请查看 <a href="mass-send-stats.html">任务下发情况</a> 中的员工/客户明细，或联系客服。`;
    } else {
      summary.classList.remove('all-done');
    }
  }

  function renderQuickQuiz() {
    renderQuizStep();
  }

  function renderQuizStep() {
    const container = document.getElementById('quickQuiz');
    const resultEl = document.getElementById('quizResult');
    resultEl.classList.add('hidden');

    if (quizStep >= g.quickQuiz.length) {
      container.innerHTML = '';
      return;
    }

    const step = g.quickQuiz[quizStep];
    container.innerHTML = `
      <div class="quiz-progress">问题 ${quizStep + 1} / ${g.quickQuiz.length}</div>
      <p class="quiz-question">${esc(step.q)}</p>
      <div class="quiz-options">
        ${step.options
          .map(
            (opt, i) =>
              `<button type="button" class="quiz-opt" data-idx="${i}">${esc(opt.text)}</button>`
          )
          .join('')}
      </div>`;

    container.querySelectorAll('.quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const opt = step.options[parseInt(btn.dataset.idx, 10)];
        if (opt.scenario) {
          showQuizResult(opt.scenario);
        } else if (opt.next != null) {
          quizStep = opt.next;
          renderQuizStep();
        }
      });
    });
  }

  function showQuizResult(scenarioId) {
    const scenario = g.scenarios.find((s) => s.id === scenarioId);
    const quizEl = document.getElementById('quickQuiz');
    const resultEl = document.getElementById('quizResult');

    quizEl.innerHTML = '';
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `
      <div class="quiz-result-box">
        <p class="quiz-result-label">根据您的回答，建议先排查：</p>
        <p class="quiz-result-title">${scenario.icon} ${esc(scenario.title)}</p>
        <p class="quiz-result-desc">${esc(scenario.desc)}</p>
        <div class="quiz-result-actions">
          <button type="button" class="btn-primary" id="btnGoScenario">查看排查步骤</button>
          <button type="button" class="btn-outline" id="btnRetryQuiz">重新答题</button>
        </div>
      </div>`;

    document.getElementById('btnGoScenario').addEventListener('click', () => openScenario(scenarioId));
    document.getElementById('btnRetryQuiz').addEventListener('click', () => {
      quizStep = 0;
      resultEl.classList.add('hidden');
      renderQuizStep();
    });
  }

  function renderFaq() {
    document.getElementById('faqList').innerHTML = g.faq
      .map(
        (f, i) => `
      <details class="faq-item" ${i === 0 ? 'open' : ''}>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`
      )
      .join('');
  }

  function init() {
    document.getElementById('guideTitle').textContent = g.intro.title;
    document.getElementById('guideDesc').textContent = g.intro.desc;

    renderScenarios();
    renderQuickQuiz();
    renderFaq();

    document.getElementById('btnBackScenarios').addEventListener('click', () => {
      document.getElementById('checkSection').classList.add('hidden');
      activeScenario = null;
      document.getElementById('scenarioGrid').scrollIntoView({ behavior: 'smooth' });
    });

    const params = new URLSearchParams(location.search);
    const scene = params.get('scene');
    if (scene && g.checks[scene]) {
      openScenario(scene);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
