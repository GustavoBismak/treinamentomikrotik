// VIEW: MATERIAIS DE APOIO, PROCEDIMENTOS OPERACIONAIS PADRÃO (POPs) E GUIA TÉCNICO
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderMaterials(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando Procedimentos Operacionais e Materiais...</div>
    </div>
  `;

  try {
    const data = await API.getMaterials();
    const { pops, v6_vs_v7, essential_ports } = data;

    container.innerHTML = `
      <div class="container">
        <!-- Topo -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="badge" style="background:rgba(2, 132, 199, 0.2); color:var(--accent-light); border:1px solid rgba(56, 189, 248, 0.4);">Base de Conhecimento Técnico ISP</span>
              <span class="badge" style="background:rgba(16, 185, 129, 0.15); color:var(--status-success);">11 POPs Homologados</span>
            </div>
            <h1 class="page-title">Materiais de Apoio & Procedimentos Operacionais (POPs)</h1>
            <p class="page-subtitle">Guia oficial de campo para engenheiros de redes, técnicos de instalação e suporte de provedores de internet.</p>
          </div>

          <!-- Campo de Busca Rápida de POPs -->
          <div style="width:100%; max-width:320px;">
            <input type="text" id="filter-pops" class="form-input" placeholder="🔍 Filtrar POPs (ex: vlan, wireguard, cpu...)" style="background:var(--bg-card); border-color:var(--border-medium);">
          </div>
        </div>

        <!-- Seção 1: Os 11 Procedimentos Operacionais Padrão -->
        <div style="margin-bottom:36px;">
          <h2 style="font-size:18px; font-weight:700; margin-bottom:16px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
            ${getIcon('file-text')}
            <span>11 Procedimentos Operacionais Padrão (POPs) da Equipe Técnica</span>
          </h2>

          <div class="pops-grid" id="pops-container" style="display:flex; flex-direction:column; gap:16px;">
            ${pops.map(pop => renderPopCard(pop)).join('')}
          </div>
        </div>

        <!-- Seção 2: Tabela Comparativa RouterOS v6 vs RouterOS v7 -->
        <div class="card" style="margin-bottom:36px;">
          <h2 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--accent-light); display:flex; align-items:center; gap:8px;">
            ${getIcon('layers')}
            <span>Tabela Comparativa de Engenharia: RouterOS v6 vs RouterOS v7</span>
          </h2>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:18px;">
            Mudanças arquiteturais fundamentais introduzidas na versão 7 do RouterOS e seus impactos operacionais em ISPs.
          </p>

          <div class="table-responsive" style="overflow-x:auto;">
            <table class="data-table" style="width:100%; text-align:left; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="border-bottom:2px solid var(--border-medium); color:var(--text-muted); font-size:11px; text-transform:uppercase;">
                  <th style="padding:10px 12px;">Recurso Técnico</th>
                  <th style="padding:10px 12px;">RouterOS v6 (Legacy)</th>
                  <th style="padding:10px 12px;">RouterOS v7 (Moderno)</th>
                  <th style="padding:10px 12px;">Impacto em Provedores ISP</th>
                </tr>
              </thead>
              <tbody>
                ${v6_vs_v7.map(item => `
                  <tr style="border-bottom:1px solid var(--border-subtle);">
                    <td style="padding:12px; font-weight:600; color:var(--text-primary); white-space:nowrap;">${escapeHtml(item.recurso)}</td>
                    <td style="padding:12px; color:var(--text-secondary);">${escapeHtml(item.v6)}</td>
                    <td style="padding:12px; color:var(--accent-light); font-weight:500;">${escapeHtml(item.v7)}</td>
                    <td style="padding:12px; color:var(--text-secondary); font-size:12px;">${escapeHtml(item.impacto_isp)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção 3: Portas e Protocolos Essenciais -->
        <div class="card">
          <h2 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
            ${getIcon('shield')}
            <span>Portas e Protocolos Críticos para Hardening de Redes MikroTik</span>
          </h2>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:18px;">
            Tabela de referência para criação de políticas de firewall input e proteção de serviços administrativos.
          </p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
            ${essential_ports.map(p => `
              <div style="background:var(--bg-surface); padding:12px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--accent-light);">${escapeHtml(p.port)}</span>
                  <span class="badge" style="background:rgba(2, 132, 199, 0.15); color:var(--text-primary); font-size:11px;">${escapeHtml(p.service)}</span>
                </div>
                <div style="font-size:11px; color:var(--text-secondary); line-height:1.4;">${escapeHtml(p.description)}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Filtro interativo de POPs
    const filterInput = document.getElementById('filter-pops');
    filterInput?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.pop-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'block' : 'none';
      });
    });

    // Copiar bloco de comandos
    window.copyPopCode = function(btn, codeId) {
      const el = document.getElementById(codeId);
      if (el) {
        navigator.clipboard.writeText(el.textContent);
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copiado!';
        setTimeout(() => { btn.innerHTML = originalText; }, 1800);
      }
    };

    window.togglePop = function(cardId) {
      const el = document.getElementById(cardId);
      el?.classList.toggle('open');
    };

  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--status-danger); padding:32px;">Erro ao carregar Materiais: ${err.message}</div>`;
  }
}

function renderPopCard(pop) {
  const codeId = `code_${pop.id}`;
  return `
    <div class="card pop-card" id="${pop.id}" style="border-left:4px solid var(--accent-primary); transition:all 0.2s;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; cursor:pointer;" onclick="togglePop('${pop.id}')">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
            <span style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--accent-light); background:rgba(2, 132, 199, 0.15); padding:2px 8px; border-radius:4px;">
              ${escapeHtml(pop.code)}
            </span>
            <span class="badge" style="background:var(--bg-elevated); color:var(--text-secondary); font-size:11px;">
              ${escapeHtml(pop.category)}
            </span>
            <span class="badge" style="background:rgba(16, 185, 129, 0.12); color:var(--status-success); font-size:11px;">
              ${escapeHtml(pop.routeros_version)}
            </span>
          </div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">
            ${escapeHtml(pop.title)}
          </h3>
          <p style="font-size:12px; color:var(--text-secondary);">${escapeHtml(pop.objective)}</p>
        </div>
        <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="event.stopPropagation(); togglePop('${pop.id}')">
          Ver Procedimento
        </button>
      </div>

      <!-- Conteúdo do Procedimento (Colapsável) -->
      <div class="pop-details" style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-subtle);">
        <!-- Checklist -->
        <div style="margin-bottom:14px;">
          <strong style="font-size:12px; color:var(--text-primary); display:block; margin-bottom:6px;">Checklist Obrigatório de Campo:</strong>
          <ul style="padding-left:18px; font-size:12px; color:var(--text-secondary); line-height:1.6;">
            ${pop.checklist.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>

        <!-- Comandos com Botão de Copiar -->
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:12px; color:var(--accent-light);">Comandos RouterOS:</strong>
            <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px;" onclick="copyPopCode(this, '${codeId}')">
              Copiar Comandos
            </button>
          </div>
          <pre id="${codeId}" class="code-block" style="background:var(--bg-main); border:1px solid var(--border-medium); border-radius:6px; padding:12px; font-family:var(--font-mono); font-size:12px; color:#38bdf8; overflow-x:auto;">${escapeHtml(pop.commands)}</pre>
        </div>

        <!-- Comandos de Validação -->
        <div style="background:var(--bg-surface); padding:10px 12px; border-radius:6px; font-size:11px; color:var(--text-secondary);">
          <strong style="color:var(--status-success);">Comandos de Validação Pós-execução:</strong>
          <pre style="margin-top:4px; font-family:var(--font-mono); color:var(--text-primary);">${escapeHtml(pop.verification)}</pre>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

