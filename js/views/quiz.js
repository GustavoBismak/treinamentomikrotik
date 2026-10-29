// VIEW: AVALIAÇÃO TEÓRICA E PRÁTICA DO MÓDULO (CRITÉRIO MÍNIMO 80%)
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderQuiz(container, moduleId) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando banco de questões do módulo...</div>
    </div>
  `;

  try {
    const { questions, last_attempt } = await API.getQuiz(moduleId);

    if (questions.length === 0) {
      container.innerHTML = `
        <div class="card" style="max-width:600px; margin:40px auto; text-align:center;">
          <h2 style="font-size:18px; margin-bottom:8px;">Avaliação em Elaboração</h2>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
            O banco de questões deste módulo está sendo homologado pela equipe de engenharia e instrutores.
          </p>
          <a href="#syllabus" class="btn btn-secondary">Voltar para a Grade</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="quiz-container">
        <!-- Topo com Navegação e Regras -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <a href="#syllabus" style="font-size:12px; color:var(--accent-light); text-decoration:none;">
            &larr; Voltar para a Grade do Curso
          </a>
          <span class="badge badge-warning">Critério de Aprovação: 80% Mínimo</span>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
            <div>
              <h1 class="page-title" style="font-size:18px; margin-bottom:4px;">Avaliação Técnica: Módulo ${escapeHtml(moduleId.toUpperCase())}</h1>
              <p style="font-size:13px; color:var(--text-secondary);">
                Responda com atenção às questões teóricas e práticas de interpretação de comandos CLI do RouterOS.
              </p>
            </div>
            ${last_attempt ? `
              <div style="text-align:right;">
                <span class="badge ${last_attempt.passed ? 'badge-success' : 'badge-danger'}">
                  Última Nota: ${last_attempt.percentage}% (${last_attempt.passed ? 'Aprovado' : 'Reprovado'})
                </span>
              </div>
            ` : ''}
          </div>

          <form id="quiz-form">
            ${questions.map((q, idx) => `
              <div class="question-item">
                <div class="question-title">
                  <span class="question-num">Questão ${idx + 1} de ${questions.length}:</span>
                  <span>${escapeHtml(q.question_text)}</span>
                </div>

                <div class="options-list">
                  ${q.options.map((opt, optIdx) => `
                    <label class="option-label" data-q="${q.id}" data-opt="${optIdx}">
                      <input type="radio" name="answer_${q.id}" value="${optIdx}" required />
                      <span>${escapeHtml(opt)}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; padding-top:16px; border-top:1px solid var(--border-subtle);">
              <span style="font-size:12px; color:var(--text-muted);">
                Total de questões: ${questions.length} • Cada questão possui peso equivalente.
              </span>
              <button type="submit" class="btn btn-primary" id="btn-submit-quiz">
                <span>Finalizar Avaliação e Gravar Nota</span>
              </button>
            </div>
          </form>

          <div id="quiz-result-area" style="margin-top:24px; display:none;"></div>
        </div>
      </div>
    `;

    // Highlight nas labels de opções selecionadas
    container.querySelectorAll('.option-label input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const qName = radio.name;
        container.querySelectorAll(`input[name="${qName}"]`).forEach(r => {
          r.closest('.option-label').classList.remove('selected');
        });
        radio.closest('.option-label').classList.add('selected');
      });
    });

    // Submissão do questionário
    const form = container.querySelector('#quiz-form');
    const resultArea = container.querySelector('#quiz-result-area');
    const submitBtn = container.querySelector('#btn-submit-quiz');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processando nota no servidor...';

      const answers = {};
      questions.forEach(q => {
        const selected = form.querySelector(`input[name="answer_${q.id}"]:checked`);
        if (selected) answers[q.id] = parseInt(selected.value, 10);
      });

      try {
        const result = await API.submitQuiz(moduleId, answers);

        resultArea.style.display = 'block';
        resultArea.innerHTML = `
          <div class="quiz-score-banner ${result.passed ? 'passed' : 'failed'}">
            <div class="quiz-score-circle">${result.percentage}%</div>
            <h2 style="font-size:18px; font-weight:700;">
              ${result.passed ? 'Parabéns! Você foi APROVADO nesta avaliação.' : 'Você Não Atingiu o Critério Mínimo de 80%.'}
            </h2>
            <p style="font-size:13px; color:var(--text-secondary); max-width:600px;">
              ${result.passed
                ? 'Sua competência técnica neste módulo foi validada com sucesso e adicionada ao seu prontuário operacional.'
                : 'Revise o conteúdo da aula, estude os comandos e diagnósticos na bancada e realize uma nova tentativa para obter aprovação.'}
            </p>
            <div style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">
              Acertos: ${result.score} de ${result.total_questions} questões (Tentativa #${result.attempt_number})
            </div>
          </div>

          <div style="margin-top:24px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-primary); margin-bottom:12px;">
              Gabarito Técnico Comentado:
            </h3>
            ${result.review.map((item, idx) => `
              <div class="review-item ${item.is_correct ? 'correct' : 'incorrect'}">
                <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
                  <span style="color:var(--text-primary);">Questão ${idx + 1}</span>
                  <span style="color:${item.is_correct ? 'var(--status-success)' : 'var(--status-danger)'};">
                    ${item.is_correct ? '✓ Correta' : '✗ Incorreta'}
                  </span>
                </div>
                <div class="review-explanation">
                  <strong style="color:var(--text-primary); display:block; margin-bottom:4px;">Fundamentação Técnica Oficial:</strong>
                  ${escapeHtml(item.explanation)}
                </div>
              </div>
            `).join('')}
          </div>
        `;

        resultArea.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        alert('Erro ao submeter avaliação: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Refazer Avaliação';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card" style="border-color:var(--status-danger);">Erro: ${err.message}</div>`;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
