// CLIENTE API HTTP PARA COMUNICAÇÃO COM O BACKEND
export const API = {
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
        throw new Error(data.error || `Erro HTTP ${res.status}`);
      }

      return data;
    } catch (err) {
      console.error(`Falha na requisição [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth
  getCurrentUser() {
    return this.request('/api/auth/me');
  },
  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      localStorage.setItem('isp_session_token', data.token);
    }
    return data;
  },
  async register(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) {
      localStorage.setItem('isp_session_token', data.token);
    }
    return data;
  },
  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Erro ao chamar logout no servidor:', e);
    }
    localStorage.removeItem('isp_session_token');
  },

  // Modules & Lessons
  getModules() {
    return this.request('/api/modules');
  },
  getModule(id) {
    return this.request(`/api/modules/${id}`);
  },
  getLesson(id) {
    return this.request(`/api/lessons/${id}`);
  },
  completeLesson(id) {
    return this.request(`/api/lessons/${id}/complete`, { method: 'POST' });
  },

  // Labs
  getLabs() {
    return this.request('/api/labs');
  },
  getLab(id) {
    return this.request(`/api/labs/${id}`);
  },
  runLabTool(id, tool, target) {
    return this.request(`/api/labs/${id}/test-tool`, {
      method: 'POST',
      body: JSON.stringify({ tool, target })
    });
  },
  submitLab(id, hypothesis, solutionCommand) {
    return this.request(`/api/labs/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ hypothesis, solutionCommand })
    });
  },

  // Quizzes & Assessments
  getQuiz(moduleId) {
    return this.request(`/api/quizzes/${moduleId}`);
  },
  submitQuiz(moduleId, answers) {
    return this.request(`/api/quizzes/${moduleId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  // Dashboard & Competencies
  getDashboardStats() {
    return this.request('/api/dashboard/stats');
  },
  getCompetencies() {
    return this.request('/api/competencies');
  },

  // Certificates
  getMyCertificate() {
    return this.request('/api/certificates/my');
  },
  requestCertificate() {
    return this.request('/api/certificates/request', { method: 'POST' });
  },
  verifyCertificate(hash) {
    return this.request(`/api/certificates/verify/${hash}`);
  },

  // Admin & Instructor
  getAdminUsers() {
    return this.request('/api/admin/users');
  },
  createUser(userData) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  deleteUser(userId) {
    return this.request(`/api/admin/users/${userId}`, { method: 'DELETE' });
  },
  getAdminReports() {
    return this.request('/api/admin/reports');
  },
  getAuditLogs() {
    return this.request('/api/admin/audit-logs');
  },

  // Materiais de Apoio & POPs
  getMaterials() {
    return this.request('/api/materials');
  },

  // Projeto Final Corporativo
  getFinalProject() {
    return this.request('/api/final-project');
  },
  saveFinalProject(data) {
    return this.request('/api/final-project/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getAdminFinalProjects() {
    return this.request('/api/admin/final-projects');
  },
  reviewFinalProject(submissionId, reviewData) {
    return this.request(`/api/admin/final-projects/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  // Busca Rápida Global
  search(query) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  },

  // Perfil e Configurações
  getProfile() {
    return this.request('/api/auth/profile');
  },
  updateProfile(profileData) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Editor de Conteúdo (Admin & Instrutor)
  adminSaveLesson(lessonData) {
    return this.request('/api/admin/content/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  },
  adminSaveQuestion(questionData) {
    return this.request('/api/admin/content/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  }
};
