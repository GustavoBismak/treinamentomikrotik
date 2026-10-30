// CLIENT-SIDE ENGINE / FALLBACK LOCAL PARA GITHUB PAGES OU AMBIENTE OFFLINE
import { modulesData, competenciesData } from './data/modulesData.js';
import { labsData } from './data/labsData.js';
import { allLessons, allQuestions } from './data/curriculumData.js';
import { materialsData } from './data/materialsData.js';

export const LocalAPI = {
  isStaticMode: false,

  _getUsers() {
    try {
      const stored = localStorage.getItem('isp_local_users');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Usuários padrão da plataforma
    return [
      { id: 'u1', username: 'tecnico.carlos', name: 'Carlos Eduardo Silveira', email: 'carlos.silveira@provedorisp.com.br', role: 'student', department: 'Técnico de Campo Júnior' },
      { id: 'u2', username: 'tecnica.mariana', name: 'Mariana Alencar Rocha', email: 'mariana.rocha@provedorisp.com.br', role: 'student', department: 'Técnica de Redes Pleno' },
      { id: 'u3', username: 'instrutor.andre', name: 'André Martins Pires', email: 'andre.pires@provedorisp.com.br', role: 'instructor', department: 'Engenheiro de Redes / Instrutor Oficial' },
      { id: 'u4', username: 'gestor.roberto', name: 'Roberto de Souza Melo', email: 'roberto.melo@provedorisp.com.br', role: 'admin', department: 'Gerência de Engenharia & NOC' }
    ];
  },

  _saveUsers(users) {
    localStorage.setItem('isp_local_users', JSON.stringify(users));
  },

  _getCurrentUser() {
    try {
      const u = localStorage.getItem('isp_current_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  _setCurrentUser(user) {
    if (user) {
      localStorage.setItem('isp_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('isp_current_user');
    }
  },

  _getProgress() {
    try {
      const p = localStorage.getItem('isp_progress');
      return p ? JSON.parse(p) : {};
    } catch (e) {
      return {};
    }
  },

  _saveProgress(progress) {
    localStorage.setItem('isp_progress', JSON.stringify(progress));
  },

  _getQuizAttempts() {
    try {
      const q = localStorage.getItem('isp_quiz_attempts');
      return q ? JSON.parse(q) : {};
    } catch (e) {
      return {};
    }
  },

  _saveQuizAttempts(attempts) {
    localStorage.setItem('isp_quiz_attempts', JSON.stringify(attempts));
  },

  _getLabAttempts() {
    try {
      const l = localStorage.getItem('isp_lab_attempts');
      return l ? JSON.parse(l) : {};
    } catch (e) {
      return {};
    }
  },

  _saveLabAttempts(attempts) {
    localStorage.setItem('isp_lab_attempts', JSON.stringify(attempts));
  },

  _getFinalProject() {
    try {
      const fp = localStorage.getItem('isp_final_project');
      return fp ? JSON.parse(fp) : null;
    } catch (e) {
      return null;
    }
  },

  _saveFinalProject(fp) {
    localStorage.setItem('isp_final_project', JSON.stringify(fp));
  },

  // --- API METHODS REPLICATED FOR CLIENT SIDE ---

  async getCurrentUser() {
    const user = this._getCurrentUser();
    if (!user) {
      throw new Error('Não autenticado');
    }
    return { user };
  },

  async login(username, password) {
    const users = this._getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      throw new Error('Usuário não encontrado. Verifique os dados ou cadastre-se como Novo Aluno.');
    }
    // No modo local/web estático aceita qualquer senha com 6+ dígitos
    if (!password || password.length < 6) {
      throw new Error('A senha deve conter no mínimo 6 caracteres.');
    }
    this._setCurrentUser(user);
    const token = 'local_session_' + Date.now();
    localStorage.setItem('isp_session_token', token);
    return { token, user };
  },

  async register(userData) {
    const users = this._getUsers();
    const exists = users.some(u => u.username.toLowerCase() === userData.username.trim().toLowerCase() || u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (exists) {
      throw new Error('Nome de usuário ou e-mail já cadastrado na plataforma.');
    }
    const newUser = {
      id: 'u_' + Date.now(),
      username: userData.username.trim(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: 'student',
      department: userData.department ? userData.department.trim() : 'Técnico de Redes'
    };
    users.push(newUser);
    this._saveUsers(users);
    this._setCurrentUser(newUser);
    const token = 'local_session_' + Date.now();
    localStorage.setItem('isp_session_token', token);
    return { token, user: newUser };
  },

  async logout() {
    this._setCurrentUser(null);
    localStorage.removeItem('isp_session_token');
    return { success: true };
  },

  async getModules() {
    const user = this._getCurrentUser();
    const progress = this._getProgress();
    const userProgress = user ? (progress[user.id] || {}) : {};

    const modules = modulesData.map(m => {
      const moduleLessons = allLessons.filter(l => l.module_id === m.id);
      const totalLessons = moduleLessons.length || 1;
      let completedLessons = 0;
      moduleLessons.forEach(l => {
        if (userProgress[l.id] === 'completed') completedLessons++;
      });
      const progressPercent = Math.round((completedLessons / totalLessons) * 100);

      return {
        ...m,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercent,
        has_lab: labsData.some(lab => lab.module_id === m.id),
        has_quiz: allQuestions.some(q => q.module_id === m.id)
      };
    });

    return { modules };
  },

  async getModule(id) {
    const user = this._getCurrentUser();
    const progress = this._getProgress();
    const userProgress = user ? (progress[user.id] || {}) : {};

    const module = modulesData.find(m => m.id === id);
    if (!module) throw new Error('Módulo não encontrado');

    const lessons = allLessons.filter(l => l.module_id === id).map(l => ({
      ...l,
      status: userProgress[l.id] || 'pending'
    }));

    const labs = labsData.filter(l => l.module_id === id);
    const questions = allQuestions.filter(q => q.module_id === id);

    return {
      module,
      lessons,
      labs,
      quiz_available: questions.length > 0
    };
  },

  async getLesson(id) {
    const user = this._getCurrentUser();
    const progress = this._getProgress();
    const userProgress = user ? (progress[user.id] || {}) : {};

    const lesson = allLessons.find(l => l.id === id);
    if (!lesson) throw new Error('Aula não encontrada');

    return {
      lesson: {
        ...lesson,
        status: userProgress[id] || 'pending'
      }
    };
  },

  async completeLesson(id) {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const progress = this._getProgress();
    if (!progress[user.id]) progress[user.id] = {};
    progress[user.id][id] = 'completed';
    this._saveProgress(progress);

    return { success: true, lesson_id: id, status: 'completed' };
  },

  async getLabs() {
    const user = this._getCurrentUser();
    const labAttempts = this._getLabAttempts();
    const userAttempts = user ? (labAttempts[user.id] || {}) : {};

    const labs = labsData.map(l => {
      const attempt = userAttempts[l.id];
      return {
        ...l,
        completed: attempt ? attempt.passed === 1 : false,
        score: attempt ? attempt.score : null
      };
    });

    return { labs };
  },

  async getLab(id) {
    const lab = labsData.find(l => l.id === id);
    if (!lab) throw new Error('Laboratório não encontrado');

    const user = this._getCurrentUser();
    const labAttempts = this._getLabAttempts();
    const userAttempt = user ? (labAttempts[user.id] || {})[id] : null;

    return {
      lab,
      last_attempt: userAttempt
    };
  },

  async runLabTool(id, tool, target) {
    const lab = labsData.find(l => l.id === id);
    if (!lab) throw new Error('Laboratório não encontrado');

    let evidences = [];
    try {
      evidences = JSON.parse(lab.evidence_json);
    } catch (e) {}

    const matched = evidences.find(e => e.tool.toLowerCase().includes(tool.toLowerCase()));
    if (matched) {
      return { output: matched.output };
    }

    return {
      output: `[SIMULADOR ROUTEROS] Executando ${tool} para o destino ${target || 'default'}...\nResposta: Conexão ativa, sem perdas de pacotes. RTT: 1.4ms.`
    };
  },

  async submitLab(id, hypothesis, solutionCommand) {
    const lab = labsData.find(l => l.id === id);
    if (!lab) throw new Error('Laboratório não encontrado');

    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const cleanSub = (solutionCommand || '').replace(/[\s\t\n]+/g, ' ').trim().toLowerCase();
    const cleanExp = (lab.expected_solution || '').replace(/[\s\t\n]+/g, ' ').trim().toLowerCase();

    // Avaliação flexível de comando
    const passed = cleanSub.includes(cleanExp) || cleanExp.includes(cleanSub) || cleanSub.length > 20;
    const score = passed ? 100 : 30;

    const attempt = {
      lab_id: id,
      hypothesis,
      solution_submitted: solutionCommand,
      passed: passed ? 1 : 0,
      score,
      feedback: passed
        ? `Excelente análise técnica! Solução precisa e de acordo com o padrão RouterOS v7. Causa Raiz: ${lab.root_cause_explanation}`
        : `Comando incompleto ou incorreto. Analise as evidências e dicas. Solução esperada: ${lab.expected_solution}`,
      completed_at: new Date().toISOString()
    };

    const labAttempts = this._getLabAttempts();
    if (!labAttempts[user.id]) labAttempts[user.id] = {};
    labAttempts[user.id][id] = attempt;
    this._saveLabAttempts(labAttempts);

    return {
      passed,
      score,
      feedback: attempt.feedback,
      root_cause: lab.root_cause_explanation,
      expected_solution: lab.expected_solution
    };
  },

  async getQuiz(moduleId) {
    const questions = allQuestions.filter(q => q.module_id === moduleId);
    if (!questions.length) throw new Error('Nenhuma avaliação encontrada para este módulo');

    const user = this._getCurrentUser();
    const quizAttempts = this._getQuizAttempts();
    const userAttempt = user ? (quizAttempts[user.id] || {})[moduleId] : null;

    return {
      module_id: moduleId,
      questions: questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        question_type: q.question_type
      })),
      last_attempt: userAttempt
    };
  },

  async submitQuiz(moduleId, answers) {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const questions = allQuestions.filter(q => q.module_id === moduleId);
    if (!questions.length) throw new Error('Avaliação não encontrada');

    let correctCount = 0;
    const results = questions.map((q, idx) => {
      const selectedIndex = answers[q.id] !== undefined ? answers[q.id] : -1;
      const isCorrect = selectedIndex === q.correct_index;
      if (isCorrect) correctCount++;
      return {
        question_id: q.id,
        selected_index: selectedIndex,
        correct_index: q.correct_index,
        is_correct: isCorrect,
        explanation: q.explanation
      };
    });

    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 70;

    const attempt = {
      module_id: moduleId,
      score: correctCount,
      total_questions: total,
      percentage,
      passed: passed ? 1 : 0,
      completed_at: new Date().toISOString()
    };

    const quizAttempts = this._getQuizAttempts();
    if (!quizAttempts[user.id]) quizAttempts[user.id] = {};
    quizAttempts[user.id][moduleId] = attempt;
    this._saveQuizAttempts(quizAttempts);

    return {
      passed,
      score: correctCount,
      total,
      percentage,
      results
    };
  },

  async getDashboardStats() {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const progress = this._getProgress();
    const userProgress = progress[user.id] || {};
    const completedLessonCount = Object.values(userProgress).filter(s => s === 'completed').length;

    const quizAttempts = this._getQuizAttempts();
    const userQuizzes = quizAttempts[user.id] || {};
    const quizScores = Object.values(userQuizzes).map(q => q.percentage);
    const avgScore = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

    const labAttempts = this._getLabAttempts();
    const userLabs = labAttempts[user.id] || {};
    const completedLabs = Object.values(userLabs).filter(l => l.passed === 1).length;

    const totalLessons = allLessons.length;
    const overallProgress = Math.round((completedLessonCount / (totalLessons || 1)) * 100);

    return {
      user,
      stats: {
        total_modules: modulesData.length,
        total_lessons: totalLessons,
        completed_lessons: completedLessonCount,
        progress_percentage: overallProgress,
        average_quiz_score: avgScore,
        completed_labs: completedLabs,
        total_labs: labsData.length,
        study_hours: Math.round(completedLessonCount * 0.75)
      },
      recent_activities: [
        { type: 'lesson', title: 'Primeiro Acesso e Hardening Básico RouterOS', date: 'Hoje' },
        { type: 'lab', title: 'Troubleshooting de Rotas e Failover', date: 'Ontem' }
      ]
    };
  },

  async getCompetencies() {
    return { competencies: competenciesData };
  },

  async getMaterials() {
    return {
      version: materialsData.version,
      pops: materialsData.pops
    };
  },

  async getFinalProject() {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const fp = this._getFinalProject();
    const userSubmission = (fp && fp[user.id]) ? fp[user.id] : null;

    return {
      submission: userSubmission
    };
  },

  async submitFinalProject(data) {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const fp = this._getFinalProject() || {};
    const submission = {
      id: 'fp_' + Date.now(),
      user_id: user.id,
      company_name: data.company_name || 'Empresa Provedor ISP',
      stage_data: data.stage_data || {},
      status: data.is_final ? 'submitted' : 'draft',
      grade: data.is_final ? 95 : null,
      instructor_feedback: data.is_final ? 'Projeto de implantação validado com êxito! Topologia de VLANs, firewall e roteamento aderentes às normas técnicas corporativas.' : null,
      submitted_at: new Date().toISOString()
    };

    fp[user.id] = submission;
    this._saveFinalProject(fp);

    return { success: true, submission };
  },

  async getMyCertificate() {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    try {
      const certs = JSON.parse(localStorage.getItem('isp_certificates') || '{}');
      return { certificate: certs[user.id] || null };
    } catch (e) {
      return { certificate: null };
    }
  },

  async requestCertificate() {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const certCode = 'ISP-MT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-2026';
    const cert = {
      id: 'cert_' + Date.now(),
      certificate_code: certCode,
      user_id: user.id,
      user_name: user.name,
      course_title: 'Capacitação Profissional em MikroTik RouterOS v7 para ISPs',
      workload_hours: 120,
      issued_at: new Date().toISOString().split('T')[0],
      verification_hash: certCode
    };

    try {
      const certs = JSON.parse(localStorage.getItem('isp_certificates') || '{}');
      certs[user.id] = cert;
      localStorage.setItem('isp_certificates', JSON.stringify(certs));
    } catch (e) {}

    return { certificate: cert };
  },

  async verifyCertificate(hash) {
    return {
      valid: true,
      certificate: {
        certificate_code: hash,
        user_name: 'Colaborador Certificado ISP',
        course_title: 'Capacitação Profissional em MikroTik RouterOS v7 para ISPs',
        issued_at: '2026-10-29',
        workload_hours: 120
      }
    };
  },

  async search(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return { results: [] };

    const results = [];
    modulesData.forEach(m => {
      if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
        results.push({ type: 'module', id: m.id, title: m.title, snippet: m.description, url: `#/modules/${m.id}` });
      }
    });

    allLessons.forEach(l => {
      if (l.title.toLowerCase().includes(q) || (l.objective && l.objective.toLowerCase().includes(q))) {
        results.push({ type: 'lesson', id: l.id, title: l.title, snippet: l.objective || '', url: `#/lessons/${l.id}` });
      }
    });

    materialsData.pops.forEach(pop => {
      if (pop.title.toLowerCase().includes(q) || pop.objective.toLowerCase().includes(q)) {
        results.push({ type: 'pop', id: pop.id, title: pop.title, snippet: pop.objective, url: `#/materials` });
      }
    });

    return { results: results.slice(0, 15) };
  },

  async getProfile() {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');
    return { user };
  },

  async updateProfile(data) {
    const user = this._getCurrentUser();
    if (!user) throw new Error('Não autenticado');
    const updated = { ...user, ...data };
    this._setCurrentUser(updated);

    const users = this._getUsers().map(u => u.id === user.id ? updated : u);
    this._saveUsers(users);

    return { success: true, user: updated };
  },

  async changePassword(passwords) {
    return { success: true, message: 'Senha atualizada com sucesso no seu perfil local!' };
  },

  async getAdminUsers() {
    return { users: this._getUsers() };
  },

  async getAdminReports() {
    return {
      overview: {
        total_students: this._getUsers().length,
        average_completion: 45,
        total_certifications: 2
      }
    };
  },

  async getAuditLogs() {
    return {
      logs: [
        { id: 'log_1', username: 'sistema', action: 'MODO_OFFLINE_INICIADO', target: 'Navegador Web', timestamp: new Date().toISOString() }
      ]
    };
  }
};

