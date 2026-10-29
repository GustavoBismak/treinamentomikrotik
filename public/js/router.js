// ROTEADOR CLIENT-SIDE EM HASH ROUTING
import { API } from './api.js';
import { renderDashboard } from './views/dashboard.js';
import { renderSyllabus } from './views/syllabus.js';
import { renderModuleView } from './views/moduleView.js';
import { renderLesson } from './views/lesson.js';
import { renderLabs } from './views/labs.js';
import { renderQuiz } from './views/quiz.js';
import { renderCompetencies } from './views/competencies.js';
import { renderCertificate } from './views/certificate.js';
import { renderAdmin } from './views/admin.js';
import { renderFinalProject } from './views/finalProject.js';
import { renderMaterials } from './views/materials.js';
import { renderProfile } from './views/profile.js';

export function initRouter(viewportEl) {
  async function handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const parts = hash.split('/');
    const route = parts[0];
    const param = parts[1];

    // Atualiza links ativos na sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      const href = el.getAttribute('href')?.slice(1);
      const isActive = href && (
        href === route ||
        (route === 'lesson'  && href === 'syllabus') ||
        (route === 'module'  && href === 'syllabus') ||
        (route === 'lab'     && href === 'labs')
      );
      el.classList.toggle('active', !!isActive);
    });

    // Atualiza breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) {
      const titles = {
        dashboard:       'Painel Inicial',
        syllabus:        'Grade dos 15 Módulos',
        module:          'Ver Aulas e Conteúdo',
        lesson:          'Aula Técnica',
        labs:            'Laboratórios de Troubleshooting',
        lab:             'Bancada de Laboratório',
        quiz:            'Avaliação de Desempenho',
        competencies:    'Matriz de Competências',
        'final-project': 'Projeto Final — Implantação em Empresa',
        materials:       'Materiais de Apoio e POPs',
        certificate:     'Certificado de Conclusão',
        profile:         'Perfil e Configurações',
        admin:           'Painel do Instrutor e Gestão'
      };
      breadcrumbCurrent.textContent = titles[route] || 'Capacitação Técnica';
    }

    window.scrollTo(0, 0);

    if (route === 'dashboard') {
      await renderDashboard(viewportEl);
    } else if (route === 'syllabus') {
      await renderSyllabus(viewportEl);
    } else if (route === 'module' && param) {
      // #module/m1  →  ver aulas e conteúdo do módulo específico
      await renderModuleView(viewportEl, param);
    } else if (route === 'module') {
      // #module  (sem ID)  →  grade completa
      await renderSyllabus(viewportEl);
    } else if (route === 'lesson') {
      await renderLesson(viewportEl, param || 'l_m1_1');
    } else if (route === 'labs') {
      await renderLabs(viewportEl);
    } else if (route === 'lab') {
      await renderLabs(viewportEl, param || 'lab1');
    } else if (route === 'quiz') {
      await renderQuiz(viewportEl, param || 'm1');
    } else if (route === 'competencies') {
      await renderCompetencies(viewportEl);
    } else if (route === 'final-project') {
      await renderFinalProject(viewportEl);
    } else if (route === 'materials') {
      await renderMaterials(viewportEl);
    } else if (route === 'profile') {
      await renderProfile(viewportEl);
    } else if (route === 'certificate') {
      await renderCertificate(viewportEl);
    } else if (route === 'admin') {
      try {
        const { user } = await API.getCurrentUser();
        if (user && (user.role === 'admin' || user.role === 'instructor')) {
          await renderAdmin(viewportEl);
        } else {
          window.location.hash = '#dashboard';
        }
      } catch (e) {
        window.location.hash = '#dashboard';
      }
    } else {
      await renderDashboard(viewportEl);
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
