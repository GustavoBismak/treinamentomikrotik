// VIEW: MATRIZ DE COMPETÊNCIAS E HABILITAÇÃO OPERACIONAL
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderCompetencies(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando matriz de competências da equipe técnica...</div>
    </div>
  `;

  try {
    const { competencies } = await API.getCompetencies();

    const qualifiedCount = competencies.filter(c => c.is_qualified).length;
    const readinessPercent = Math.round((qualifiedCount / competencies.length) * 100);

    container.innerHTML = `
      <div class="container">
        <!-- Navegação de Retorno -->
        <div style="margin-bottom:18px;">
          <a href="#dashboard" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:8px;">
            ${getIcon('arrow-left')}
            <span>Voltar ao Painel Inicial</span>
          </a>
        </div>

        <div style="margin-bottom:24px;">
          <h1 class="page-title">Matriz de Competências Técnicas Operacionais</h1>
          <p class="page-subtitle">Indicadores de proficiência individual e aptidão da equipe para execução de atividades em campo, backbone e clientes corporativos.</p>
        </div>

        <!-- Indicador Geral de Prontidão -->
        <div class="card" style="margin-bottom:24px; border-left:4px solid var(--accent-primary);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
              <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Índice de Autonomia Técnica</div>
              <h2 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-top:2px;">
                ${qualifiedCount} de ${competencies.length} Competências Homologadas (${readinessPercent}%)
              </h2>
              <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">
                Habilitação para atendimentos de alta complexidade (VLANs, VPNs, BGP e Troubleshooting Crítico).
              </p>
            </div>
            <div>
              <span class="badge ${readinessPercent >= 70 ? 'badge-success' : 'badge-warning'}" style="font-size:13px; padding:6px 12px;">
                ${readinessPercent >= 70 ? '✓ Apto para Atendimentos Corporativos' : 'Requer Supervisão Técnica'}
              </span>
            </div>
          </div>
        </div>

        <!-- Grade de Competências -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:16px;">
          ${competencies.map(comp => `
            <div class="competency-card" style="border-left: 3px solid ${comp.is_qualified ? 'var(--status-success)' : 'var(--border-medium)'};">
              <div class="competency-header">
                <span class="badge ${comp.is_qualified ? 'badge-success' : 'badge-info'}">${escapeHtml(comp.category)}</span>
                <span style="font-size:11px; font-weight:700; font-family:var(--font-mono); color:${comp.is_qualified ? 'var(--status-success)' : 'var(--accent-light)'};">
                  ${comp.score}% (${escapeHtml(comp.status)})
                </span>
              </div>

              <div class="competency-name">${escapeHtml(comp.name)}</div>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; flex:1;">${escapeHtml(comp.description)}</p>

              <div class="progress-container" style="height:6px; margin-top:6px;">
                <div class="progress-bar" style="width: ${comp.score}%; ${comp.is_qualified ? 'background: linear-gradient(90deg, #10b981, #34d399);' : ''}"></div>
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

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
