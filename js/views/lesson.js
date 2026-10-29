// VIEW: VISUALIZADOR DE AULA (PADRÃO TÉCNICO COMPLETO DE 18 SEÇÕES OBRIGATÓRIAS)
import { API } from '../api.js';
import { getIcon } from '../icons.js';
import { renderTopologyDiagram } from '../components/topologyDiagram.js';
import { renderWinBoxSimulator } from '../components/winboxSimulator.js';
import { renderTerminalEmulator } from '../components/terminalEmulator.js';

export async function renderLesson(container, lessonId) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando aula e bancada de simulação...</div>
    </div>
  `;

  try {
    const { lesson } = await API.getLesson(lessonId);
    const content = lesson.content;

    container.innerHTML = `
      <div class="container">
        <!-- Navegação Superior -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <a href="#syllabus" style="font-size:12px; color:var(--accent-light); text-decoration:none; display:flex; align-items:center; gap:6px;">
            &larr; Voltar para a Grade do Curso
          </a>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge ${lesson.status === 'completed' ? 'badge-success' : 'badge-warning'}">
              ${lesson.status === 'completed' ? '✓ Concluída e Validada' : 'Em Andamento'}
            </span>
            <button id="btn-complete-lesson" class="btn btn-sm btn-primary">
              ${lesson.status === 'completed' ? 'Marcar Novamente' : 'Concluir Aula e Prática'}
            </button>
          </div>
        </div>

        <!-- Cabeçalho da Aula -->
        <div class="lesson-header" style="margin-bottom:24px;">
          <div class="lesson-meta">
            <span class="badge badge-info">${escapeHtml(lesson.module_title)}</span>
            <span style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">Aula ${lesson.lesson_number} • Carga Horária: ${lesson.duration_minutes} min</span>
          </div>
          <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
        </div>

        <div class="lesson-layout">
          <!-- Coluna Principal com as 18 Seções Técnicas -->
          <div class="lesson-main">

            <!-- 1. Objetivo de Aprendizagem -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">1</span>
                <span class="tech-section-title">Objetivo de Aprendizagem</span>
              </div>
              <div class="tech-section-body">
                <p><strong>Meta Técnica:</strong> ${escapeHtml(content.objective)}</p>
              </div>
            </div>

            <!-- 2. Explicação Teórica em Linguagem Simples -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">2</span>
                <span class="tech-section-title">Explicação Teórica Simples</span>
              </div>
              <div class="tech-section-body">
                <p>${escapeHtml(content.simple_theory)}</p>
              </div>
            </div>

            <!-- 3. Conceitos Técnicos Detalhados -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">3</span>
                <span class="tech-section-title">Conceitos Técnicos Detalhados (RFCs, Camadas e Kernel)</span>
              </div>
              <div class="tech-section-body">
                <p>${escapeHtml(content.technical_concepts)}</p>
              </div>
            </div>

            <!-- 4. Aplicação Real em Provedor / Empresa -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">4</span>
                <span class="tech-section-title">Aplicação Real no Cenário de Provedor e Telecom</span>
              </div>
              <div class="tech-section-body">
                <p>${escapeHtml(content.real_application)}</p>
              </div>
            </div>

            <!-- 5. Diagrama da Topologia de Rede -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">5</span>
                <span class="tech-section-title">Diagrama da Topologia de Rede</span>
              </div>
              <div class="tech-section-body">
                <div id="lesson-topology-container" class="topology-viewer"></div>
                <p style="font-size:12px; color:var(--text-muted); margin-top:10px;">
                  ${escapeHtml(content.topology?.description || '')}
                </p>
              </div>
            </div>

            <!-- 6. Lista de Equipamentos e Pré-requisitos -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">6</span>
                <span class="tech-section-title">Equipamentos e Pré-requisitos Técnicos</span>
              </div>
              <div class="tech-section-body">
                <ul style="padding-left:20px; display:flex; flex-direction:column; gap:6px;">
                  ${(content.prerequisites || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- 7. Procedimento Passo a Passo -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">7</span>
                <span class="tech-section-title">Procedimento Operacional Passo a Passo</span>
              </div>
              <div class="tech-section-body">
                <div class="procedure-list">
                  ${(content.step_by_step || []).map((step, idx) => `
                    <div class="procedure-item">
                      <span class="procedure-step-badge">Etapa ${idx + 1}</span>
                      <div class="procedure-text">${escapeHtml(step)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- 8 & 9. Configuração Gráfica (WinBox) e Terminal RouterOS (com Tabs) -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">8/9</span>
                <span class="tech-section-title">Laboratório de Configuração: WinBox vs Terminal RouterOS</span>
              </div>
              
              <div class="config-tabs">
                <button class="config-tab-btn active" id="tab-btn-winbox">
                  <span>Simulador WinBox</span>
                </button>
                <button class="config-tab-btn" id="tab-btn-cli">
                  <span>Terminal RouterOS CLI</span>
                </button>
              </div>

              <div class="tech-section-body">
                <div id="tab-content-winbox">
                  <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
                    Execute os passos abaixo na interface gráfica do WinBox:
                  </p>
                  <ul style="padding-left:20px; margin-bottom:16px; font-size:13px; display:flex; flex-direction:column; gap:4px;">
                    ${(content.winbox_steps || []).map(s => `<li><code>${escapeHtml(s)}</code></li>`).join('')}
                  </ul>
                  <div id="lesson-winbox-container"></div>
                </div>

                <div id="tab-content-cli" style="display:none;">
                  <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
                    Script equivalente para terminal RouterOS:
                  </p>
                  <div class="code-block">
                    <div class="code-header">
                      <span>ROUTEROS SCRIPT CLI</span>
                      <button class="btn-copy-code" id="btn-copy-script">Copiar Script</button>
                    </div>
                    <pre><code>${(content.cli_commands || []).join('\n')}</code></pre>
                  </div>
                  <div id="lesson-terminal-container"></div>
                </div>
              </div>
            </div>

            <!-- 10. Explicação do que Cada Comando Faz -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">10</span>
                <span class="tech-section-title">Análise Detalhada dos Comandos e Parâmetros</span>
              </div>
              <div class="tech-section-body">
                <table class="command-table">
                  <thead>
                    <tr>
                      <th style="width:45%">Comando RouterOS</th>
                      <th>Finalidade Técnica e Impacto no Kernel</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(content.command_explanations || []).map(c => `
                      <tr>
                        <td><code>${escapeHtml(c.cmd)}</code></td>
                        <td>${escapeHtml(c.exp)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 11. Resultado Esperado -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">11</span>
                <span class="tech-section-title">Resultado Esperado após Aplicação</span>
              </div>
              <div class="tech-section-body">
                <p>${escapeHtml(content.expected_output)}</p>
              </div>
            </div>

            <!-- 12. Testes de Validação -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">12</span>
                <span class="tech-section-title">Testes de Homologação e Validação Técnica</span>
              </div>
              <div class="tech-section-body">
                <ul style="padding-left:20px; display:flex; flex-direction:column; gap:6px;">
                  ${(content.validation_tests || []).map(t => `<li><strong>${escapeHtml(t)}</strong></li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- 13. Erros Comuns e suas Causas -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">13</span>
                <span class="tech-section-title">Erros Comuns em Campo (Gotchas) e Causas Raiz</span>
              </div>
              <div class="tech-section-body">
                ${(content.common_gotchas || []).map(g => `
                  <div class="callout callout-warning">
                    <div class="callout-title">${getIcon('alert')} Causa e Prevenção:</div>
                    <div>${escapeHtml(g)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 14. Procedimento de Diagnóstico -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">14</span>
                <span class="tech-section-title">Procedimento de Diagnóstico em Caso de Falha</span>
              </div>
              <div class="tech-section-body">
                <ol style="padding-left:20px; display:flex; flex-direction:column; gap:6px;">
                  ${(content.diagnostic_procedure || []).map(d => `<li>${escapeHtml(d)}</li>`).join('')}
                </ol>
              </div>
            </div>

            <!-- 15. Medidas de Segurança e Recuperação -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">15</span>
                <span class="tech-section-title">Medidas de Segurança Operacional e Recuperação de Desastre</span>
              </div>
              <div class="tech-section-body">
                ${(content.security_measures || []).map(m => `
                  <div class="callout callout-danger">
                    <div class="callout-title">${getIcon('shield')} Regra de Segurança:</div>
                    <div>${escapeHtml(m)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 16. Exercício Prático -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">16</span>
                <span class="tech-section-title">Exercício Prático de Bancada</span>
              </div>
              <div class="tech-section-body">
                <p>${escapeHtml(content.practical_exercise)}</p>
              </div>
            </div>

            <!-- 17. Questionário de Fixação -->
            ${content.quiz ? `
              <div class="tech-section">
                <div class="tech-section-header">
                  <span class="tech-section-number">17</span>
                  <span class="tech-section-title">Questão de Fixação Técnica</span>
                </div>
                <div class="tech-section-body">
                  <p style="font-weight:600; margin-bottom:12px;">${escapeHtml(content.quiz.question)}</p>
                  <div style="display:flex; flex-direction:column; gap:8px;" id="lesson-quiz-options">
                    ${content.quiz.options.map((opt, i) => `
                      <label class="option-label" data-idx="${i}">
                        <input type="radio" name="lesson_q" value="${i}" />
                        <span>${escapeHtml(opt)}</span>
                      </label>
                    `).join('')}
                  </div>
                  <div id="lesson-quiz-feedback" style="margin-top:12px; display:none;"></div>
                </div>
              </div>
            ` : ''}

            <!-- 18. Critérios para Considerar Concluído -->
            <div class="tech-section">
              <div class="tech-section-header">
                <span class="tech-section-number">18</span>
                <span class="tech-section-title">Critérios de Homologação da Atividade</span>
              </div>
              <div class="tech-section-body">
                <p><strong>Requisitos de Conclusão:</strong> ${escapeHtml(content.completion_criteria)}</p>
              </div>
            </div>

          </div>

          <!-- Coluna Lateral de Apoio Técnico -->
          <div class="lesson-sidebar">
            <div class="card" style="position:sticky; top:20px;">
              <div class="card-header">
                <div class="card-title"><span>Navegação Rápida</span></div>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
                <a href="#lab1" class="btn btn-sm btn-secondary" style="width:100%; justify-content:flex-start;">
                  ${getIcon('terminal')} <span>Praticar em Laboratório</span>
                </a>
                <a href="#quiz/${lesson.module_id}" class="btn btn-sm btn-secondary" style="width:100%; justify-content:flex-start;">
                  ${getIcon('award')} <span>Fazer Prova do Módulo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Renderiza componentes interativos
    if (content.topology) {
      renderTopologyDiagram('lesson-topology-container', content.topology);
    }
    renderWinBoxSimulator('lesson-winbox-container', { identity: 'RTR-CORP-GW01', activeTab: 'ip_addresses' });
    renderTerminalEmulator('lesson-terminal-container', { identity: 'RTR-CORP-GW01', user: 'tecnico.admin' });

    // Alternar tabs WinBox / CLI
    const tabWb = container.querySelector('#tab-btn-winbox');
    const tabCli = container.querySelector('#tab-btn-cli');
    const contentWb = container.querySelector('#tab-content-winbox');
    const contentCli = container.querySelector('#tab-content-cli');

    tabWb.addEventListener('click', () => {
      tabWb.classList.add('active');
      tabCli.classList.remove('active');
      contentWb.style.display = 'block';
      contentCli.style.display = 'none';
    });

    tabCli.addEventListener('click', () => {
      tabCli.classList.add('active');
      tabWb.classList.remove('active');
      contentWb.style.display = 'none';
      contentCli.style.display = 'block';
    });

    // Copiar Script CLI
    const copyBtn = container.querySelector('#btn-copy-script');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = (content.cli_commands || []).join('\n');
        navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copiado!';
        setTimeout(() => { copyBtn.textContent = 'Copiar Script'; }, 2000);
      });
    }

    // Questionário de Fixação Interativo
    if (content.quiz) {
      const optionsContainer = container.querySelector('#lesson-quiz-options');
      const feedbackEl = container.querySelector('#lesson-quiz-feedback');

      optionsContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', e => {
          const selected = parseInt(e.target.value, 10);
          const isCorrect = selected === content.quiz.correct;

          feedbackEl.style.display = 'block';
          feedbackEl.className = isCorrect ? 'callout' : 'callout callout-danger';
          feedbackEl.innerHTML = `
            <div class="callout-title">${isCorrect ? '✓ Resposta Correta!' : '✗ Resposta Incorreta'}</div>
            <div>${escapeHtml(content.quiz.explanation)}</div>
          `;
        });
      });
    }

    // Botão Concluir Aula
    const completeBtn = container.querySelector('#btn-complete-lesson');
    completeBtn.addEventListener('click', async () => {
      try {
        completeBtn.disabled = true;
        completeBtn.textContent = 'Gravando no servidor...';
        await API.completeLesson(lessonId);
        completeBtn.textContent = '✓ Concluída com Sucesso';
        completeBtn.className = 'btn btn-sm btn-success';
      } catch (err) {
        completeBtn.disabled = false;
        completeBtn.textContent = 'Tentar Novamente';
        alert('Erro ao marcar conclusão: ' + err.message);
      }
    });

  } catch (err) {
    container.innerHTML = `
      <div class="card" style="max-width:600px; margin:40px auto; border-color:var(--status-danger);">
        <h3 style="color:var(--status-danger);">Falha ao carregar aula técnica</h3>
        <p style="font-size:13px; color:var(--text-secondary);">${err.message}</p>
      </div>
    `;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
