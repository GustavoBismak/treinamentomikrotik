// VIEW: PAINEL ADMINISTRATIVO, DO INSTRUTOR E EDITOR DE CONTEÚDO
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderAdmin(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando painel gerencial e indicadores operacionais...</div>
    </div>
  `;

  try {
    const [reports, usersData, auditData, finalProjectsData] = await Promise.all([
      API.getAdminReports(),
      API.getAdminUsers(),
      API.getAuditLogs(),
      API.getAdminFinalProjects()
    ]);

    const { total_students, total_certificates, total_evaluations, pass_rate, difficulty_rank } = reports;
    const { users } = usersData;
    const { logs } = auditData;
    const { submissions } = finalProjectsData;

    container.innerHTML = `
      <div class="container">
        <!-- Topo -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="badge" style="background:rgba(2, 132, 199, 0.2); color:var(--accent-light); border:1px solid rgba(56, 189, 248, 0.4);">Área de Gestão e Ensino</span>
              <span class="badge" style="background:rgba(16, 185, 129, 0.15); color:var(--status-success);">NOC & Coordenação</span>
            </div>
            <h1 class="page-title">Painel de Gestão e Engenharia de Treinamento</h1>
            <p class="page-subtitle">Acompanhamento da equipe técnica, controle de colaboradores, correção de projetos práticos e editor de conteúdo.</p>
          </div>
          <div style="display:flex; gap:10px;">
            <a href="/api/admin/backup" target="_blank" class="btn btn-secondary btn-sm">
              ${getIcon('download')}
              <span>Exportar Backup (JSON)</span>
            </a>
            <button id="btn-add-collaborator" class="btn btn-primary btn-sm">
              <span>+ Cadastrar Colaborador</span>
            </button>
          </div>
        </div>

        <!-- Abas do Painel Administrativo -->
        <div class="auth-tabs" style="max-width:620px; margin-bottom:24px;">
          <button type="button" class="auth-tab-btn active" id="tab-admin-overview">
            ${getIcon('bar-chart')}
            <span>Visão Geral & Equipe</span>
          </button>
          <button type="button" class="auth-tab-btn" id="tab-admin-projects">
            ${getIcon('briefcase')}
            <span>Projetos Finais (${submissions.length})</span>
          </button>
          <button type="button" class="auth-tab-btn" id="tab-admin-editor">
            ${getIcon('edit')}
            <span>Editor de Conteúdo</span>
          </button>
        </div>

        <!-- SEÇÃO 1: VISÃO GERAL, INDICADORES E COLABORADORES -->
        <div id="section-admin-overview">
          <!-- Indicadores de Gestão -->
          <div class="admin-grid" style="margin-bottom:24px;">
            <div class="stat-widget">
              <div class="stat-icon">${getIcon('users')}</div>
              <div class="stat-data">
                <h3>${total_students}</h3>
                <p>Técnicos Matriculados</p>
              </div>
            </div>

            <div class="stat-widget">
              <div class="stat-icon" style="background-color:rgba(16, 185, 129, 0.15); color:var(--status-success);">${getIcon('award')}</div>
              <div class="stat-data">
                <h3>${total_certificates}</h3>
                <p>Certificados Homologados</p>
              </div>
            </div>

            <div class="stat-widget">
              <div class="stat-icon" style="background-color:rgba(245, 158, 11, 0.15); color:var(--status-warning);">${getIcon('file-text')}</div>
              <div class="stat-data">
                <h3>${total_evaluations}</h3>
                <p>Avaliações Realizadas</p>
              </div>
            </div>

            <div class="stat-widget">
              <div class="stat-icon" style="background-color:rgba(14, 165, 233, 0.15); color:var(--accent-light);">${getIcon('activity')}</div>
              <div class="stat-data">
                <h3>${pass_rate}%</h3>
                <p>Taxa Média de Aprovação (&ge;80%)</p>
              </div>
            </div>
          </div>

          <!-- Maiores Dificuldades da Equipe (Módulos com Menor Média) -->
          <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
              <div class="card-title">${getIcon('bar-chart')} <span>Análise de Dificuldades da Equipe Técnica</span></div>
              <span style="font-size:12px; color:var(--text-muted);">Média de acertos por módulo do treinamento</span>
            </div>
            
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>Média das Notas</th>
                    <th>Total de Tentativas</th>
                    <th>Reprovações (&lt;80%)</th>
                    <th>Status de Dificuldade</th>
                  </tr>
                </thead>
                <tbody>
                  ${difficulty_rank.map(d => {
                    const avg = d.avg_grade ? Math.round(d.avg_grade) : 0;
                    const isHard = avg > 0 && avg < 80;
                    return `
                      <tr>
                        <td><strong>Módulo ${d.module_number}:</strong> ${escapeHtml(d.title)}</td>
                        <td><span style="font-family:var(--font-mono); font-weight:700; color:${avg >= 80 ? 'var(--status-success)' : 'var(--status-warning)'};">${avg > 0 ? avg + '%' : 'Sem tentativas'}</span></td>
                        <td>${d.total_attempts}</td>
                        <td>${d.failures || 0}</td>
                        <td>
                          <span class="badge ${isHard ? 'badge-danger' : (avg >= 80 ? 'badge-success' : 'badge-info')}">
                            ${isHard ? 'Tópico Crítico (Requer Reforço)' : (avg >= 80 ? 'Desempenho Adequado' : 'Em Andamento')}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Gestão de Colaboradores -->
          <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
              <div class="card-title">${getIcon('users')} <span>Gestão de Colaboradores e Técnicos</span></div>
            </div>

            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nome do Colaborador</th>
                    <th>Usuário</th>
                    <th>Perfil</th>
                    <th>Departamento</th>
                    <th>Aulas</th>
                    <th>Labs</th>
                    <th>Média</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map(u => `
                    <tr>
                      <td><strong>${escapeHtml(u.name)}</strong></td>
                      <td style="font-family:var(--font-mono); font-size:12px;">${escapeHtml(u.username)}</td>
                      <td>
                        <span class="role-pill">${u.role === 'admin' ? 'Administrador' : (u.role === 'instructor' ? 'Instrutor' : 'Aluno')}</span>
                      </td>
                      <td>${escapeHtml(u.department)}</td>
                      <td>${u.completed_lessons} / 15</td>
                      <td>${u.labs_passed} / 6</td>
                      <td><strong style="color:${(u.avg_score || 0) >= 80 ? 'var(--status-success)' : 'var(--text-secondary)'};">${u.avg_score !== null ? u.avg_score + '%' : '-'}</strong></td>
                      <td>
                        <button class="btn btn-sm btn-danger btn-delete-user" data-id="${u.id}" data-name="${escapeHtml(u.name)}">
                          Remover
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Trilha de Auditoria (Audit Logs) -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('file-text')} <span>Registro de Auditoria de Ações Administrativas</span></div>
            </div>

            <div class="data-table-container">
              <table class="data-table" style="font-size:12px;">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Alvo</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(log => `
                    <tr>
                      <td style="font-family:var(--font-mono); color:var(--text-muted); white-space:nowrap;">
                        ${new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td style="font-weight:600; color:var(--accent-light);">${escapeHtml(log.username)}</td>
                      <td><span class="badge badge-info">${escapeHtml(log.action)}</span></td>
                      <td>${escapeHtml(log.target)}</td>
                      <td>${escapeHtml(log.details)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 2: CORREÇÃO E HOMOLOGAÇÃO DE PROJETOS FINAIS -->
        <div id="section-admin-projects" style="display:none;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('briefcase')} <span>Submissões de Projetos Finais dos Alunos</span></div>
            </div>

            ${submissions.length === 0 ? `
              <div style="padding:32px; text-align:center; color:var(--text-muted); font-size:13px;">
                Nenhum projeto final foi submetido pelos alunos até o momento.
              </div>
            ` : `
              <div class="data-table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Aluno Técnico</th>
                      <th>Departamento</th>
                      <th>Data de Envio</th>
                      <th>Status Atual</th>
                      <th>Nota</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${submissions.map(sub => `
                      <tr>
                        <td><strong>${escapeHtml(sub.student_name)}</strong><br><span style="font-size:11px; color:var(--text-muted);">${escapeHtml(sub.student_email)}</span></td>
                        <td>${escapeHtml(sub.student_department)}</td>
                        <td style="font-size:12px; color:var(--text-muted);">${new Date(sub.submitted_at).toLocaleString('pt-BR')}</td>
                        <td>${renderProjectStatusBadge(sub.status)}</td>
                        <td><strong>${sub.grade !== null ? sub.grade + '/100' : 'Pendente'}</strong></td>
                        <td>
                          <button class="btn btn-sm btn-primary btn-review-project" data-sub='${JSON.stringify(sub).replace(/'/g, "&apos;")}'>
                            Avaliar Projeto
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>

        <!-- SEÇÃO 3: EDITOR DE CONTEÚDO TÉCNICO -->
        <div id="section-admin-editor" style="display:none;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
            
            <!-- Editor de Aulas -->
            <div class="card">
              <h3 style="font-size:16px; font-weight:700; margin-bottom:14px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                ${getIcon('edit')}
                <span>Cadastrar / Atualizar Aula Técnica</span>
              </h3>
              <form id="form-edit-lesson" style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label class="form-label">Módulo Alvo:</label>
                  <select id="ed-lesson-module" class="form-input" required>
                    <option value="m1">Módulo 1: Fundamentos de Redes</option>
                    <option value="m2">Módulo 2: Conhecendo os Equipamentos MikroTik</option>
                    <option value="m3">Módulo 3: Primeiro Acesso e Configuração Inicial</option>
                    <option value="m4">Módulo 4: Interfaces, Bridge e Endereçamento</option>
                    <option value="m5">Módulo 5: DHCP, DNS e Serviços Básicos</option>
                    <option value="m6">Módulo 6: Internet, Rotas e NAT</option>
                    <option value="m7">Módulo 7: Firewall e Segurança</option>
                    <option value="m8">Módulo 8: VLANs e Segmentação de Empresas</option>
                    <option value="m9">Módulo 9: Wi-Fi Corporativo</option>
                    <option value="m10">Módulo 10: VPN e Acesso Remoto Seguro</option>
                    <option value="m11">Módulo 11: Controle de Banda e QoS</option>
                    <option value="m12">Módulo 12: Monitoramento e Troubleshooting</option>
                    <option value="m13">Módulo 13: Instalação de MikroTik em Empresas</option>
                    <option value="m14">Módulo 14: Recursos Avançados (BGP, OSPF, VRRP)</option>
                    <option value="m15">Módulo 15: Padrões Operacionais (POPs)</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Título da Aula:</label>
                  <input type="text" id="ed-lesson-title" class="form-input" placeholder="Ex: Configuração de Túnel WireGuard Site-to-Site" required />
                </div>
                <div>
                  <label class="form-label">Tempo Estimado (minutos):</label>
                  <input type="number" id="ed-lesson-duration" class="form-input" value="45" min="15" max="180" />
                </div>
                <div>
                  <label class="form-label">Objetivo da Aula:</label>
                  <textarea id="ed-lesson-objective" class="form-textarea" rows="2" placeholder="Descreva o que o técnico aprenderá..." required></textarea>
                </div>
                <div>
                  <label class="form-label">Procedimento e Comandos RouterOS v7:</label>
                  <textarea id="ed-lesson-commands" class="form-textarea font-mono" rows="4" placeholder="/interface wireguard add name=wg1..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="justify-content:center;">
                  <span>Salvar Aula no Banco</span>
                </button>
              </form>
            </div>

            <!-- Editor de Questões -->
            <div class="card">
              <h3 style="font-size:16px; font-weight:700; margin-bottom:14px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                ${getIcon('file-text')}
                <span>Adicionar Questão ao Banco de Avaliações</span>
              </h3>
              <form id="form-edit-question" style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label class="form-label">Módulo da Questão:</label>
                  <select id="ed-q-module" class="form-input" required>
                    <option value="m1">Módulo 1: Fundamentos de Redes</option>
                    <option value="m2">Módulo 2: Equipamentos MikroTik</option>
                    <option value="m3">Módulo 3: Primeiro Acesso e Hardening</option>
                    <option value="m4">Módulo 4: Interfaces e Bridges</option>
                    <option value="m5">Módulo 5: DHCP e DNS</option>
                    <option value="m6">Módulo 6: Roteamento e NAT</option>
                    <option value="m7">Módulo 7: Firewall</option>
                    <option value="m8">Módulo 8: VLANs</option>
                    <option value="m9">Módulo 9: Wi-Fi Corporativo</option>
                    <option value="m10">Módulo 10: VPN WireGuard / IPsec</option>
                    <option value="m11">Módulo 11: QoS e Filas</option>
                    <option value="m12">Módulo 12: Troubleshooting</option>
                    <option value="m13">Módulo 13: Projetos Corporativos</option>
                    <option value="m14">Módulo 14: BGP / OSPF</option>
                    <option value="m15">Módulo 15: POPs Operacionais</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Enunciado Técnico da Questão:</label>
                  <textarea id="ed-q-text" class="form-textarea" rows="2" placeholder="Ex: Qual o valor do TCP MSS Clamping para conexões PPPoE com MTU 1492?" required></textarea>
                </div>
                <div>
                  <label class="form-label">Alternativa A (Opção 0):</label>
                  <input type="text" id="ed-q-opt0" class="form-input" placeholder="Opção A" required />
                </div>
                <div>
                  <label class="form-label">Alternativa B (Opção 1):</label>
                  <input type="text" id="ed-q-opt1" class="form-input" placeholder="Opção B" required />
                </div>
                <div>
                  <label class="form-label">Alternativa C (Opção 2):</label>
                  <input type="text" id="ed-q-opt2" class="form-input" placeholder="Opção C" required />
                </div>
                <div>
                  <label class="form-label">Alternativa D (Opção 3):</label>
                  <input type="text" id="ed-q-opt3" class="form-input" placeholder="Opção D" required />
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                  <div>
                    <label class="form-label">Gabarito Correto:</label>
                    <select id="ed-q-correct" class="form-input">
                      <option value="0">Alternativa A (0)</option>
                      <option value="1">Alternativa B (1)</option>
                      <option value="2">Alternativa C (2)</option>
                      <option value="3">Alternativa D (3)</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label">Tipo de Questão:</label>
                    <select id="ed-q-type" class="form-input">
                      <option value="multiple_choice">Múltipla Escolha</option>
                      <option value="scenario">Cenário Prático</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="form-label">Justificativa / Explicação Técnica:</label>
                  <textarea id="ed-q-explanation" class="form-textarea" rows="2" placeholder="Explique por que esta alternativa é a correta..."></textarea>
                </div>
                <button type="submit" class="btn btn-secondary" style="justify-content:center;">
                  <span>Cadastrar Questão</span>
                </button>
              </form>
            </div>

          </div>
        </div>

        <!-- Modal de Avaliação de Projeto Final -->
        <div id="modal-review-project" class="modal-overlay" style="display:none;">
          <div class="modal-content" style="max-width:800px; max-height:90vh; overflow-y:auto;">
            <div class="card-header">
              <div class="card-title"><span id="review-modal-title">Avaliação do Projeto Final</span></div>
              <button id="btn-close-review-modal" style="background:none; border:none; color:var(--text-muted); font-size:18px; cursor:pointer;">&times;</button>
            </div>
            
            <div id="review-project-details" style="padding:20px; font-size:13px; line-height:1.6;"></div>

            <form id="form-review-submit" style="padding:20px; border-top:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:14px;">
              <input type="hidden" id="rev-project-id" />
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div>
                  <label class="form-label">Nota da Avaliação Prática (0 a 100):</label>
                  <input type="number" id="rev-grade" class="form-input" min="0" max="100" required placeholder="Ex: 95" />
                </div>
                <div>
                  <label class="form-label">Decisão do Instrutor:</label>
                  <select id="rev-status" class="form-input" required>
                    <option value="approved">✓ Aprovado com Homologação</option>
                    <option value="revisions_required">⚠ Revisões Técnicas Necessárias</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label">Parecer Técnico Detalhado do Instrutor:</label>
                <textarea id="rev-feedback" class="form-textarea" rows="4" placeholder="Descreva os pontos fortes da topologia, boas práticas seguidas ou correções que o aluno deve aplicar..." required></textarea>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button type="button" class="btn btn-secondary" id="btn-cancel-review">Cancelar</button>
                <button type="submit" class="btn btn-primary">Emitir Parecer e Gravar Nota</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal de Cadastro de Colaborador -->
        <div id="modal-collaborator" class="modal-overlay" style="display:none;">
          <div class="modal-content">
            <div class="card-header">
              <div class="card-title"><span>Cadastrar Novo Colaborador Técnico</span></div>
              <button id="btn-close-modal" style="background:none; border:none; color:var(--text-muted); font-size:18px; cursor:pointer;">&times;</button>
            </div>
            <form id="form-new-user" style="padding:20px; display:flex; flex-direction:column; gap:14px;">
              <div>
                <label class="form-label">Nome Completo:</label>
                <input type="text" id="u-name" class="form-input" placeholder="Ex: Roberto Silva" required />
              </div>
              <div>
                <label class="form-label">Usuário de Login:</label>
                <input type="text" id="u-username" class="form-input" placeholder="Ex: tecnico.roberto" required />
              </div>
              <div>
                <label class="form-label">E-mail Corporativo:</label>
                <input type="email" id="u-email" class="form-input" placeholder="roberto@provedorisp.com.br" required />
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div>
                  <label class="form-label">Perfil:</label>
                  <select id="u-role" class="form-input">
                    <option value="student">Aluno / Técnico</option>
                    <option value="instructor">Instrutor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Departamento:</label>
                  <input type="text" id="u-dept" class="form-input" value="Operações de Campo" required />
                </div>
              </div>
              <div>
                <label class="form-label">Senha Inicial:</label>
                <input type="password" id="u-pass" class="form-input" placeholder="Mínimo 6 caracteres" required />
              </div>
              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
                <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Colaborador</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // Alternância de Abas do Admin
    const tabOverview = container.querySelector('#tab-admin-overview');
    const tabProjects = container.querySelector('#tab-admin-projects');
    const tabEditor = container.querySelector('#tab-admin-editor');

    const secOverview = container.querySelector('#section-admin-overview');
    const secProjects = container.querySelector('#section-admin-projects');
    const secEditor = container.querySelector('#section-admin-editor');

    function switchAdminTab(activeTab, activeSec) {
      [tabOverview, tabProjects, tabEditor].forEach(t => t.classList.remove('active'));
      [secOverview, secProjects, secEditor].forEach(s => s.style.display = 'none');
      activeTab.classList.add('active');
      activeSec.style.display = 'block';
    }

    tabOverview.addEventListener('click', () => switchAdminTab(tabOverview, secOverview));
    tabProjects.addEventListener('click', () => switchAdminTab(tabProjects, secProjects));
    tabEditor.addEventListener('click', () => switchAdminTab(tabEditor, secEditor));

    // Modal de Cadastro de Colaborador
    const modal = container.querySelector('#modal-collaborator');
    const addBtn = container.querySelector('#btn-add-collaborator');
    const closeBtn = container.querySelector('#btn-close-modal');
    const cancelBtn = container.querySelector('#btn-cancel-modal');
    const userForm = container.querySelector('#form-new-user');

    addBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });

    userForm.addEventListener('submit', async e => {
      e.preventDefault();
      try {
        await API.createUser({
          name: container.querySelector('#u-name').value,
          username: container.querySelector('#u-username').value,
          email: container.querySelector('#u-email').value,
          role: container.querySelector('#u-role').value,
          department: container.querySelector('#u-dept').value,
          password: container.querySelector('#u-pass').value
        });
        modal.style.display = 'none';
        renderAdmin(container);
      } catch (err) {
        alert('Erro ao criar usuário: ' + err.message);
      }
    });

    // Remover Colaborador
    container.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (confirm(`Deseja realmente remover o colaborador ${name}?`)) {
          try {
            await API.deleteUser(id);
            renderAdmin(container);
          } catch (err) {
            alert('Erro ao excluir: ' + err.message);
          }
        }
      });
    });

    // Modal de Avaliação de Projeto Final
    const reviewModal = container.querySelector('#modal-review-project');
    const closeRevBtn = container.querySelector('#btn-close-review-modal');
    const cancelRevBtn = container.querySelector('#btn-cancel-review');
    const formReview = container.querySelector('#form-review-submit');

    closeRevBtn.addEventListener('click', () => { reviewModal.style.display = 'none'; });
    cancelRevBtn.addEventListener('click', () => { reviewModal.style.display = 'none'; });

    container.querySelectorAll('.btn-review-project').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = JSON.parse(btn.getAttribute('data-sub'));
        container.querySelector('#review-modal-title').textContent = `Avaliar Projeto: ${sub.student_name} (${sub.company_name})`;
        container.querySelector('#rev-project-id').value = sub.id;
        container.querySelector('#rev-grade').value = sub.grade || 90;
        container.querySelector('#rev-status').value = sub.status === 'approved' ? 'approved' : 'approved';
        container.querySelector('#rev-feedback').value = sub.instructor_feedback || '';

        const st = sub.stage_data || {};
        container.querySelector('#review-project-details').innerHTML = `
          <div style="background:var(--bg-surface); padding:14px; border-radius:8px; margin-bottom:12px;">
            <strong>Etapa 1 (Requisitos):</strong><br>${escapeHtml(st.stage_1 || 'Não preenchido')}
          </div>
          <div style="background:var(--bg-surface); padding:14px; border-radius:8px; margin-bottom:12px;">
            <strong>Etapa 2 (Topologia L2/L3 & VLANs):</strong><br>${escapeHtml(st.stage_2 || 'Não preenchido')}
          </div>
          <div style="background:var(--bg-surface); padding:14px; border-radius:8px; margin-bottom:12px;">
            <strong>Etapa 4 (Comandos RouterOS v7):</strong><br><pre class="code-block" style="font-size:11px; max-height:160px; overflow-y:auto;">${escapeHtml(st.stage_4 || 'Não preenchido')}</pre>
          </div>
          <div style="background:var(--bg-surface); padding:14px; border-radius:8px; margin-bottom:12px;">
            <strong>Etapa 7 (Defesa & Troubleshooting de Falha):</strong><br>${escapeHtml(st.stage_7 || 'Não preenchido')}
          </div>
        `;

        reviewModal.style.display = 'flex';
      });
    });

    formReview.addEventListener('submit', async e => {
      e.preventDefault();
      const subId = container.querySelector('#rev-project-id').value;
      const grade = Number(container.querySelector('#rev-grade').value);
      const status = container.querySelector('#rev-status').value;
      const feedback = container.querySelector('#rev-feedback').value;

      try {
        await API.reviewFinalProject(subId, { grade, status, feedback });
        alert('Projeto Final avaliado e homologado com sucesso!');
        reviewModal.style.display = 'none';
        renderAdmin(container);
      } catch (err) {
        alert('Erro ao gravar avaliação: ' + err.message);
      }
    });

    // Submissão do Editor de Aulas
    const formLesson = container.querySelector('#form-edit-lesson');
    formLesson?.addEventListener('submit', async e => {
      e.preventDefault();
      const module_id = container.querySelector('#ed-lesson-module').value;
      const title = container.querySelector('#ed-lesson-title').value;
      const duration_minutes = Number(container.querySelector('#ed-lesson-duration').value);
      const objective = container.querySelector('#ed-lesson-objective').value;
      const commands = container.querySelector('#ed-lesson-commands').value;

      const content = {
        objective,
        simple_theory: objective,
        technical_concepts: 'Procedimento técnico homologado pelo instrutor.',
        real_application: 'Execução de configuração em campo e bancada.',
        commands: [
          { cmd: commands, desc: 'Comandos oficiais da aula' }
        ],
        completion_criteria: 'Aplicar os comandos e validar a conectividade.'
      };

      try {
        await API.adminSaveLesson({ module_id, title, duration_minutes, content });
        alert(`Aula "${title}" cadastrada com sucesso no módulo!`);
        formLesson.reset();
      } catch (err) {
        alert('Erro ao salvar aula: ' + err.message);
      }
    });

    // Submissão do Editor de Questões
    const formQ = container.querySelector('#form-edit-question');
    formQ?.addEventListener('submit', async e => {
      e.preventDefault();
      const module_id = container.querySelector('#ed-q-module').value;
      const question_text = container.querySelector('#ed-q-text').value;
      const opt0 = container.querySelector('#ed-q-opt0').value;
      const opt1 = container.querySelector('#ed-q-opt1').value;
      const opt2 = container.querySelector('#ed-q-opt2').value;
      const opt3 = container.querySelector('#ed-q-opt3').value;
      const correct_index = Number(container.querySelector('#ed-q-correct').value);
      const question_type = container.querySelector('#ed-q-type').value;
      const explanation = container.querySelector('#ed-q-explanation').value;

      try {
        await API.adminSaveQuestion({
          module_id,
          question_text,
          options: [opt0, opt1, opt2, opt3],
          correct_index,
          explanation,
          question_type
        });
        alert('Questão cadastrada com sucesso no banco de avaliações!');
        formQ.reset();
      } catch (err) {
        alert('Erro ao salvar questão: ' + err.message);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card" style="border-color:var(--status-danger);">Erro: ${err.message}</div>`;
  }
}

function renderProjectStatusBadge(status) {
  if (status === 'approved') return '<span class="status-pill status-green">✓ Aprovado</span>';
  if (status === 'submitted' || status === 'under_review') return '<span class="status-pill status-blue">Em Revisão</span>';
  if (status === 'revisions_required') return '<span class="status-pill status-amber">Revisão Necessária</span>';
  return '<span class="status-pill status-gray">Rascunho</span>';
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
