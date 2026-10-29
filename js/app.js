// APLICAÇÃO PRINCIPAL: ACADEMIA TÉCNICA MIKROTIK
import { API } from './api.js';
import { getIcon } from './icons.js';
import { initRouter } from './router.js';
import { renderLoginView } from './views/login.js';

class App {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    try {
      const { user } = await API.getCurrentUser();
      this.currentUser = user;
      this.renderAppShell();
      initRouter(document.getElementById('content-viewport'));
    } catch (err) {
      console.info('Sessão não detectada ou expirada:', err.message);
      // Redireciona para tela de login individual
      this.renderLogin();
    }
  }

  renderCloudHostingModal() {
    const existing = document.getElementById('cloud-hosting-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cloud-hosting-modal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;';
    modal.innerHTML = `
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:28px; max-width:580px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); color:#f8fafc; font-family:'Inter', sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:18px; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:8px;">
            <span>☁️</span> Hospedagem Corporativa da Academia MikroTik
          </h3>
          <button id="close-hosting-modal" style="background:transparent; border:none; color:#94a3b8; font-size:20px; cursor:pointer; padding:4px 8px;">✕</button>
        </div>
        <p style="color:#94a3b8; font-size:13px; line-height:1.6; margin-bottom:16px;">
          Você está navegando no <strong>Modo Web Autônomo</strong>. Seu progresso, notas e laboratórios são salvos com segurança neste navegador.
        </p>
        <p style="color:#cbd5e1; font-size:13px; line-height:1.6; margin-bottom:16px;">
          Para implantar um <strong>Servidor Centralizado</strong> (onde o instrutor acompanha todos os técnicos simultaneamente e gera relatórios corporativos):
        </p>
        <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:14px; font-family:'JetBrains Mono', monospace; font-size:12px; color:#4ade80; margin-bottom:18px; line-height:1.6;">
          <span style="color:#64748b;"># Opção A: Servidor Linux / VPS do seu Provedor:</span><br>
          git clone https://github.com/GustavoBismak/treinamentomikrotik.git<br>
          cd treinamentomikrotik<br>
          npm start<br><br>
          <span style="color:#64748b;"># Opção B: Nuvem Gratuita (Render.com):</span><br>
          Conecte seu repositório no Render.com como "Web Service" com Node 22.
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <a href="https://render.com" target="_blank" rel="noopener" style="background:#0284c7; color:#fff; text-decoration:none; padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:6px;">
            🚀 Ir para Render.com
          </a>
          <button id="btn-ok-hosting-modal" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; padding:8px 16px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;">
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('#close-hosting-modal').addEventListener('click', close);
    modal.querySelector('#btn-ok-hosting-modal').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  }

  renderLogin() {
    const appEl = document.getElementById('app');
    appEl.classList.add('auth-mode');
    window.location.hash = ''; // Limpa hash para tela de login
    renderLoginView(appEl, (user) => {
      this.currentUser = user;
      appEl.classList.remove('auth-mode');
      this.renderAppShell();
      initRouter(document.getElementById('content-viewport'));
    });
  }

  renderServerOffline() {
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; background:#070b14; color:#f8fafc; font-family:'Inter', sans-serif; padding:24px; text-align:center;">
          <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:36px; max-width:540px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
            <div style="font-size:36px; margin-bottom:12px;">🔌</div>
            <h2 style="font-size:20px; font-weight:700; margin-bottom:10px; color:#38bdf8;">Servidor Backend Desconectado</h2>
            <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin-bottom:20px;">
              A <strong>Academia Técnica MikroTik</strong> depende do servidor Node.js ativo para gerenciar os laboratórios RouterOS e o banco de dados.
            </p>
            <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:14px; font-family:'JetBrains Mono', monospace; font-size:13px; color:#4ade80; margin-bottom:20px; text-align:left;">
              <span style="color:#64748b;"># 1. No terminal, inicie o servidor:</span><br>
              npm start<br><br>
              <span style="color:#64748b;"># 2. Em seguida, acesse no navegador:</span><br>
              <a href="http://localhost:3000" style="color:#38bdf8; text-decoration:underline;">http://localhost:3000</a>
            </div>
            <button onclick="window.location.reload()" style="background:#0284c7; color:#fff; border:none; padding:10px 22px; border-radius:6px; font-weight:600; cursor:pointer; font-size:14px;">
              Tentar Conectar Novamente
            </button>
          </div>
        </div>
      `;
    }
  }

  renderAppShell() {
    const appEl = document.getElementById('app');
    const u = this.currentUser;

    const isAdminOrInstructor = u.role === 'admin' || u.role === 'instructor';

    appEl.innerHTML = `
      <!-- Menu Lateral -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">MT</div>
          <div class="brand-title">
            <h1>Academia MikroTik</h1>
            <span>Treinamento Técnico ISP</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Aprendizagem</div>
          <a href="#dashboard" class="nav-item active">
            ${getIcon('dashboard')}
            <span>Painel Inicial</span>
          </a>
          <a href="#syllabus" class="nav-item">
            ${getIcon('layers')}
            <span>Módulos do Curso</span>
            <span class="nav-badge">15</span>
          </a>
          <a href="#labs" class="nav-item">
            ${getIcon('terminal')}
            <span>Laboratórios Práticos</span>
            <span class="nav-badge">6</span>
          </a>
          <a href="#final-project" class="nav-item">
            ${getIcon('flag')}
            <span>Projeto Final Empresarial</span>
          </a>

          <div class="nav-section-title">Desenvolvimento</div>
          <a href="#competencies" class="nav-item">
            ${getIcon('activity')}
            <span>Matriz de Competências</span>
          </a>
          <a href="#certificate" class="nav-item">
            ${getIcon('award')}
            <span>Certificado Interno</span>
          </a>
          <a href="#materials" class="nav-item">
            ${getIcon('book-open')}
            <span>Materiais e POPs ISP</span>
          </a>

          <div class="nav-section-title">Conta</div>
          <a href="#profile" class="nav-item">
            ${getIcon('user')}
            <span>Perfil e Configurações</span>
          </a>

          ${isAdminOrInstructor ? `
            <div class="nav-section-title">Gestão e Ensino</div>
            <a href="#admin" class="nav-item" id="nav-admin-link">
              ${getIcon('users')}
              <span>Painel do Instrutor / NOC</span>
            </a>
          ` : ''}
        </nav>

        <div class="sidebar-user">
          <div style="display:flex; align-items:center; gap:10px; width:100%;">
            <div class="user-avatar">${u.name.substring(0, 2).toUpperCase()}</div>
            <div class="user-info">
              <div class="user-name">${escapeHtml(u.name)}</div>
              <div class="user-role">
                <span class="role-pill">${u.role === 'admin' ? 'Administrador' : (u.role === 'instructor' ? 'Instrutor' : 'Aluno Técnico')}</span>
              </div>
            </div>
          </div>
          <button class="btn-logout" id="btn-sidebar-logout" title="Sair da sua conta">
            ${getIcon('log-out')}
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      <!-- Área de Visualização Principal -->
      <div class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <button class="btn-mobile-menu" id="btn-toggle-menu">
              ${getIcon('menu')}
            </button>
            <div class="breadcrumb">
              <span>Academia</span>
              <span>/</span>
              <span class="current" id="breadcrumb-current">Painel Inicial</span>
            </div>
          </div>

          <!-- Busca Global -->
          <div class="topbar-search" id="topbar-search-container">
            <div class="search-input-wrap">
              ${getIcon('search')}
              <input
                type="text"
                id="global-search-input"
                class="search-input"
                placeholder="Buscar aulas, comandos, POPs, labs…"
                autocomplete="off"
              />
              <kbd class="search-shortcut">Ctrl K</kbd>
            </div>
            <div class="search-dropdown" id="search-dropdown" hidden></div>
          </div>

          <div class="topbar-right">
            <!-- Usuário -->
            <div class="topbar-user">
              <div class="topbar-user-info">
                <span class="topbar-user-name">${escapeHtml(u.name.split(' ')[0])}</span>
                <span class="topbar-user-dept">${escapeHtml(u.department || 'ISP Técnico')}</span>
              </div>
              <a href="#profile" class="user-avatar-btn" title="Meu Perfil">${u.name.substring(0, 2).toUpperCase()}</a>
              <button class="btn btn-secondary btn-icon-text" id="btn-topbar-logout" title="Sair da conta">
                ${getIcon('log-out')}
                <span>Sair</span>
              </button>
            </div>

            <div class="system-pill" id="system-status-pill" style="cursor:pointer;" title="${API.isStaticMode() ? 'Modo Web Autônomo. Clique para ver opções de servidor corporativo.' : 'Conectado ao Servidor Central ISP'}">
              <div class="system-indicator" style="${API.isStaticMode() ? 'background:#38bdf8; box-shadow:0 0 8px rgba(56,189,248,0.6);' : ''}"></div>
              <span>${API.isStaticMode() ? 'Web Autônomo' : 'RouterOS v7 Online'}</span>
            </div>
          </div>
        </header>

        <main class="content-viewport" id="content-viewport"></main>
      </div>

      <!-- Overlay para fechar sidebar no mobile -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    document.getElementById('system-status-pill')?.addEventListener('click', () => {
      this.renderCloudHostingModal();
    });

    // Eventos de Logout
    const handleLogout = async () => {
      if (confirm('Deseja realmente sair da sua conta?')) {
        await API.logout();
        window.location.hash = '';
        window.location.reload();
      }
    };

    document.getElementById('btn-sidebar-logout')?.addEventListener('click', handleLogout);
    document.getElementById('btn-topbar-logout')?.addEventListener('click', handleLogout);

    // ── Busca Global ──────────────────────────────────────────────
    const searchInput   = document.getElementById('global-search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    let searchTimer = null;

    async function runSearch(q) {
      if (!q || q.length < 2) {
        searchDropdown.hidden = true;
        return;
      }
      try {
        const data = await API.search(q);
        const results = data.results || [];
        if (results.length === 0) {
          searchDropdown.innerHTML = `<div class="search-empty">Nenhum resultado para "<strong>${escapeHtml(q)}</strong>"</div>`;
        } else {
          const grouped = {};
          results.forEach(r => {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push(r);
          });
          const typeLabels = { lesson: 'Aulas', module: 'Módulos', lab: 'Laboratórios', pop: 'POPs ISP' };
          searchDropdown.innerHTML = Object.entries(grouped).map(([type, items]) => `
            <div class="search-group-label">${typeLabels[type] || type}</div>
            ${items.slice(0, 5).map(r => `
              <a class="search-result-item" href="${escapeHtml(r.url)}">
                <span class="search-result-title">${escapeHtml(r.title)}</span>
                ${(r.excerpt || r.description) ? `<span class="search-result-excerpt">${escapeHtml((r.excerpt || r.description).substring(0, 80))}…</span>` : ''}
              </a>
            `).join('')}
          `).join('');
        }
        searchDropdown.hidden = false;
      } catch (e) {
        console.warn('Erro na busca:', e.message);
      }
    }

    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runSearch(e.target.value.trim()), 300);
    });

    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchDropdown.hidden = true;
        searchInput.blur();
      }
      if (e.key === 'Enter') {
        const first = searchDropdown.querySelector('.search-result-item');
        if (first) { first.click(); searchDropdown.hidden = true; searchInput.value = ''; }
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#topbar-search-container')) {
        searchDropdown.hidden = true;
      }
    });

    // Atalho Ctrl+K para abrir busca
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput?.focus();
        searchInput?.select();
      }
    });

    // Fecha busca ao navegar para resultado (hash muda sem reload)
    window.addEventListener('hashchange', () => {
      if (searchInput) searchInput.value = '';
      if (searchDropdown) searchDropdown.hidden = true;
    });

    // Menu Mobile
    const toggleBtn = document.getElementById('btn-toggle-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function closeSidebar() {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    }

    function openSidebar() {
      sidebar?.classList.add('open');
      overlay?.classList.add('active');
    }

    toggleBtn?.addEventListener('click', () => {
      if (sidebar?.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    overlay?.addEventListener('click', closeSidebar);

    // Fecha a sidebar no celular ao clicar em qualquer item do menu
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          closeSidebar();
        }
      });
    });
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function startApp() {
  try {
    const app = new App();
    app.init().catch(err => {
      console.error('Falha na inicialização do app:', err);
      if (window.location.hostname.includes('github.io')) {
        app.renderStaticDeploymentNotice();
      } else {
        app.renderLogin();
      }
    });
  } catch (err) {
    console.error('Falha síncrona:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
