// VIEW: CERTIFICADO DE CONCLUSÃO INTERNO ISP
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderCertificate(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Consultando registro de certificação interna...</div>
    </div>
  `;

  try {
    const data = await API.getMyCertificate();
    const { certificate, is_eligible, passed_modules, total_modules } = data;

    if (!certificate && !is_eligible) {
      container.innerHTML = `
        <div class="card" style="max-width:640px; margin:40px auto; text-align:center; padding:36px;">
          <div style="color:var(--status-warning); font-size:36px; margin-bottom:12px;">${getIcon('award')}</div>
          <h2 style="font-size:20px; font-weight:700; color:var(--text-primary); margin-bottom:10px;">
            Certificado Pendente de Homologação
          </h2>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:20px; line-height:1.6;">
            Para solicitar a emissão do Certificado de Capacitação Técnica Interna em MikroTik RouterOS, o colaborador deve obter aprovação com nota mínima de <strong>80%</strong> em pelo menos 3 módulos técnicos essenciais e nos laboratórios práticos.
          </p>
          <div style="display:inline-block; padding:10px 16px; background-color:var(--bg-card); border-radius:var(--radius-sm); font-size:12px; font-family:var(--font-mono); margin-bottom:20px;">
            Módulos aprovados com &ge; 80%: <strong>${passed_modules}</strong> de <strong>${total_modules}</strong>
          </div>
          <div>
            <a href="#syllabus" class="btn btn-primary">Continuar Aulas e Avaliações</a>
          </div>
        </div>
      `;
      return;
    }

    if (!certificate && is_eligible) {
      container.innerHTML = `
        <div class="card" style="max-width:640px; margin:40px auto; text-align:center; padding:36px;">
          <div style="color:var(--status-success); font-size:36px; margin-bottom:12px;">${getIcon('award')}</div>
          <h2 style="font-size:20px; font-weight:700; color:var(--text-primary); margin-bottom:10px;">
            Parabéns! Você está Elegível para o Certificado
          </h2>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:24px; line-height:1.6;">
            Seu desempenho teórico e prático atingiu os requisitos operacionais da empresa. Clique no botão abaixo para gerar o registro oficial com assinatura digital e código de verificação hash.
          </p>
          <button id="btn-generate-cert" class="btn btn-primary" style="padding:10px 24px; font-size:14px;">
            ${getIcon('award')}
            <span>Gerar Meu Certificado Oficial</span>
          </button>
        </div>
      `;

      container.querySelector('#btn-generate-cert').addEventListener('click', async () => {
        try {
          const res = await API.requestCertificate();
          renderCertificate(container);
        } catch (err) {
          alert('Erro ao gerar certificado: ' + err.message);
        }
      });
      return;
    }

    // Exibição do Certificado Emitido
    container.innerHTML = `
      <div class="certificate-wrapper">
        <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <a href="#dashboard" style="font-size:12px; color:var(--accent-light); text-decoration:none;">
            &larr; Voltar para o Painel Inicial
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.print()">
            ${getIcon('printer')}
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>

        <div class="certificate-paper">
          <div class="certificate-watermark">MIKROTIK ACADEMY ISP</div>

          <div class="certificate-header">
            <div class="certificate-badge">CAPACITAÇÃO TÉCNICA OPERACIONAL DE REDES</div>
            <h2>Certificado de Qualificação Técnica</h2>
          </div>

          <div class="certificate-body">
            <div class="cert-certifies">Certificamos para os devidos fins de prontuário técnico interno que</div>
            <div class="cert-student-name">${escapeHtml(certificate.user_name)}</div>
            <p class="cert-text">
              concluiu com êxito o programa intensivo de treinamento profissional <strong>${escapeHtml(certificate.course_title)}</strong>, demonstrando proficiência no planejamento, instalação física, endereçamento IP, comutação L2, roteamento, firewall Netfilter, VLANs 802.1Q, VPNs WireGuard e metodologia padronizada de diagnóstico de falhas em equipamentos MikroTik RouterOS v7.
            </p>

            <div class="cert-stats-grid">
              <div class="cert-stat-item">
                <span class="cert-stat-label">Carga Horária</span>
                <span class="cert-stat-val">${certificate.hours_completed} Horas</span>
              </div>
              <div class="cert-stat-item">
                <span class="cert-stat-label">Aproveitamento</span>
                <span class="cert-stat-val">${certificate.final_grade}%</span>
              </div>
              <div class="cert-stat-item">
                <span class="cert-stat-label">Data de Conclusão</span>
                <span class="cert-stat-val">${new Date(certificate.issued_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div class="certificate-footer">
            <div class="cert-signature">
              <div class="cert-sign-line"></div>
              <div class="cert-sign-title">Eng. André Martins Pires</div>
              <div class="cert-sign-role">Instrutor Técnico &amp; Coordenador de Engenharia</div>
            </div>

            <div class="cert-verification-box">
              <div>REGISTRO: <span class="cert-code">${escapeHtml(certificate.certificate_code)}</span></div>
              <div>HASH: <span style="font-size:9px;">${escapeHtml(certificate.verification_hash.substring(0, 32))}...</span></div>
              <div>AUTENTICIDADE: VÁLIDO E HOMOLOGADO</div>
            </div>
          </div>

          <!-- Aviso Legal Obrigatório (Item 6 dos Requisitos) -->
          <div class="cert-disclaimer">
            <strong>AVISO LEGAL E INSTITUCIONAL:</strong> Este documento comprova a capacitação técnica interna de colaboradores no âmbito operacional da empresa provedora de internet. Este certificado <u>NÃO equivale</u> nem substitui as certificações oficiais emitidas diretamente pela MikroTik SIA (como MTCNA, MTCRE ou MTCSE).
          </div>
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
