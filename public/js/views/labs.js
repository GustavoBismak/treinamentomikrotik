// VIEW: LABORATÓRIOS PRÁTICOS INTERATIVOS DE TROUBLESHOOTING ISP
import { API } from '../api.js';
import { getIcon } from '../icons.js';
import { renderTopologyDiagram } from '../components/topologyDiagram.js';

export async function renderLabs(container, labId = null) {
  if (!labId) {
    // Lista de laboratórios
    await renderLabsList(container);
  } else {
    // Laboratório específico em execução
    await renderLabWorkspace(container, labId);
  }
}

async function renderLabsList(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando laboratórios de simulação técnica...</div>
    </div>
  `;

  try {
    const { labs } = await API.getLabs();

    container.innerHTML = `
      <div class="container">
        <div style="margin-bottom:24px;">
          <h1 class="page-title">Laboratórios Práticos Interativos de Troubleshooting</h1>
          <p class="page-subtitle">Simulações de cenários de falhas reais em redes de provedores e empresas. Formule hipóteses, analise evidências com ferramentas RouterOS e aplique a correção padronizada.</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
          ${labs.map(lab => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-top: 3px solid ${lab.passed ? 'var(--status-success)' : 'var(--accent-primary)'};">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <span class="badge ${lab.difficulty === 'Básico' ? 'badge-info' : (lab.difficulty === 'Intermediário' ? 'badge-warning' : 'badge-danger')}">${lab.difficulty}</span>
                  ${lab.passed ? '<span class="badge badge-success">✓ Solucionado (100%)</span>' : '<span class="badge badge-warning">Pendente</span>'}
                </div>
                <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:8px; line-height:1.4;">${escapeHtml(lab.title)}</h3>
                <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px; line-height:1.5;">${escapeHtml(lab.description)}</p>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px;">
                <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${escapeHtml(lab.module_title)}</span>
                <a href="#lab/${lab.id}" class="btn btn-sm ${lab.passed ? 'btn-secondary' : 'btn-primary'}">
                  ${lab.passed ? 'Revisar Cenário' : 'Iniciar Diagnóstico'}
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="border-color:var(--status-danger);">Erro: ${err.message}</div>`;
  }
}

async function renderLabWorkspace(container, labId) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando bancada do cenário ${escapeHtml(labId)}...</div>
    </div>
  `;

  try {
    const { lab } = await API.getLab(labId);

    container.innerHTML = `
      <div class="container">
        <!-- Topo com Navegação -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <a href="#labs" style="font-size:12px; color:var(--accent-light); text-decoration:none;">
            &larr; Voltar para a lista de laboratórios
          </a>
          <span class="badge ${lab.difficulty === 'Básico' ? 'badge-info' : (lab.difficulty === 'Intermediário' ? 'badge-warning' : 'badge-danger')}">
            Dificuldade: ${lab.difficulty}
          </span>
        </div>

        <div style="margin-bottom:20px;">
          <h1 class="page-title">${escapeHtml(lab.title)}</h1>
          <p class="page-subtitle">${escapeHtml(lab.description)}</p>
        </div>

        <!-- Grade com Topologia e Evidências -->
        <div class="lab-grid" style="margin-bottom:24px;">
          <!-- Coluna 1: Topologia e Configuração Existente -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="card">
              <div class="card-header">
                <div class="card-title">${getIcon('network')} <span>Topologia do Cenário</span></div>
              </div>
              <div id="lab-topology-container" class="topology-viewer"></div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">${getIcon('file-text')} <span>Configuração Existente (/export)</span></div>
              </div>
              <div class="code-block" style="margin:0;">
                <pre style="max-height:180px; overflow-y:auto;"><code>${escapeHtml(lab.initial_config)}</code></pre>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Sintomas, Ferramentas de Teste e Evidências -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="card">
              <div class="card-header">
                <div class="card-title">${getIcon('alert')} <span>Sintomas Relatados pelo Cliente / Monitoramento</span></div>
              </div>
              <div style="font-size:13px; color:var(--text-secondary); line-height:1.6; white-space:pre-wrap;">${escapeHtml(lab.symptoms)}</div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">${getIcon('terminal')} <span>Ferramentas de Diagnóstico Ativas</span></div>
              </div>

              <div class="tools-bar">
                <button class="tool-btn active" data-tool="ping" data-target="1.1.1.1">Ping 1.1.1.1</button>
                <button class="tool-btn" data-tool="ping" data-target="198.51.100.1">Ping Gateway</button>
                <button class="tool-btn" data-tool="traceroute" data-target="1.1.1.1">Traceroute</button>
                <button class="tool-btn" data-tool="torch" data-target="ether1">Tool Torch</button>
                <button class="tool-btn" data-tool="log" data-target="">System Log</button>
              </div>

              <div class="console-output-box" id="lab-console-output">Clique em uma das ferramentas de diagnóstico acima para capturar evidências em tempo real...</div>
            </div>
          </div>
        </div>

        <!-- Formulário de Solução do Aluno -->
        <div class="card" style="border-top:3px solid var(--accent-primary);">
          <div class="card-header">
            <div class="card-title">${getIcon('check')} <span>Metodologia Padronizada ISP: Hipótese, Solução e Validação</span></div>
          </div>

          <form id="lab-submit-form" class="lab-solve-form" style="background:transparent; padding:0; border:none;">
            <div>
              <label style="font-size:13px; font-weight:600; color:var(--text-primary); display:block; margin-bottom:6px;">
                1. Descreva sua hipótese técnica (Qual a causa provável baseada nas evidências e topologia?):
              </label>
              <textarea class="lab-textarea" id="lab-hypothesis" placeholder="Ex: O roteador possui IP e NAT configurados, porém a rota padrão 0.0.0.0/0 não está presente na tabela de rotas..." required></textarea>
            </div>

            <div>
              <label style="font-size:13px; font-weight:600; color:var(--text-primary); display:block; margin-bottom:6px;">
                2. Proponha o comando RouterOS para solucionar a falha (ou procedimento exato):
              </label>
              <input type="text" class="lab-code-input" id="lab-solution-command" placeholder="Ex: /ip route add dst-address=0.0.0.0/0 gateway=198.51.100.1" required />
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <span style="font-size:12px; color:var(--text-muted);">
                A resposta será avaliada pelo motor de verificação de sintaxe e impacto lógico no RouterOS.
              </span>
              <button type="submit" class="btn btn-primary" id="btn-submit-lab">
                <span>Submeter Diagnóstico &amp; Correção</span>
              </button>
            </div>
          </form>

          <div id="lab-feedback-container"></div>
        </div>
      </div>
    `;

    // Renderiza topologia
    renderTopologyDiagram('lab-topology-container', lab.topology);

    // Eventos das ferramentas de diagnóstico
    const consoleBox = container.querySelector('#lab-console-output');
    container.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        container.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tool = btn.getAttribute('data-tool');
        const target = btn.getAttribute('data-target');

        consoleBox.textContent = `[admin@RTR-BANCADA] > Executando /tool ${tool} ${target}...\n`;
        try {
          const res = await API.runLabTool(labId, tool, target);
          consoleBox.textContent = res.output;
        } catch (err) {
          consoleBox.textContent = `Erro ao executar ferramenta: ${err.message}`;
        }
      });
    });

    // Submissão do formulário de diagnóstico
    const form = container.querySelector('#lab-submit-form');
    const feedbackBox = container.querySelector('#lab-feedback-container');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const hypothesis = container.querySelector('#lab-hypothesis').value;
      const solutionCommand = container.querySelector('#lab-solution-command').value;
      const submitBtn = container.querySelector('#btn-submit-lab');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Avaliando resposta técnica...';

      try {
        const result = await API.submitLab(labId, hypothesis, solutionCommand);

        if (result.passed) {
          feedbackBox.innerHTML = `
            <div class="lab-result-card success">
              <div class="lab-result-title">
                ${getIcon('check')} <span>Diagnóstico Aprovado com Sucesso! (Nota: ${result.score}%)</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">${escapeHtml(result.feedback)}</p>
              
              <div style="background-color:rgba(7,11,20,0.6); padding:12px; border-radius:var(--radius-sm); border:1px solid rgba(16,185,129,0.3); font-size:13px;">
                <strong style="color:var(--status-success); display:block; margin-bottom:4px;">Análise da Causa Raiz pelo Instrutor:</strong>
                <p style="color:var(--text-primary);">${escapeHtml(result.root_cause)}</p>
                <div style="margin-top:8px; font-family:var(--font-mono); font-size:12px; color:var(--accent-light);">
                  Comando Padronizado Oficial: <code>${escapeHtml(result.expected_solution)}</code>
                </div>
              </div>
            </div>
          `;
        } else {
          feedbackBox.innerHTML = `
            <div class="lab-result-card failed">
              <div class="lab-result-title">
                ${getIcon('alert')} <span>Correção Incompleta ou Incorreta</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom:8px;">${escapeHtml(result.feedback)}</p>
              <p style="font-size:12px; color:var(--text-muted);">
                Revise os sintomas e as evidências com ferramentas como Ping e Traceroute antes de tentar novamente.
              </p>
            </div>
          `;
        }
      } catch (err) {
        feedbackBox.innerHTML = `<div class="lab-result-card failed">Erro: ${err.message}</div>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submeter Diagnóstico & Correção';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card" style="border-color:var(--status-danger);">Erro: ${err.message}</div>`;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
