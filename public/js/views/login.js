// VIEW: TELA DE AUTENTICAÇÃO E CADASTRO INDIVIDUAL (SPLIT SCREEN LAYOUT)
import { API } from '../api.js';
import { getIcon } from '../icons.js';

export function renderLoginView(container, onLoginSuccess) {
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-container-split">
        
        <!-- Coluna Esquerda: Showcase Visual de Redes / ISP -->
        <div class="auth-banner-showcase">
          <div class="auth-banner-overlay"></div>
          <div class="auth-banner-content">
            <div>
              <div class="auth-banner-tag">
                <span class="pulse-dot"></span>
                <span>Academia Técnica MikroTik</span>
              </div>
              <h2 class="auth-banner-title">Capacitação Profissional RouterOS v7 para ISPs</h2>
              <p class="auth-banner-subtitle">
                Plataforma corporativa para qualificação de engenheiros de redes, analistas de NOC e técnicos de campo.
              </p>

              <!-- Destaques Estruturados -->
              <div class="auth-features-list">
                <div class="auth-feature-item">
                  <div class="auth-feature-icon">${getIcon('layers')}</div>
                  <div class="auth-feature-text">
                    <strong>15 Módulos Estruturados</strong>
                    <span>De fundamentos OSI e TCP/IP até BGP, OSPF, VLANs, MPLS e Firewall avançado.</span>
                  </div>
                </div>

                <div class="auth-feature-item">
                  <div class="auth-feature-icon">${getIcon('terminal')}</div>
                  <div class="auth-feature-text">
                    <strong>Laboratórios Práticos de Troubleshooting</strong>
                    <span>Bancada interativa com simulador CLI de RouterOS e utilitário WinBox.</span>
                  </div>
                </div>

                <div class="auth-feature-item">
                  <div class="auth-feature-icon">${getIcon('shield')}</div>
                  <div class="auth-feature-text">
                    <strong>Ambiente Técnico Individualizado</strong>
                    <span>Cada colaborador possui seu login particular, aulas e progresso gravados em segurança.</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="auth-banner-footer">
              <span>RouterOS v7.14 Stable • Laboratório Operacional</span>
              <span>ISP Engenharia de Redes</span>
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Formulário de Autenticação / Cadastro -->
        <div class="auth-card">
          <!-- Cabeçalho -->
          <div class="auth-header">
            <div class="auth-header-top">
              <div class="auth-brand-icon">MT</div>
              <div>
                <h1 class="auth-title">Portal de Capacitação</h1>
                <p class="auth-subtitle">Acesso individual de técnicos e instrutores</p>
              </div>
            </div>
          </div>

          <!-- Abas: Entrar vs Cadastrar -->
          <div class="auth-tabs">
            <button type="button" class="auth-tab-btn active" id="tab-btn-login">
              ${getIcon('lock')}
              <span>Entrar na Conta</span>
            </button>
            <button type="button" class="auth-tab-btn" id="tab-btn-register">
              ${getIcon('user-plus')}
              <span>Novo Aluno</span>
            </button>
          </div>

          <!-- Mensagens de Alerta -->
          <div class="auth-alert" id="auth-alert" style="display:none;"></div>

          <!-- Formulário de Login -->
          <form class="auth-form" id="form-login" novalidate>
            <div class="form-group">
              <label for="login-username">Usuário ou E-mail</label>
              <div class="input-with-icon">
                <span class="input-icon">${getIcon('user')}</span>
                <input 
                  type="text" 
                  id="login-username" 
                  name="username" 
                  required 
                  autocomplete="username" 
                  placeholder="ex: tecnico.carlos ou seu e-mail"
                  inputmode="email"
                >
              </div>
            </div>

            <div class="form-group">
              <div class="form-label-row">
                <label for="login-password">Senha de Acesso</label>
                <button type="button" class="btn-toggle-pass" id="btn-toggle-login-pass" tabindex="-1" aria-label="Mostrar ou ocultar senha">Mostrar</button>
              </div>
              <div class="input-with-icon">
                <span class="input-icon">${getIcon('lock')}</span>
                <input 
                  type="password" 
                  id="login-password" 
                  name="password" 
                  required 
                  autocomplete="current-password" 
                  placeholder="Sua senha secreta"
                >
              </div>
            </div>

            <button type="submit" class="btn btn-primary auth-submit-btn" id="btn-submit-login">
              <span>Acessar Plataforma</span>
            </button>
          </form>

          <!-- Formulário de Cadastro de Novo Aluno -->
          <form class="auth-form" id="form-register" style="display:none;" novalidate>
            <div class="form-group">
              <label for="reg-name">Nome Completo</label>
              <div class="input-with-icon">
                <span class="input-icon">${getIcon('user')}</span>
                <input 
                  type="text" 
                  id="reg-name" 
                  name="name" 
                  required 
                  autocomplete="name"
                  placeholder="ex: João da Silva"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="reg-email">E-mail Corporativo</label>
              <div class="input-with-icon">
                <span class="input-icon">${getIcon('mail')}</span>
                <input 
                  type="email" 
                  id="reg-email" 
                  name="email" 
                  required 
                  autocomplete="email"
                  inputmode="email"
                  placeholder="joao.silva@provedor.com.br"
                >
              </div>
            </div>

            <div class="form-group form-row-split">
              <div class="form-col">
                <label for="reg-username">Nome de Usuário</label>
                <input 
                  type="text" 
                  id="reg-username" 
                  name="username" 
                  required 
                  autocomplete="username"
                  placeholder="joao.silva"
                >
              </div>

              <div class="form-col">
                <label for="reg-department">Setor / Cargo</label>
                <input 
                  type="text" 
                  id="reg-department" 
                  name="department" 
                  autocomplete="organization-title"
                  placeholder="ex: Suporte N1, NOC"
                >
              </div>
            </div>

            <div class="form-group">
              <div class="form-label-row">
                <label for="reg-password">Senha (mínimo 6 caracteres)</label>
                <button type="button" class="btn-toggle-pass" id="btn-toggle-reg-pass" tabindex="-1" aria-label="Mostrar ou ocultar senha">Mostrar</button>
              </div>
              <div class="input-with-icon">
                <span class="input-icon">${getIcon('lock')}</span>
                <input 
                  type="password" 
                  id="reg-password" 
                  name="password" 
                  minlength="6" 
                  required 
                  autocomplete="new-password"
                  placeholder="Crie sua senha segura"
                >
              </div>
            </div>

            <button type="submit" class="btn btn-primary auth-submit-btn" id="btn-submit-register">
              <span>Criar Conta e Iniciar Treinamento</span>
            </button>
          </form>

          <div class="auth-footer">
            <span>🔒 Acesso individual criptografado • Histórico de aulas e certificados protegidos.</span>
          </div>
        </div>

      </div>
    </div>
  `;

  // Elementos do DOM
  const tabLogin    = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const formLogin   = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const alertBox    = document.getElementById('auth-alert');

  function showAlert(msg, isSuccess = false) {
    alertBox.textContent = msg;
    alertBox.className = 'auth-alert ' + (isSuccess ? 'auth-alert-success' : 'auth-alert-error');
    alertBox.style.display = 'block';
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  // Alternância entre abas
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    hideAlert();
    document.getElementById('login-username').focus();
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
    hideAlert();
    document.getElementById('reg-name').focus();
  });

  // Alternador de visibilidade de senha
  function setupPassToggle(btnId, inputId) {
    const btn   = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? 'Ocultar' : 'Mostrar';
    });
  }
  setupPassToggle('btn-toggle-login-pass', 'login-password');
  setupPassToggle('btn-toggle-reg-pass',   'reg-password');

  // Submit Login
  formLogin.addEventListener('submit', async e => {
    e.preventDefault();
    hideAlert();

    const username  = document.getElementById('login-username').value.trim();
    const password  = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('btn-submit-login');

    if (!username || !password) {
      showAlert('Por favor, informe seu usuário ou e-mail e senha.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Autenticando…';

    try {
      const data = await API.login(username, password);
      showAlert(`Bem-vindo(a), ${data.user.name}! Carregando seus módulos…`, true);
      setTimeout(() => onLoginSuccess(data.user), 350);
    } catch (err) {
      showAlert(err.message || 'Falha ao entrar. Verifique seu usuário e senha.');
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Acessar Plataforma';
    }
  });

  // Submit Cadastro
  formRegister.addEventListener('submit', async e => {
    e.preventDefault();
    hideAlert();

    const name       = document.getElementById('reg-name').value.trim();
    const email      = document.getElementById('reg-email').value.trim();
    const username   = document.getElementById('reg-username').value.trim();
    const department = document.getElementById('reg-department').value.trim();
    const password   = document.getElementById('reg-password').value;
    const submitBtn  = document.getElementById('btn-submit-register');

    if (!name || !email || !username || !password) {
      showAlert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      showAlert('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Criando conta…';

    try {
      const data = await API.register({ name, email, username, department, password });
      showAlert(`Conta criada com sucesso! Bem-vindo(a), ${data.user.name}!`, true);
      setTimeout(() => onLoginSuccess(data.user), 350);
    } catch (err) {
      showAlert(err.message || 'Falha ao criar conta. Tente outro nome de usuário ou e-mail.');
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Criar Conta e Iniciar Treinamento';
    }
  });
}
