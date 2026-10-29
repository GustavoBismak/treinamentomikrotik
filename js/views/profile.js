// VIEW: PERFIL DO COLABORADOR E CONFIGURAÇÕES DA CONTA
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export async function renderProfile(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px;">
      <div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando dados do perfil...</div>
    </div>
  `;

  try {
    const data = await API.getProfile();
    const { user, metrics } = data;

    container.innerHTML = `
      <div class="container" style="max-width:880px;">
        <!-- Topo -->
        <div style="margin-bottom:24px;">
          <h1 class="page-title">Perfil do Colaborador & Configurações</h1>
          <p class="page-subtitle">Gerencie suas informações cadastrais, credenciais de acesso e visualize seu histórico técnico acumulado.</p>
        </div>

        <!-- Cartão Principal de Identificação -->
        <div class="card" style="margin-bottom:24px; background:var(--bg-card);">
          <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
            <div class="user-avatar" style="width:64px; height:64px; font-size:22px; border-radius:14px;">
              ${user.name.substring(0, 2).toUpperCase()}
            </div>
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px; flex-wrap:wrap;">
                <h2 style="font-size:20px; font-weight:700; color:var(--text-primary); margin:0;">${escapeHtml(user.name)}</h2>
                <span class="role-pill">${user.role === 'admin' ? 'Administrador' : (user.role === 'instructor' ? 'Instrutor' : 'Aluno Técnico')}</span>
              </div>
              <div style="font-size:13px; color:var(--text-secondary); margin-bottom:2px;">
                Usuário: <code style="color:var(--accent-light); font-family:var(--font-mono);">${escapeHtml(user.username)}</code> • E-mail: ${escapeHtml(user.email)}
              </div>
              <div style="font-size:12px; color:var(--text-muted);">
                Setor: ${escapeHtml(user.department || 'Operações / Suporte Técnico ISP')} • Cadastrado em: ${new Date(user.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          <!-- Métricas de Desempenho do Aluno -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; margin-top:20px; padding-top:20px; border-top:1px solid var(--border-subtle);">
            <div style="background:var(--bg-surface); padding:12px; border-radius:8px; border:1px solid var(--border-subtle); text-align:center;">
              <span style="font-size:22px; font-weight:800; color:var(--accent-light); font-family:var(--font-mono);">${metrics.completed_lessons}</span>
              <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Aulas Concluídas</p>
            </div>
            <div style="background:var(--bg-surface); padding:12px; border-radius:8px; border:1px solid var(--border-subtle); text-align:center;">
              <span style="font-size:22px; font-weight:800; color:var(--status-success); font-family:var(--font-mono);">${metrics.passed_labs} / 6</span>
              <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Laboratórios Aprovados</p>
            </div>
            <div style="background:var(--bg-surface); padding:12px; border-radius:8px; border:1px solid var(--border-subtle); text-align:center;">
              <span style="font-size:22px; font-weight:800; color:${metrics.avg_score >= 80 ? 'var(--status-success)' : 'var(--status-warning)'}; font-family:var(--font-mono);">${metrics.avg_score}%</span>
              <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Média nas Provas</p>
            </div>
            <div style="background:var(--bg-surface); padding:12px; border-radius:8px; border:1px solid var(--border-subtle); text-align:center;">
              <span style="font-size:20px; font-weight:800; color:${metrics.has_certificate ? 'var(--status-success)' : 'var(--text-muted)'}; font-family:var(--font-mono);">${metrics.has_certificate ? 'Emitido' : 'Pendente'}</span>
              <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Certificado Interno</p>
            </div>
          </div>
        </div>

        <!-- Formulários em Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          
          <!-- Formulário 1: Dados Pessoais -->
          <div class="card">
            <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              ${getIcon('user')}
              <span>Atualizar Dados Cadastrais</span>
            </h3>

            <div id="profile-alert-info" style="display:none;" class="auth-alert"></div>

            <form id="form-update-profile">
              <div class="form-group" style="margin-bottom:14px;">
                <label style="display:block; font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Nome Completo</label>
                <input type="text" id="prof-name" class="form-input" value="${escapeHtml(user.name)}" required>
              </div>

              <div class="form-group" style="margin-bottom:14px;">
                <label style="display:block; font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Setor / Departamento</label>
                <input type="text" id="prof-dept" class="form-input" value="${escapeHtml(user.department || '')}">
              </div>

              <button type="submit" class="btn btn-primary" id="btn-save-info" style="width:100%; justify-content:center;">
                <span>Salvar Alterações</span>
              </button>
            </form>
          </div>

          <!-- Formulário 2: Alteração de Senha -->
          <div class="card">
            <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              ${getIcon('lock')}
              <span>Alterar Senha de Acesso</span>
            </h3>

            <div id="profile-alert-pass" style="display:none;" class="auth-alert"></div>

            <form id="form-update-pass">
              <div class="form-group" style="margin-bottom:14px;">
                <label style="display:block; font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Senha Atual</label>
                <input type="password" id="prof-current-pass" class="form-input" required placeholder="Digite sua senha atual">
              </div>

              <div class="form-group" style="margin-bottom:14px;">
                <label style="display:block; font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Nova Senha (mín. 6 dígitos)</label>
                <input type="password" id="prof-new-pass" class="form-input" minlength="6" required placeholder="Crie sua nova senha">
              </div>

              <button type="submit" class="btn btn-secondary" id="btn-save-pass" style="width:100%; justify-content:center;">
                <span>Atualizar Senha</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    `;

    // Atualização de dados cadastrais
    const formInfo = document.getElementById('form-update-profile');
    const alertInfo = document.getElementById('profile-alert-info');

    formInfo?.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('prof-name')?.value.trim();
      const department = document.getElementById('prof-dept')?.value.trim();

      try {
        await API.updateProfile({ name, department });
        alertInfo.textContent = 'Dados atualizados com sucesso!';
        alertInfo.className = 'auth-alert auth-alert-success';
        alertInfo.style.display = 'block';
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        alertInfo.textContent = err.message || 'Erro ao atualizar dados.';
        alertInfo.className = 'auth-alert auth-alert-error';
        alertInfo.style.display = 'block';
      }
    });

    // Atualização de senha
    const formPass = document.getElementById('form-update-pass');
    const alertPass = document.getElementById('profile-alert-pass');

    formPass?.addEventListener('submit', async e => {
      e.preventDefault();
      const current_password = document.getElementById('prof-current-pass')?.value;
      const new_password = document.getElementById('prof-new-pass')?.value;

      try {
        await API.updateProfile({ current_password, new_password });
        alertPass.textContent = 'Senha atualizada com sucesso!';
        alertPass.className = 'auth-alert auth-alert-success';
        alertPass.style.display = 'block';
        formPass.reset();
      } catch (err) {
        alertPass.textContent = err.message || 'Falha ao alterar senha. Verifique a senha atual.';
        alertPass.className = 'auth-alert auth-alert-error';
        alertPass.style.display = 'block';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--status-danger); padding:32px;">Erro ao carregar Perfil: ${err.message}</div>`;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

