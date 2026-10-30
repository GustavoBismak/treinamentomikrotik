// CLIENTE API HTTP COM SUPORTE HÍBRIDO (BACKEND CORPORATIVO + MODO WEB AUTÔNOMO)
import { LocalAPI } from './localApi.js';

// Detecção de ambiente estático (GitHub Pages, etc.)
const isStaticHost = 
  window.location.hostname.includes('github.io') || 
  window.location.hostname.includes('pages.dev') ||
  window.location.protocol === 'file:';

if (isStaticHost) {
  LocalAPI.isStaticMode = true;
}

export const API = {
  isStaticMode() {
    return LocalAPI.isStaticMode;
  },

  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const token = localStorage.getItem('isp_session_token');
    if (token) {
      defaultHeaders['X-Session-Token'] = token;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || `Erro HTTP ${res.status}`;
        const httpErr = new Error(errorMsg);
        httpErr.status = res.status;
        throw httpErr;
      }

      return data;
    } catch (err) {
      // Se a requisição falhar por falta de backend (servidor desligado ou rota inexistente), ativa fallback
      const isRouteOrNetworkIssue = 
        !err.status || 
        err.status === 404 || 
        err.status >= 500 || 
        (err.message && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') || 
          err.message.includes('404') ||
          err.message.includes('não encontrada')
        ));

      if (isRouteOrNetworkIssue) {
        LocalAPI.isStaticMode = true;
      }
      throw err;
    }
  },

  async _exec(serverCall, localCall) {
    if (LocalAPI.isStaticMode) {
      return await localCall();
    }
    try {
      return await serverCall();
    } catch (err) {
      const isRouteOrNetworkIssue = 
        LocalAPI.isStaticMode ||
        !err.status ||
        err.status === 404 ||
        err.status >= 500 ||
        (err.message && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') || 
          err.message.includes('404') ||
          err.message.includes('não encontrada')
        ));

      if (isRouteOrNetworkIssue && localCall) {
        LocalAPI.isStaticMode = true;
        return await localCall();
      }
      throw err;
    }
  },

  // --- AUTH ---
  getCurrentUser() {
    return this._exec(
      () => this.request('/api/auth/me'),
      () => LocalAPI.getCurrentUser()
    );
  },

  async login(username, password) {
    return this._exec(
      async () => {
        const data = await this.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        if (data.token) localStorage.setItem('isp_session_token', data.token);
        return data;
      },
      () => LocalAPI.login(username, password)
    );
  },

  async register(userData) {
    return this._exec(
      async () => {
        const data = await this.request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        if (data.token) localStorage.setItem('isp_session_token', data.token);
        return data;
      },
      () => LocalAPI.register(userData)
    );
  },

  async logout() {
    return this._exec(
      async () => {
        try { await this.request('/api/auth/logout', { method: 'POST' }); } catch (e) {}
        localStorage.removeItem('isp_session_token');
        return { success: true };
      },
      () => LocalAPI.logout()
    );
  },

  // --- MODULES & LESSONS ---
  getModules() {
    return this._exec(
      () => this.request('/api/modules'),
      () => LocalAPI.getModules()
    );
  },

  getModule(id) {
    return this._exec(
      () => this.request(`/api/modules/${id}`),
      () => LocalAPI.getModule(id)
    );
  },

  getLesson(id) {
    return this._exec(
      () => this.request(`/api/lessons/${id}`),
      () => LocalAPI.getLesson(id)
    );
  },

  completeLesson(id) {
    return this._exec(
      () => this.request(`/api/lessons/${id}/complete`, { method: 'POST' }),
      () => LocalAPI.completeLesson(id)
    );
  },

  // --- LABS ---
  getLabs() {
    return this._exec(
      () => this.request('/api/labs'),
      () => LocalAPI.getLabs()
    );
  },

  getLab(id) {
    return this._exec(
      () => this.request(`/api/labs/${id}`),
      () => LocalAPI.getLab(id)
    );
  },

  runLabTool(id, tool, target) {
    return this._exec(
      () => this.request(`/api/labs/${id}/test-tool`, { method: 'POST', body: JSON.stringify({ tool, target }) }),
      () => LocalAPI.runLabTool(id, tool, target)
    );
  },

  submitLab(id, hypothesis, solutionCommand) {
    return this._exec(
      () => this.request(`/api/labs/${id}/submit`, { method: 'POST', body: JSON.stringify({ hypothesis, solutionCommand }) }),
      () => LocalAPI.submitLab(id, hypothesis, solutionCommand)
    );
  },

  // --- QUIZZES ---
  getQuiz(moduleId) {
    return this._exec(
      () => this.request(`/api/quizzes/${moduleId}`),
      () => LocalAPI.getQuiz(moduleId)
    );
  },

  submitQuiz(moduleId, answers) {
    return this._exec(
      () => this.request(`/api/quizzes/${moduleId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
      () => LocalAPI.submitQuiz(moduleId, answers)
    );
  },

  // --- DASHBOARD & COMPETENCIES ---
  getDashboardStats() {
    return this._exec(
      () => this.request('/api/dashboard/stats'),
      () => LocalAPI.getDashboardStats()
    );
  },

  getCompetencies() {
    return this._exec(
      () => this.request('/api/competencies'),
      () => LocalAPI.getCompetencies()
    );
  },

  // --- CERTIFICATES ---
  getMyCertificate() {
    return this._exec(
      () => this.request('/api/certificates/my'),
      () => LocalAPI.getMyCertificate()
    );
  },

  requestCertificate() {
    return this._exec(
      () => this.request('/api/certificates/request', { method: 'POST' }),
      () => LocalAPI.requestCertificate()
    );
  },

  verifyCertificate(hash) {
    return this._exec(
      () => this.request(`/api/certificates/verify/${hash}`),
      () => LocalAPI.verifyCertificate(hash)
    );
  },

  // --- ADMIN & INSTRUCTOR ---
  getAdminUsers() {
    return this._exec(
      () => this.request('/api/admin/users'),
      () => LocalAPI.getAdminUsers()
    );
  },

  createUser(userData) {
    return this._exec(
      () => this.request('/api/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
      () => LocalAPI.register(userData)
    );
  },

  deleteUser(userId) {
    return this._exec(
      () => this.request(`/api/admin/users/${userId}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    );
  },

  getAdminReports() {
    return this._exec(
      () => this.request('/api/admin/reports'),
      () => LocalAPI.getAdminReports()
    );
  },

  getAuditLogs() {
    return this._exec(
      () => this.request('/api/admin/audit-logs'),
      () => LocalAPI.getAuditLogs()
    );
  },

  // --- MATERIAIS DE APOIO & POPS ---
  getMaterials() {
    return this._exec(
      () => this.request('/api/materials'),
      () => LocalAPI.getMaterials()
    );
  },

  // --- PROJETO FINAL ---
  getFinalProject() {
    return this._exec(
      () => this.request('/api/final-project'),
      () => LocalAPI.getFinalProject()
    );
  },

  saveFinalProject(projectData) {
    return this._exec(
      () => this.request('/api/final-project/save', { method: 'POST', body: JSON.stringify(projectData) }),
      () => LocalAPI.saveFinalProject(projectData)
    );
  },

  submitFinalProject(projectData) {
    return this._exec(
      () => this.request('/api/final-project/submit', { method: 'POST', body: JSON.stringify(projectData) }),
      () => LocalAPI.submitFinalProject(projectData)
    );
  },

  // --- SEARCH ---
  search(query) {
    return this._exec(
      () => this.request(`/api/search?q=${encodeURIComponent(query)}`),
      () => LocalAPI.search(query)
    );
  },

  // --- PROFILE ---
  getProfile() {
    return this._exec(
      () => this.request('/api/profile'),
      () => LocalAPI.getProfile()
    );
  },

  updateProfile(data) {
    return this._exec(
      () => this.request('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
      () => LocalAPI.updateProfile(data)
    );
  },

  changePassword(passwords) {
    return this._exec(
      () => this.request('/api/profile/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
      () => LocalAPI.changePassword(passwords)
    );
  }
};
