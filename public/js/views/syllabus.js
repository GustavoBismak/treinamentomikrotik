// VIEW: GRADE COMPLETA DO CURSO (15 MÓDULOS PROGRESSIVOS)
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderSyllabus(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando matriz dos 15 módulos de treinamento...</div>
    </div>
  `;

  try {
    const { modules } = await API.getModules();

    container.innerHTML = `
      <div class="container">
        <div style="margin-bottom:24px;">
          <h1 class="page-title">Grade Curricular: Academia Técnica MikroTik</h1>
          <p class="page-subtitle">Estrutura progressiva em 15 módulos técnicos, do nível iniciante ao avançado, orientada a redes reais de telecomunicações e empresas.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${modules.map(mod => `
            <div class="card" style="border-left: 4px solid var(--accent-primary);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
                <div style="display:flex; gap:16px; align-items:flex-start;">
                  <div class="stat-icon" style="margin-top:2px;">
                    ${getIcon(mod.icon)}
                  </div>
                  <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
                      <span class="badge ${getLevelBadge(mod.level)}">${mod.level}</span>
                      <span style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">${mod.duration_hours} Horas Estimadas</span>
                      ${mod.quiz_status === 'Aprovado' ? '<span class="badge badge-success">✓ Avaliação Aprovada</span>' : ''}
                    </div>
                    <h2 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">${escapeHtml(mod.title)}</h2>
                    <p style="font-size:13px; color:var(--text-secondary); max-width:850px; line-height:1.5;">${escapeHtml(mod.description)}</p>
                  </div>
                </div>

                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                  <div style="display:flex; gap:8px;">
                    <a href="#module/${mod.id}" class="btn btn-sm btn-primary">
                      <span>Ver Aulas e Conteúdo</span>
                    </a>
                    <a href="#quiz/${mod.id}" class="btn btn-sm btn-secondary">
                      <span>Avaliação (80%)</span>
                    </a>
                  </div>
                  <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
                    Progresso: ${mod.progress_percent}% (${mod.completed_lessons}/${mod.total_lessons} aulas)
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="max-width:600px; margin:40px auto; border-color:var(--status-danger);">
        <h3 style="color:var(--status-danger);">Erro ao carregar grade do curso</h3>
        <p style="font-size:13px; color:var(--text-secondary);">${err.message}</p>
      </div>
    `;
  }
}

function getLevelBadge(level) {
  if (level === 'Iniciante') return 'badge-info';
  if (level === 'Intermediário') return 'badge-warning';
  return 'badge-danger';
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
