// VIEW: PAINEL INICIAL (DASHBOARD DO ALUNO — 5 RESPOSTAS ESSENCIAIS)
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando painel de capacitação técnica...</div>
    </div>
  `;

  try {
    const data = await API.getDashboardStats();
    const { user, stats, continue_lesson, weak_areas, action_items, final_project, certificate, recent_activity } = data;

    const firstName = user.name.split(' ')[0];

    container.innerHTML = `
      <div class="container">
        
        <!-- 1. Saudação Profissional e Topo -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="badge" style="background:rgba(2, 132, 199, 0.2); color:var(--accent-light); border:1px solid rgba(56, 189, 248, 0.4);">Portal do Aluno Técnico</span>
              <span style="font-size:12px; color:var(--text-muted);">${escapeHtml(user.department)}</span>
            </div>
            <h1 class="page-title">Olá, ${escapeHtml(firstName)}! Bem-vindo à Academia MikroTik.</h1>
            <p class="page-subtitle">Acompanhe seu progresso real, retome seus estudos e pratique nas bancadas de troubleshooting.</p>
          </div>

          <div style="display:flex; gap:10px;">
            <a href="#syllabus" class="btn btn-secondary">
              ${getIcon('layers')}
              <span>Grade dos 15 Módulos</span>
            </a>
            <a href="#labs" class="btn btn-secondary">
              ${getIcon('terminal')}
              <span>Bancada de Labs</span>
            </a>
          </div>
        </div>

        <!-- 2. ONDE PAREI? — Card de Retomada Imediata -->
        ${continue_lesson ? `
          <div class="card" style="margin-bottom:24px; background:linear-gradient(135deg, rgba(16, 26, 46, 0.95) 0%, rgba(2, 132, 199, 0.15) 100%); border:1px solid rgba(56, 189, 248, 0.35); box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span class="badge" style="background:#0284c7; color:#fff; font-weight:700;">ONDE PAREI</span>
                  <span style="font-size:12px; color:var(--accent-light); font-weight:600;">Módulo ${continue_lesson.module_number}: ${escapeHtml(continue_lesson.module_title)}</span>
                </div>
                <h2 style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">
                  ${escapeHtml(continue_lesson.title)}
                </h2>
                <p style="font-size:12px; color:var(--text-secondary);">
                  ${continue_lesson.status === 'completed' ? '✓ Você concluiu esta aula. Clique para revisar ou avançar para o próximo módulo.' : '• Aula em andamento. Retome seu procedimento prático e comandos CLI.'}
                </p>
              </div>

              <div>
                <a href="#lesson/${continue_lesson.id}" class="btn btn-primary" style="padding:10px 20px; font-size:14px; box-shadow:0 0 15px var(--accent-glow);">
                  ${getIcon('play')}
                  <span>Continuar de Onde Parei</span>
                </a>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. QUANTO JÁ CONCLUÍ? — Métricas Calculadas Reais -->
        <div class="admin-grid" style="margin-bottom:24px;">
          <div class="stat-widget">
            <div class="stat-icon" style="background-color:rgba(2, 132, 199, 0.2); color:var(--accent-light);">${getIcon('network')}</div>
            <div class="stat-data">
              <h3>${stats.overall_progress}%</h3>
              <p>Progresso Geral do Curso</p>
            </div>
          </div>

          <div class="stat-widget">
            <div class="stat-icon" style="background-color:rgba(16, 185, 129, 0.15); color:var(--status-success);">${getIcon('check')}</div>
            <div class="stat-data">
              <h3>${stats.completed_lessons} / ${stats.total_lessons}</h3>
              <p>Aulas Concluídas com Prática</p>
            </div>
          </div>

          <div class="stat-widget">
            <div class="stat-icon" style="background-color:rgba(245, 158, 11, 0.15); color:var(--status-warning);">${getIcon('terminal')}</div>
            <div class="stat-data">
              <h3>${stats.passed_labs} / ${stats.total_labs}</h3>
              <p>Laboratórios Solucionados</p>
            </div>
          </div>

          <div class="stat-widget">
            <div class="stat-icon" style="background-color:rgba(14, 165, 233, 0.15); color:var(--accent-light);">${getIcon('award')}</div>
            <div class="stat-data">
              <h3>${stats.avg_quiz_score}%</h3>
              <p>Média nas Avaliações (Min. 80%)</p>
            </div>
          </div>
        </div>

        <!-- Barra de Progresso Real e Nível de Prontidão -->
        <div class="card" style="margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:13px; font-weight:600; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              ${getIcon('activity')}
              <span>Nível de Prontidão Técnica para Operações ISP</span>
            </div>
            <div style="font-size:13px; font-family:var(--font-mono); font-weight:700; color:var(--accent-light);">${stats.overall_progress}% Concluído</div>
          </div>
          <div class="progress-container" style="height:10px; background:var(--bg-main);">
            <div class="progress-bar" style="width: ${stats.overall_progress}%;"></div>
          </div>
          <div style="margin-top:12px; font-size:12px; color:var(--text-muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <span>Colaborador: <strong style="color:var(--text-primary);">${escapeHtml(user.name)}</strong></span>
            <span>Critério de Homologação: <strong>Mínimo 80%</strong> em avaliações e aprovação em laboratórios</span>
          </div>
        </div>

        <!-- Grade 2 Colunas: Ações Recomendadas + Assuntos com Dificuldade -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:24px;">
          
          <!-- 4. O QUE PRECISO FAZER PARA AVANÇAR? -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('zap')}
                <span>O que preciso fazer para avançar?</span>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              ${action_items && action_items.length > 0 ? action_items.map(act => `
                <div style="padding:12px 14px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                  <div>
                    <strong style="font-size:13px; color:var(--text-primary); display:block; margin-bottom:2px;">${escapeHtml(act.title)}</strong>
                    <span style="font-size:11px; color:var(--text-secondary);">${escapeHtml(act.description)}</span>
                  </div>
                  <a href="${act.link}" class="btn btn-sm btn-primary" style="white-space:nowrap;">
                    Avançar &rarr;
                  </a>
                </div>
              `).join('') : `
                <div style="padding:16px; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); border-radius:8px; font-size:12px; color:#34d399;">
                  ✓ Parabéns! Todas as etapas prioritárias foram concluídas até o momento.
                </div>
              `}
            </div>
          </div>

          <!-- 5. EM QUAIS ASSUNTOS TENHO DIFICULDADE? -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('alert')}
                <span>Em quais assuntos tenho dificuldade?</span>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              ${weak_areas && weak_areas.length > 0 ? weak_areas.map(w => `
                <div style="padding:12px 14px; background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                      <span class="badge" style="background:#ef4444; color:#fff; font-size:10px;">Abaixo de 80%</span>
                      <strong style="font-size:13px; color:var(--text-primary);">${escapeHtml(w.title)}</strong>
                    </div>
                    <span style="font-size:11px; color:var(--text-secondary);">Sua nota recente: <strong style="color:#f87171;">${w.percentage}%</strong> (Exige >= 80% para homologação)</span>
                  </div>
                  <a href="#quiz/${w.id}" class="btn btn-sm btn-secondary" style="white-space:nowrap;">
                    Refazer Prova
                  </a>
                </div>
              `).join('') : `
                <div style="padding:16px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px; font-size:12px; color:var(--text-secondary);">
                  <strong style="color:var(--status-success); display:block; margin-bottom:4px;">✓ Nenhuma deficiência crítica registrada</strong>
                  Todas as suas avaliações realizadas atingiram nota igual ou superior a 80%.
                </div>
              `}
            </div>
          </div>

        </div>

        <!-- Grade Inferior: Projeto Final, Certificado e Histórico de Auditoria -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
          
          <!-- Card: Projeto Final Obrigatório -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('briefcase')}
                <span>Projeto Final Obrigatório</span>
              </div>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
              Simulação prática de implantação em empresa real: levantamento, topologia L2/L3, janela de mudança, script RouterOS v7 e testes.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding:10px 12px; background:var(--bg-surface); border-radius:6px; border:1px solid var(--border-subtle); font-size:12px;">
              <span style="color:var(--text-muted);">Status da Implantação:</span>
              <span style="font-weight:600; color:${final_project?.status === 'approved' ? 'var(--status-success)' : 'var(--accent-light)'};">
                ${final_project ? (final_project.status === 'approved' ? '✓ Aprovado' : (final_project.status === 'submitted' ? 'Em Avaliação pelo Instrutor' : 'Rascunho em Andamento')) : 'Não Iniciado'}
              </span>
            </div>
            <a href="#final-project" class="btn btn-primary" style="width:100%; justify-content:center;">
              ${getIcon('briefcase')}
              <span>Acessar Projeto Final</span>
            </a>
          </div>

          <!-- Card: Certificação Interna -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('award')}
                <span>Certificação Interna ISP</span>
              </div>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
              Emitido após comprovação de 80%+ nas avaliações e homologação das competências pelo instrutor técnico do NOC.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding:10px 12px; background:var(--bg-surface); border-radius:6px; border:1px solid var(--border-subtle); font-size:12px;">
              <span style="color:var(--text-muted);">Status do Certificado:</span>
              <span style="font-weight:600; color:${certificate ? 'var(--status-success)' : 'var(--text-muted)'};">
                ${certificate ? '✓ Emitido e Válido' : 'Pendente de Requisitos'}
              </span>
            </div>
            <a href="#certificate" class="btn btn-secondary" style="width:100%; justify-content:center;">
              ${getIcon('award')}
              <span>Consultar Certificado</span>
            </a>
          </div>

          <!-- Card: Últimas Atividades Registradas -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('activity')}
                <span>Últimas Atividades</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${recent_activity && recent_activity.length > 0 ? recent_activity.map(act => `
                <div style="font-size:12px; padding:8px 10px; background:var(--bg-surface); border-radius:6px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
                  <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    <span style="color:var(--accent-light); font-weight:700;">[${act.type === 'lesson' ? 'Aula' : 'Lab'}]</span>
                    <span style="color:var(--text-primary); margin-left:4px;">${escapeHtml(act.title)}</span>
                  </div>
                </div>
              `).join('') : '<p style="font-size:12px; color:var(--text-muted);">Nenhuma atividade registrada ainda.</p>'}
            </div>
          </div>

        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="max-width:600px; margin:40px auto; border-color:var(--status-danger);">
        <h3 style="color:var(--status-danger); margin-bottom:10px;">Falha ao carregar dashboard</h3>
        <p style="font-size:13px; color:var(--text-secondary);">${err.message}</p>
      </div>
    `;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
