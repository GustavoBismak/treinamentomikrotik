// VIEW: PROJETO FINAL OBRIGATÓRIO — IMPLANTAÇÃO COMPLETA DE REDE CORPORATIVA
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderFinalProject(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando Projeto Final de Implantação...</div>
    </div>
  `;

  try {
    const data = await API.getFinalProject();
    const submission = data.submission || null;
    const stageData = submission?.stage_data || {};

    const isApproved = submission?.status === 'approved';
    const isSubmitted = submission?.status === 'submitted' || submission?.status === 'under_review';

    container.innerHTML = `
      <div class="container">
        <!-- Navegação de Retorno -->
        <div style="margin-bottom:18px;">
          <a href="#dashboard" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:8px;">
            ${getIcon('arrow-left')}
            <span>Voltar ao Painel Inicial</span>
          </a>
        </div>

        <!-- Topo com Status da Submissão -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
              <span class="badge" style="background:rgba(2, 132, 199, 0.2); color:var(--accent-light); border:1px solid rgba(56, 189, 248, 0.4);">Projeto Prático de Conclusão</span>
              ${submission ? getStatusPill(submission.status) : '<span class="status-pill status-gray">Não Iniciado</span>'}
            </div>
            <h1 class="page-title">Projeto Final: Implantação de Rede em Empresa ISP</h1>
            <p class="page-subtitle">Simulação real de ponta a ponta: do levantamento e dimensionamento até a configuração de RouterOS v7, testes e defesa técnica.</p>
          </div>

          <div style="display:flex; gap:10px;">
            <button id="btn-save-draft" class="btn btn-secondary" ${isApproved ? 'disabled' : ''}>
              ${getIcon('download')}
              <span>Salvar Rascunho</span>
            </button>
            <button id="btn-submit-final" class="btn btn-primary" ${isApproved ? 'disabled' : ''}>
              ${getIcon('check')}
              <span>${isSubmitted ? 'Reenviar Atualização' : 'Submeter ao Instrutor'}</span>
            </button>
          </div>
        </div>

        <!-- Parecer do Instrutor (Se avaliado) -->
        ${submission?.instructor_feedback ? `
          <div class="card" style="margin-bottom:24px; border-left:4px solid ${isApproved ? 'var(--status-success)' : 'var(--status-warning)'}; background:var(--bg-elevated);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h3 style="font-size:16px; color:${isApproved ? 'var(--status-success)' : 'var(--status-warning)'}; display:flex; align-items:center; gap:8px;">
                ${getIcon(isApproved ? 'award' : 'alert')}
                <span>Parecer do Instrutor — Avaliação Técnica</span>
              </h3>
              ${submission.grade !== null ? `<span style="font-size:18px; font-weight:800; color:var(--text-primary); font-family:var(--font-mono);">Nota: ${submission.grade}/100</span>` : ''}
            </div>
            <p style="color:var(--text-secondary); font-size:13px; line-height:1.6; white-space:pre-wrap;">${escapeHtml(submission.instructor_feedback)}</p>
            ${submission.reviewed_at ? `<div style="margin-top:10px; font-size:11px; color:var(--text-muted);">Homologado em: ${new Date(submission.reviewed_at).toLocaleString('pt-BR')}</div>` : ''}
          </div>
        ` : ''}

        <!-- Resumo do Cenário Empresarial -->
        <div class="card" style="margin-bottom:24px; background:var(--bg-card);">
          <h2 style="font-size:16px; font-weight:700; margin-bottom:12px; color:var(--accent-light); display:flex; align-items:center; gap:8px;">
            ${getIcon('briefcase')}
            <span>O Cenário: Empresa 'Logística & Distribuição Express'</span>
          </h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; font-size:13px; color:var(--text-secondary);">
            <div style="background:var(--bg-surface); padding:14px; border-radius:8px; border:1px solid var(--border-subtle);">
              <strong style="color:var(--text-primary); display:block; margin-bottom:6px;">Matriz (Sede Operacional):</strong>
              • 50 Colaboradores (Administrativo, Financeiro, Vendas)<br>
              • Servidor de Arquivos e ERP local<br>
              • 24 Câmeras IP (CFTV com gravação NVR contínua)<br>
              • Link Primário Fibra Óptica 500 Mbps + Backup Rádio 100 Mbps
            </div>
            <div style="background:var(--bg-surface); padding:14px; border-radius:8px; border:1px solid var(--border-subtle);">
              <strong style="color:var(--text-primary); display:block; margin-bottom:6px;">Filial (Centro de Distribuição):</strong>
              • 15 Operadores de Logística com coletores Wi-Fi<br>
              • 12 Câmeras IP locais<br>
              • Necessidade de acessar o ERP na Matriz em tempo real<br>
              • Link Fibra Óptica 200 Mbps (IP Dinâmico com CGNAT)
            </div>
            <div style="background:var(--bg-surface); padding:14px; border-radius:8px; border:1px solid var(--border-subtle);">
              <strong style="color:var(--text-primary); display:block; margin-bottom:6px;">Requisitos Críticos:</strong>
              • Isolamento total entre rede de Câmeras, Visitantes e Dados<br>
              • VPN WireGuard segura e tolerante a failover<br>
              • Proteção de Firewall contra acessos externos não autorizados<br>
              • QoS evitando que downloads de visitantes travem o ERP
            </div>
          </div>
        </div>

        <!-- As 7 Etapas Estruturadas do Projeto -->
        <div class="card" style="margin-bottom:24px;">
          <h2 style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text-primary);">
            As 7 Etapas de Implantação
          </h2>

          <div class="stage-accordion">
            
            <!-- Etapa 1 -->
            <div class="stage-item open" id="stage-box-1">
              <div class="stage-header" onclick="toggleStage('stage-box-1')">
                <div class="stage-title">
                  <span class="stage-number">1</span>
                  <div>
                    <strong>Etapa 1: Levantamento de Requisitos e Restrições</strong>
                    <span>Identificação de usuários, serviços críticos, links e plano de contingência</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <label class="form-label">Descreva os requisitos apurados na visita técnica e os serviços críticos identificados:</label>
                <textarea class="form-textarea" id="input-stage-1" rows="4" placeholder="Ex: A matriz possui 50 usuários que demandam acesso ao ERP via porta TCP 8080. As 24 câmeras consomem 4 Mbps cada (total 96 Mbps contínuos na rede local). O tráfego de visitantes deve ser totalmente isolado...">${escapeHtml(stageData.stage_1 || '')}</textarea>
              </div>
            </div>

            <!-- Etapa 2 -->
            <div class="stage-item" id="stage-box-2">
              <div class="stage-header" onclick="toggleStage('stage-box-2')">
                <div class="stage-title">
                  <span class="stage-number">2</span>
                  <div>
                    <strong>Etapa 2: Projeto e Topologia L2/L3</strong>
                    <span>Dimensionamento de roteadores, tabela de VLANs e plano de endereçamento IP</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <label class="form-label">Preencha o plano de endereçamento, escolha de hardware e distribuição de VLANs:</label>
                <textarea class="form-textarea" id="input-stage-2" rows="6" placeholder="Hardware Matriz: MikroTik RB5009UG+S+IN | Hardware Filial: hEX (RB750Gr3)&#10;&#10;VLAN 10 - Gerência & Servidores: 192.168.10.0/24 (GW .1)&#10;VLAN 20 - Colaboradores: 192.168.20.0/24 (GW .1)&#10;VLAN 30 - CFTV/Câmeras: 192.168.30.0/24 (GW .1)&#10;VLAN 40 - Visitantes/Guest: 172.16.40.0/24 (GW .1)&#10;Túnel WireGuard: 10.255.255.0/30 (.1 Matriz, .2 Filial)">${escapeHtml(stageData.stage_2 || '')}</textarea>
              </div>
            </div>

            <!-- Etapa 3 -->
            <div class="stage-item" id="stage-box-3">
              <div class="stage-header" onclick="toggleStage('stage-box-3')">
                <div class="stage-title">
                  <span class="stage-number">3</span>
                  <div>
                    <strong>Etapa 3: Preparação da Janela de Mudança e Plano de Rollback</strong>
                    <span>Cronograma de corte, backup preventivo e procedimento de contingência</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <label class="form-label">Defina a janela de mudança acordada com o cliente e as etapas de reversão (rollback):</label>
                <textarea class="form-textarea" id="input-stage-3" rows="4" placeholder="Janela: Sábado das 19:00 às 22:00 (fora do horário comercial).&#10;Backup do roteador antigo exportado em .rsc e mantido em pendrive.&#10;Se os testes falharem até as 21:30, o equipamento legado será reconectado imediatamente...">${escapeHtml(stageData.stage_3 || '')}</textarea>
              </div>
            </div>

            <!-- Etapa 4 -->
            <div class="stage-item" id="stage-box-4">
              <div class="stage-header" onclick="toggleStage('stage-box-4')">
                <div class="stage-title">
                  <span class="stage-number">4</span>
                  <div>
                    <strong>Etapa 4: Configuração RouterOS v7 (Scripts e Comandos)</strong>
                    <span>Comandos comentados de Bridge VLAN Filtering, WireGuard, Firewall e QoS</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <label class="form-label">Insira o script RouterOS v7 estruturado que será aplicado no roteador:</label>
                <textarea class="form-textarea font-mono" id="input-stage-4" rows="10" placeholder="# 1. Bridge VLAN Filtering&#10;/interface bridge add name=bridge-lan vlan-filtering=no&#10;/interface vlan add name=vlan10 vlan-id=10 interface=bridge-lan&#10;...&#10;# 2. WireGuard Matriz&#10;/interface wireguard add name=wg-filial listen-port=51820&#10;...&#10;# 3. Firewall Seguro (Drop input na WAN, FastTrack em conexões válidas)">${escapeHtml(stageData.stage_4 || '')}</textarea>
              </div>
            </div>

            <!-- Etapa 5 -->
            <div class="stage-item" id="stage-box-5">
              <div class="stage-header" onclick="toggleStage('stage-box-5')">
                <div class="stage-title">
                  <span class="stage-number">5</span>
                  <div>
                    <strong>Etapa 5: Testes de Validação e Aceitação</strong>
                    <span>Comprovação de isolamento de VLANs, failover de WAN e estabilidade da VPN</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <label class="form-label">Descreva os testes práticos executados para homologação da rede:</label>
                <textarea class="form-textarea" id="input-stage-5" rows="4" placeholder="1. Teste de isolamento: Um host na VLAN 40 (Visitante) não pinga o servidor ERP na VLAN 10 (Drop pelo firewall forward).&#10;2. Teste de failover: Cabo da WAN1 desconectado, o roteador migrou a rota default para WAN2 em 3 segundos sem travar as sessões.&#10;3. Teste WireGuard: Ping contínuo da Filial para o ERP com latência de 8ms e zero perdas.">${escapeHtml(stageData.stage_5 || '')}</textarea>
              </div>
            </div>

            <!-- Etapa 6 -->
            <div class="stage-item" id="stage-box-6">
              <div class="stage-header" onclick="toggleStage('stage-box-6')">
                <div class="stage-title">
                  <span class="stage-number">6</span>
                  <div>
                    <strong>Etapa 6: Documentação e Entrega Técnica ao Cliente</strong>
                    <span>Manual de operações, diagrama final e registro de credenciais</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <label class="form-label">Relacione os artefatos entregues à gerência de TI da empresa contratante:</label>
                <textarea class="form-textarea" id="input-stage-6" rows="4" placeholder="• Diagrama topológico em PDF com portas e etiquetas de cabos Cat6.&#10;• Inventário com números de série, MACs, versões de RouterOS e firmware.&#10;• Arquivo de backup limpo (.rsc) arquivado no repositório de segurança do NOC.&#10;• Termo de homologação assinado pelo responsável da empresa.">${escapeHtml(stageData.stage_6 || '')}</textarea>
              </div>
            </div>

            <!-- Etapa 7 -->
            <div class="stage-item" id="stage-box-7">
              <div class="stage-header" onclick="toggleStage('stage-box-7')">
                <div class="stage-title">
                  <span class="stage-number">7</span>
                  <div>
                    <strong>Etapa 7: Defesa Técnica & Diagnóstico de Falha Simulada</strong>
                    <span>Resolução do incidente intencional aplicado pelo instrutor no cenário</span>
                  </div>
                </div>
                <span class="stage-toggle-icon">▼</span>
              </div>
              <div class="stage-content">
                <div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.25); border-radius:6px; padding:12px; margin-bottom:12px; font-size:12px; color:#fca5a5;">
                  <strong>⚠️ Cenário de Incidente do Instrutor:</strong><br>
                  "Após 2 dias da entrega, o cliente reclama que as câmeras da filial param de gravar no NVR da matriz esporadicamente, e o tráfego de internet dos colaboradores ficou lento. Ao analisar o roteador, você nota CPU em 98% e pacotes TCP com MTU 1500 travando no túnel WireGuard."
                </div>
                <label class="form-label">Diagnóstico de Causa Raiz e Solução Aplicada:</label>
                <textarea class="form-textarea" id="input-stage-7" rows="5" placeholder="Diagnóstico: O túnel WireGuard consome overhead reduzindo o MTU para 1420. Pacotes TCP com flag Don't Fragment (DF) e MTU 1500 estavam sendo descartados (Black Hole MTU). A CPU em 98% decorria da ausência de regra FastTrack para pacotes established/related na bridge.&#10;&#10;Solução: Adicionada regra de TCP MSS Clamping para interface WireGuard (new-mss=1380) e ativado FastTrack no firewall forward. CPU normalizada para 4%.">${escapeHtml(stageData.stage_7 || '')}</textarea>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    // Eventos de salvar e submeter
    window.toggleStage = function(boxId) {
      const el = document.getElementById(boxId);
      el?.classList.toggle('open');
    };

    function collectStages() {
      return {
        stage_1: document.getElementById('input-stage-1')?.value || '',
        stage_2: document.getElementById('input-stage-2')?.value || '',
        stage_3: document.getElementById('input-stage-3')?.value || '',
        stage_4: document.getElementById('input-stage-4')?.value || '',
        stage_5: document.getElementById('input-stage-5')?.value || '',
        stage_6: document.getElementById('input-stage-6')?.value || '',
        stage_7: document.getElementById('input-stage-7')?.value || ''
      };
    }

    const btnDraft = document.getElementById('btn-save-draft');
    btnDraft?.addEventListener('click', async () => {
      const stageData = collectStages();
      btnDraft.disabled = true;
      btnDraft.querySelector('span').textContent = 'Salvando...';

      try {
        await API.saveFinalProject({
          company_name: 'Logística & Distribuição Express',
          stage_data: stageData,
          status: 'draft'
        });
        alert('Rascunho do Projeto Final salvo com sucesso!');
      } catch (err) {
        alert('Erro ao salvar rascunho: ' + err.message);
      } finally {
        btnDraft.disabled = false;
        btnDraft.querySelector('span').textContent = 'Salvar Rascunho';
      }
    });

    const btnSubmit = document.getElementById('btn-submit-final');
    btnSubmit?.addEventListener('click', async () => {
      const stageData = collectStages();
      if (!stageData.stage_1 || !stageData.stage_2 || !stageData.stage_4 || !stageData.stage_7) {
        alert('Por favor, preencha pelo menos as Etapas 1, 2, 4 e 7 antes de submeter o projeto ao instrutor.');
        return;
      }

      if (!confirm('Deseja submeter seu Projeto Final para avaliação e homologação do Instrutor?')) {
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.querySelector('span').textContent = 'Submetendo...';

      try {
        await API.submitFinalProject({
          company_name: 'Logística & Distribuição Express',
          stage_data: stageData,
          status: 'submitted'
        });
        alert('Projeto Final submetido com sucesso! O instrutor avaliará sua proposta e emitirá o parecer.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao submeter projeto: ' + err.message);
        btnSubmit.disabled = false;
        btnSubmit.querySelector('span').textContent = 'Submeter ao Instrutor';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--status-danger); padding:32px;">Erro ao carregar Projeto Final: ${err.message}</div>`;
  }
}

function getStatusPill(status) {
  if (status === 'approved') return '<span class="status-pill status-green">✓ Aprovado</span>';
  if (status === 'submitted' || status === 'under_review') return '<span class="status-pill status-blue">Em Revisão pelo Instrutor</span>';
  if (status === 'revisions_required') return '<span class="status-pill status-amber">Revisões Necessárias</span>';
  return '<span class="status-pill status-gray">Rascunho em Andamento</span>';
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

