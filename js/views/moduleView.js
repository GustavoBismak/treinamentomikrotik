// VIEW: MODULO DETALHADO — AULAS, GALERIA E PLAYER DE VIDEO TECNICO
import { API } from '../api.js';
import { getIcon } from '../icons.js';

// ─── Dados de midia por modulo ─────────────────────────────────────────────────
const MODULE_MEDIA = {
  m1: {
    video: {
      title: 'Visao Geral: Introducao ao MikroTik RouterOS',
      duration: '18:45',
      chapters: [
        { time: '0:00', label: 'Abertura e Objetivos do Modulo' },
        { time: '2:30', label: 'O que e RouterOS e para que serve' },
        { time: '6:15', label: 'Familia de produtos MikroTik' },
        { time: '11:00', label: 'Primeiro acesso via WinBox' },
        { time: '15:20', label: 'Verificacao de status e interfaces' }
      ],
      terminalDemo: [
        { delay: 0,    text: '[admin@MikroTik] > /system identity print' },
        { delay: 700,  text: '                    name: MikroTik-CCR2004' },
        { delay: 1400, text: '[admin@MikroTik] > /system resource print' },
        { delay: 2100, text: '                   uptime: 2d 14:22:05' },
        { delay: 2800, text: '                  version: 7.14.3 (stable)' },
        { delay: 3500, text: '              cpu-load: 3%' },
        { delay: 4200, text: '           free-memory: 876.0MiB of 1024.0MiB' },
        { delay: 4900, text: '[admin@MikroTik] > /interface print' },
        { delay: 5600, text: 'Flags: D - dynamic, X - disabled, R - running' },
        { delay: 6300, text: ' 0 R ether1-WAN      ether        1500' },
        { delay: 7000, text: ' 1 R ether2-LAN      ether        1500' },
        { delay: 7700, text: ' 2 R sfp1            ether        1500' }
      ]
    },
    gallery: [
      { src: '/images/mikrotik_rack_setup.jpg', caption: 'CCR2004 montado em rack de producao ISP', tags: ['CCR2004', 'Rack 2U', 'SFP+'] },
      { src: '/images/mikrotik_hardware_closeup.jpg', caption: 'Painel frontal: portas Eth, SFP+ e LEDs de status', tags: ['Ethernet', 'SFP+', 'LED PWR/USR'] },
      { src: '/images/mikrotik_bench_lab.jpg', caption: 'Bancada de laboratorio com cabos Cat6 e fibra optica', tags: ['Cabo Cat6', 'Patch Cord', 'OTDR'] }
    ]
  },
  m2: {
    video: {
      title: 'WinBox e Acesso Inicial ao Router',
      duration: '22:10',
      chapters: [
        { time: '0:00',  label: 'Download e instalacao do WinBox' },
        { time: '3:10',  label: 'Conexao por IP e por MAC Address' },
        { time: '8:45',  label: 'Interface grafica: visao geral' },
        { time: '13:20', label: 'Safe Mode (F4) — uso obrigatorio' },
        { time: '18:00', label: 'Salvar configuracao e backup' }
      ],
      terminalDemo: [
        { delay: 0,    text: '[admin@MikroTik] > /tool mac-server print' },
        { delay: 700,  text: '  interface: all' },
        { delay: 1400, text: '[admin@MikroTik] > /ip address print' },
        { delay: 2100, text: 'Flags: X - disabled, I - invalid, D - dynamic' },
        { delay: 2800, text: ' #  ADDRESS         NETWORK    INTERFACE' },
        { delay: 3500, text: ' 0  192.168.88.1/24 192.168.88.0  bridge' },
        { delay: 4200, text: '[admin@MikroTik] > /user print' },
        { delay: 4900, text: ' #  NAME    GROUP    ADDRESS' },
        { delay: 5600, text: ' 0  admin   full' }
      ]
    },
    gallery: [
      { src: '/images/mikrotik_hardware_closeup.jpg', caption: 'Porta Console e Reset no painel do equipamento', tags: ['Console', 'Reset', 'LED'] },
      { src: '/images/mikrotik_bench_lab.jpg', caption: 'Conexao direta Cat6 para acesso inicial via WinBox', tags: ['WinBox', 'Cat6', 'LAN'] },
      { src: '/images/mikrotik_rack_setup.jpg', caption: 'Painel de gerencia — OOB Management', tags: ['OOB', 'Gerencia', 'Rack'] }
    ]
  }
};

function parseDur(str) {
  if (!str) return 0;
  const p = str.split(':').map(Number);
  return p[0] * 60 + (p[1] || 0);
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getModuleMedia(moduleId) {
  if (MODULE_MEDIA[moduleId]) return MODULE_MEDIA[moduleId];
  const idx = parseInt(moduleId.replace('m', '')) || 1;
  return {
    video: {
      title: 'Demonstracao Tecnica — Modulo ' + idx,
      duration: (14 + idx) + ':' + String((idx * 7) % 60).padStart(2, '0'),
      chapters: [
        { time: '0:00',  label: 'Introducao e objetivos da aula' },
        { time: '3:00',  label: 'Configuracao inicial no WinBox' },
        { time: '8:30',  label: 'Implementacao via CLI RouterOS' },
        { time: '13:00', label: 'Verificacao e testes de validacao' }
      ],
      terminalDemo: [
        { delay: 0,    text: '[admin@MikroTik] > /system routerboard print' },
        { delay: 800,  text: '       routerboard: yes' },
        { delay: 1600, text: '            model: CCR2004-1G-12S+2XS' },
        { delay: 2400, text: '     serial-number: HEY09A00001' },
        { delay: 3200, text: '[admin@MikroTik] > /system package print' },
        { delay: 4000, text: ' NAME              VERSION     SCHEDULED' },
        { delay: 4800, text: ' routeros          7.14.3      installed' },
        { delay: 5600, text: ' wireless          7.14.3      installed' },
        { delay: 6400, text: ' ppp               7.14.3      installed' }
      ]
    },
    gallery: [
      { src: '/images/mikrotik_rack_setup.jpg',       caption: 'Equipamento MikroTik em producao ISP', tags: ['Hardware', 'ISP', 'Rack'] },
      { src: '/images/mikrotik_bench_lab.jpg',        caption: 'Laboratorio pratico de configuracao',  tags: ['Lab', 'Config', 'Hands-on'] },
      { src: '/images/mikrotik_hardware_closeup.jpg', caption: 'Interfaces e conectores do equipamento', tags: ['Interfaces', 'Portas', 'LED'] }
    ]
  };
}

// ─── Player de video ──────────────────────────────────────────────────────────
function buildPlayerHTML(vd, cid) {
  const total = parseDur(vd.duration);
  const chapterMarks = vd.chapters.map(function(ch) {
    var pct = (parseDur(ch.time) / total * 100).toFixed(1);
    return '<div class="mv-chapter-mark" style="left:' + pct + '%" title="' + esc(ch.label) + '"></div>';
  }).join('');

  const chapterList = vd.chapters.map(function(ch, i) {
    return (
      '<div class="mv-chapter-item" id="' + cid + '-ch-' + i + '" ' +
      'onclick="window._mvSeekTo(' + parseDur(ch.time) + ', \'' + cid + '\', ' + total + ')">' +
      '<span class="mv-chapter-time">' + ch.time + '</span>' +
      '<span class="mv-chapter-label">' + esc(ch.label) + '</span>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="mv-player" id="' + cid + '">' +
      '<div class="mv-player-screen">' +
        '<div class="mv-player-terminal">' +
          '<div class="mv-terminal-bar">' +
            '<span class="mv-terminal-dot mv-dot-red"></span>' +
            '<span class="mv-terminal-dot mv-dot-yellow"></span>' +
            '<span class="mv-terminal-dot mv-dot-green"></span>' +
            '<span class="mv-terminal-bar-label">terminal@CCR2004 — RouterOS v7.14.3</span>' +
          '</div>' +
          '<div class="mv-terminal-output" id="' + cid + '-output">' +
            '<span class="mv-terminal-hint">&#9654; Pressione Play para iniciar a demonstracao tecnica...</span>' +
          '</div>' +
        '</div>' +
        '<div class="mv-player-overlay" id="' + cid + '-overlay">' +
          '<button class="mv-play-big" onclick="window._mvPlay(\'' + cid + '\')">' +
            '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mv-controls">' +
        '<div class="mv-controls-top">' +
          '<button class="mv-btn-play" onclick="window._mvPlay(\'' + cid + '\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" id="' + cid + '-play-icon"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +
          '<span class="mv-time" id="' + cid + '-time">0:00 / ' + vd.duration + '</span>' +
          '<div style="flex:1"></div>' +
          '<span class="mv-badge-hd">DEMO AO VIVO</span>' +
        '</div>' +
        '<div class="mv-progress-wrap">' +
          '<div class="mv-progress-bg" id="' + cid + '-progress-bg" onclick="window._mvSeek(event, \'' + cid + '\', ' + total + ')">' +
            '<div class="mv-progress-fill" id="' + cid + '-progress-fill" style="width:0%"></div>' +
            chapterMarks +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mv-chapters">' +
        '<div class="mv-chapters-title">Capitulos</div>' +
        chapterList +
      '</div>' +
    '</div>'
  );
}

// ─── Galeria de fotos ──────────────────────────────────────────────────────────
function buildGalleryHTML(images) {
  return (
    '<div class="mv-gallery">' +
    images.map(function(img) {
      var safeCaption = img.caption.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var safeSrc     = img.src.replace(/'/g, "\\'");
      return (
        '<div class="mv-gallery-item" onclick="window._mvLightbox(\'' + safeSrc + '\', \'' + safeCaption + '\')">' +
          '<div class="mv-gallery-img-wrap">' +
            '<img src="' + img.src + '" alt="' + esc(img.caption) + '" loading="lazy">' +
            '<div class="mv-gallery-zoom">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
                '<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>' +
              '</svg>' +
            '</div>' +
          '</div>' +
          '<div class="mv-gallery-info">' +
            '<p class="mv-gallery-caption">' + esc(img.caption) + '</p>' +
            '<div class="mv-gallery-tags">' +
              img.tags.map(function(t) { return '<span class="mv-tag">' + esc(t) + '</span>'; }).join('') +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('') +
    '</div>'
  );
}

// ─── Render principal ──────────────────────────────────────────────────────────
export async function renderModuleView(container, moduleId) {
  container.innerHTML = (
    '<div style="display:flex; justify-content:center; align-items:center; min-height:300px;">' +
      '<div style="color:var(--accent-light); font-size:14px; font-family:var(--font-mono);">Carregando modulo de treinamento...</div>' +
    '</div>'
  );

  try {
    const { module: mod, lessons, labs, quiz } = await API.getModule(moduleId);
    const media    = getModuleMedia(moduleId);
    const levelCls = mod.level === 'Iniciante' ? 'badge-info' : mod.level === 'Intermediario' ? 'badge-warning' : 'badge-danger';
    const r        = 34;
    const circ     = +(2 * Math.PI * r).toFixed(2);
    const offset   = +(circ * (1 - (mod.progress_percent || 0) / 100)).toFixed(2);
    const doneCount = lessons.filter(function(l) { return l.status === 'completed'; }).length;

    // Breadcrumb
    const breadcrumb = (
      '<nav class="mv-breadcrumb">' +
        '<a href="#syllabus" class="mv-breadcrumb-link">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
          'Grade Curricular' +
        '</a>' +
        '<span class="mv-breadcrumb-sep">/</span>' +
        '<span class="mv-breadcrumb-current">' + esc(mod.title) + '</span>' +
      '</nav>'
    );

    // Header
    const labChip = labs.length > 0
      ? '<span class="mv-meta-chip mv-chip-lab">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5l-2 4h18l-2-4h-4m-4 0h4"/>' +
          '</svg>' +
          labs.length + ' lab' + (labs.length > 1 ? 's' : '') +
        '</span>'
      : '';
    const quizBadge = quiz
      ? '<span class="badge ' + (quiz.passed ? 'badge-success' : 'badge-warning') + '">' + (quiz.passed ? '&#x2713; Aprovado' : quiz.percentage + '%') + '</span>'
      : '';
    const firstLesson = lessons.length > 0 ? lessons[0] : null;
    const ctaBtn = firstLesson
      ? '<a href="#lesson/' + firstLesson.id + '" class="btn btn-primary btn-lg">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
          (mod.progress_percent > 0 ? 'Continuar Modulo' : 'Iniciar Modulo') +
        '</a>'
      : '';

    const header = (
      '<div class="mv-header card">' +
        '<div class="mv-header-body">' +
          '<div class="mv-header-icon">' + getIcon(mod.icon) + '</div>' +
          '<div class="mv-header-info">' +
            '<div class="mv-header-meta">' +
              '<span class="badge ' + levelCls + '">' + esc(mod.level) + '</span>' +
              '<span class="mv-meta-chip">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                mod.duration_hours + 'h de conteudo' +
              '</span>' +
              '<span class="mv-meta-chip">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
                '</svg>' +
                lessons.length + ' aulas' +
              '</span>' +
              labChip + quizBadge +
            '</div>' +
            '<h1 class="mv-header-title">' + esc(mod.title) + '</h1>' +
            '<p class="mv-header-desc">' + esc(mod.description) + '</p>' +
          '</div>' +
          '<div class="mv-header-progress">' +
            '<div class="mv-progress-ring-wrap">' +
              '<svg class="mv-progress-ring" width="80" height="80" viewBox="0 0 80 80">' +
                '<circle cx="40" cy="40" r="' + r + '" fill="none" stroke="var(--border-subtle)" stroke-width="5"/>' +
                '<circle cx="40" cy="40" r="' + r + '" fill="none" stroke="var(--accent-primary)" stroke-width="5" ' +
                  'stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '" ' +
                  'stroke-linecap="round" transform="rotate(-90 40 40)"/>' +
              '</svg>' +
              '<div class="mv-progress-ring-label">' +
                '<span class="mv-progress-ring-pct">' + (mod.progress_percent || 0) + '%</span>' +
                '<span class="mv-progress-ring-sub">concluido</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mv-header-actions">' +
          ctaBtn +
          '<a href="#quiz/' + mod.id + '" class="btn btn-secondary btn-lg">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
            'Fazer Avaliacao' +
          '</a>' +
        '</div>' +
      '</div>'
    );

    // Lessons list
    const lessonsHTML = lessons.length === 0
      ? '<p style="padding:20px; color:var(--text-muted); font-size:13px;">Nenhuma aula publicada neste modulo ainda.</p>'
      : '<div class="mv-lessons-list">' +
          lessons.map(function(lesson, i) {
            const statusHTML = lesson.status === 'completed'
              ? '<span class="mv-status-done"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Concluida</span>'
              : lesson.status === 'in_progress'
              ? '<span class="mv-status-progress">Em andamento</span>'
              : '<span class="mv-status-pending">Iniciar</span>';
            return (
              '<a href="#lesson/' + lesson.id + '" class="mv-lesson-row' + (lesson.status === 'completed' ? ' mv-lesson-done' : '') + '">' +
                '<div class="mv-lesson-num">' + (i + 1) + '</div>' +
                '<div class="mv-lesson-info">' +
                  '<span class="mv-lesson-title">' + esc(lesson.title) + '</span>' +
                  '<span class="mv-lesson-dur">' +
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                    lesson.duration_minutes + ' min' +
                  '</span>' +
                '</div>' +
                '<div class="mv-lesson-status">' +
                  statusHTML +
                  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mv-lesson-arrow"><polyline points="9 18 15 12 9 6"/></svg>' +
                '</div>' +
              '</a>'
            );
          }).join('') +
        '</div>';

    // Labs section
    const labsHTML = labs.length === 0 ? '' : (
      '<section class="mv-section">' +
        '<div class="mv-section-header">' +
          '<div class="mv-section-icon" style="background:rgba(239,68,68,0.15); color:#f87171;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5l-2 4h18l-2-4h-4m-4 0h4"/>' +
            '</svg>' +
          '</div>' +
          '<h2 class="mv-section-title">Laboratorios de Troubleshooting</h2>' +
        '</div>' +
        '<div class="mv-section-body">' +
          '<div class="mv-labs-grid">' +
            labs.map(function(lab) {
              const diffIcon = lab.difficulty === 'Facil' ? '&#x1F7E2;' : lab.difficulty === 'Medio' ? '&#x1F7E1;' : '&#x1F534;';
              return (
                '<a href="#lab/' + lab.id + '" class="mv-lab-card">' +
                  '<div class="mv-lab-top">' +
                    '<span class="mv-lab-type">' + diffIcon + ' ' + esc(lab.difficulty) + '</span>' +
                    '<span class="mv-lab-scenario">' + esc(lab.scenario_type) + '</span>' +
                  '</div>' +
                  '<h4 class="mv-lab-title">' + esc(lab.title) + '</h4>' +
                  '<p class="mv-lab-desc">' + esc(lab.description || '') + '</p>' +
                  '<div class="mv-lab-action">Acessar Bancada ' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>' +
                  '</div>' +
                '</a>'
              );
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>'
    );

    // Sidebar quiz
    const quizSideHTML = quiz
      ? '<div class="mv-quiz-result ' + (quiz.passed ? 'mv-quiz-passed' : 'mv-quiz-failed') + '">' +
          '<div class="mv-quiz-score">' + quiz.percentage + '%</div>' +
          '<div class="mv-quiz-verdict">' + (quiz.passed ? '&#x2713; Aprovado' : '&#x2717; Reprovado') + '</div>' +
          '<div class="mv-quiz-detail">' + quiz.score + ' / ' + quiz.total_questions + ' questoes corretas</div>' +
        '</div>'
      : '<div class="mv-quiz-pending">' +
          '<div class="mv-quiz-rule">Nota minima: <strong>80%</strong></div>' +
          '<p style="font-size:12px; color:var(--text-muted); line-height:1.5;">Complete as aulas antes de realizar a avaliacao.</p>' +
        '</div>';

    const quizBtnLabel = quiz && quiz.passed ? 'Ver Resultado' : quiz ? 'Tentar Novamente' : 'Fazer Avaliacao';

    // Skills
    const skills = getModuleSkills(moduleId);
    const skillsHTML = skills.map(function(s) {
      return (
        '<div class="mv-skill-item">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<span>' + esc(s) + '</span>' +
        '</div>'
      );
    }).join('');

    // Assemble full view
    container.innerHTML = (
      '<div class="container mv-root">' +
        breadcrumb + header +
        '<div class="mv-layout">' +
          '<div class="mv-main">' +

            // Video player section
            '<section class="mv-section">' +
              '<div class="mv-section-header">' +
                '<div class="mv-section-icon">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' +
                '</div>' +
                '<h2 class="mv-section-title">Demonstracao Tecnica em Video</h2>' +
              '</div>' +
              '<div class="mv-section-body">' +
                '<div class="mv-video-meta">' +
                  '<h3 class="mv-video-title">' + esc(media.video.title) + '</h3>' +
                  '<p class="mv-video-subtitle">Demonstracao interativa em tempo real com terminal RouterOS ao vivo</p>' +
                '</div>' +
                buildPlayerHTML(media.video, 'vp-' + moduleId) +
              '</div>' +
            '</section>' +

            // Gallery section
            '<section class="mv-section">' +
              '<div class="mv-section-header">' +
                '<div class="mv-section-icon">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
                '</div>' +
                '<h2 class="mv-section-title">Galeria de Equipamentos e Lab</h2>' +
              '</div>' +
              '<div class="mv-section-body">' + buildGalleryHTML(media.gallery) + '</div>' +
            '</section>' +

            // Lessons section
            '<section class="mv-section">' +
              '<div class="mv-section-header">' +
                '<div class="mv-section-icon">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' +
                '</div>' +
                '<h2 class="mv-section-title">Lista de Aulas — ' + lessons.length + ' aulas</h2>' +
              '</div>' +
              '<div class="mv-section-body" style="padding:0;">' + lessonsHTML + '</div>' +
            '</section>' +

            labsHTML +
          '</div>' +

          // Sidebar
          '<aside class="mv-aside">' +
            '<div class="card mv-quiz-box">' +
              '<div class="mv-quiz-box-header">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                ' Avaliacao do Modulo' +
              '</div>' +
              '<div class="mv-quiz-box-body">' +
                quizSideHTML +
                '<a href="#quiz/' + mod.id + '" class="btn btn-primary" style="width:100%; margin-top:12px; justify-content:center;">' + quizBtnLabel + '</a>' +
              '</div>' +
            '</div>' +

            '<div class="card mv-progress-box">' +
              '<div class="mv-quiz-box-header">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
                ' Progresso do Modulo' +
              '</div>' +
              '<div class="mv-progress-box-body">' +
                '<div class="mv-progress-stat"><span>Aulas concluidas</span><strong>' + doneCount + ' / ' + lessons.length + '</strong></div>' +
                '<div class="mv-progress-bar-wrap"><div class="mv-progress-bar-fill" style="width:' + (mod.progress_percent || 0) + '%"></div></div>' +
                '<div class="mv-progress-stat" style="margin-top:8px;"><span>Duracao total</span><strong>' + mod.duration_hours + 'h estimadas</strong></div>' +
                '<div class="mv-progress-stat"><span>Nivel</span><strong>' + esc(mod.level) + '</strong></div>' +
              '</div>' +
            '</div>' +

            '<div class="card mv-skills-box">' +
              '<div class="mv-quiz-box-header">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                ' Habilidades Desenvolvidas' +
              '</div>' +
              '<div class="mv-skills-list">' + skillsHTML + '</div>' +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div>' +

      // Lightbox
      '<div class="mv-lightbox" id="mv-lightbox" onclick="document.getElementById(\'mv-lightbox\').classList.remove(\'active\')">' +
        '<button class="mv-lightbox-close" onclick="event.stopPropagation(); document.getElementById(\'mv-lightbox\').classList.remove(\'active\')">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<img id="mv-lightbox-img" src="" alt="" onclick="event.stopPropagation()">' +
        '<p id="mv-lightbox-caption" class="mv-lightbox-caption"></p>' +
      '</div>'
    );

    initVideoPlayer(moduleId, media.video);
    initLightbox();

  } catch (err) {
    container.innerHTML = (
      '<div class="card" style="max-width:600px; margin:40px auto; border-color:var(--status-danger);">' +
        '<h3 style="color:var(--status-danger);">Erro ao carregar modulo</h3>' +
        '<p style="font-size:13px; color:var(--text-secondary);">' + String(err.message) + '</p>' +
        '<a href="#syllabus" class="btn btn-secondary" style="margin-top:16px;">&#8592; Voltar a Grade</a>' +
      '</div>'
    );
  }
}

// ─── Engine do player ──────────────────────────────────────────────────────────
function initVideoPlayer(moduleId, vd) {
  const cid      = 'vp-' + moduleId;
  const totalSec = parseDur(vd.duration);
  let currentSec = 0;
  let playing    = false;
  let ticker     = null;

  function parseCh(str) {
    if (!str) return 0;
    const p = str.split(':').map(Number);
    return p[0] * 60 + (p[1] || 0);
  }

  function updateUI() {
    const pct  = totalSec > 0 ? (currentSec / totalSec * 100).toFixed(2) : 0;
    const fill = document.getElementById(cid + '-progress-fill');
    const time = document.getElementById(cid + '-time');
    const icon = document.getElementById(cid + '-play-icon');
    if (fill) fill.style.width = pct + '%';
    if (time) time.textContent = fmt(currentSec) + ' / ' + vd.duration;
    if (icon) {
      icon.innerHTML = playing
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<path d="M8 5v14l11-7z"/>';
    }
    vd.chapters.forEach(function(ch, i) {
      const el   = document.getElementById(cid + '-ch-' + i);
      if (!el) return;
      const next  = vd.chapters[i + 1];
      const start = parseCh(ch.time);
      const end   = next ? parseCh(next.time) : totalSec;
      el.classList.toggle('mv-chapter-active', currentSec >= start && currentSec < end);
    });
    const overlay = document.getElementById(cid + '-overlay');
    if (overlay) overlay.style.opacity = playing ? '0' : '1';
  }

  function startTerminal() {
    const out   = document.getElementById(cid + '-output');
    const lines = vd.terminalDemo || [];
    if (!out) return;
    lines.forEach(function(line) {
      const remaining = line.delay / 1000 - currentSec;
      if (remaining < 0) return;
      setTimeout(function() {
        if (!playing) return;
        const div       = document.createElement('div');
        div.className   = 'mv-term-line';
        div.textContent = line.text;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
      }, remaining * 1000);
    });
  }

  window._mvPlay = function(id) {
    if (id !== cid) return;
    playing = !playing;
    if (playing) {
      const out = document.getElementById(cid + '-output');
      if (out && currentSec === 0) out.innerHTML = '';
      startTerminal();
      ticker = setInterval(function() {
        currentSec++;
        if (currentSec >= totalSec) { currentSec = totalSec; playing = false; clearInterval(ticker); }
        updateUI();
      }, 1000);
    } else {
      clearInterval(ticker);
    }
    updateUI();
  };

  window._mvSeek = function(e, id, total) {
    if (id !== cid) return;
    const rect     = e.currentTarget.getBoundingClientRect();
    const ratio    = (e.clientX - rect.left) / rect.width;
    currentSec     = Math.round(ratio * total);
    const out      = document.getElementById(cid + '-output');
    if (out) out.innerHTML = '<span class="mv-terminal-hint">&#9193; Posicao ajustada para ' + fmt(currentSec) + '</span>';
    if (playing) startTerminal();
    updateUI();
  };

  window._mvSeekTo = function(sec, id) {
    if (id !== cid) return;
    currentSec = sec;
    const out  = document.getElementById(cid + '-output');
    if (out) out.innerHTML = '<span class="mv-terminal-hint">&#9193; Capitulo iniciado em ' + fmt(sec) + '</span>';
    if (playing) startTerminal();
    updateUI();
  };

  updateUI();
}

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function initLightbox() {
  window._mvLightbox = function(src, caption) {
    const lb  = document.getElementById('mv-lightbox');
    const img = document.getElementById('mv-lightbox-img');
    const cap = document.getElementById('mv-lightbox-caption');
    if (!lb || !img) return;
    img.src = src;
    img.alt = caption || '';
    if (cap) cap.textContent = caption || '';
    lb.classList.add('active');
  };
}

// ─── Dados de habilidades por modulo ───────────────────────────────────────────
function getModuleSkills(moduleId) {
  const map = {
    m1:  ['Identificar equipamentos MikroTik', 'Verificar status de interfaces', 'Navegar no RouterOS CLI', 'Executar /system resource print'],
    m2:  ['Instalar e usar WinBox', 'Acessar via MAC address', 'Ativar Safe Mode (F4)', 'Criar backup de configuracao'],
    m3:  ['Configurar IP em interfaces', 'Criar bridge e VLANs', 'Verificar tabela ARP', 'Testar conectividade L2'],
    m4:  ['Configurar rota padrao', 'Verificar tabela de rotas', 'Diagnosticar falha de roteamento', 'Usar /ip route print'],
    m5:  ['Configurar NAT Masquerade', 'Criar regras de Firewall', 'Verificar conntrack', 'Testar acesso a internet'],
    m6:  ['Configurar PPPoE client', 'Configurar PPPoE server', 'Monitorar sessoes PPPoE', 'Integrar com RADIUS'],
    m7:  ['Configurar HotSpot', 'Criar perfis de usuario', 'Configurar Walled Garden', 'Monitorar usuarios ativos'],
    m8:  ['Configurar Simple Queue', 'Configurar PCQ por usuario', 'Priorizar trafego VoIP', 'Monitorar largura de banda'],
    m9:  ['Configurar Wireless 802.11', 'Configurar Access Point', 'Usar nstreme/nv2', 'Verificar sinal RSSI'],
    m10: ['Configurar OSPF basico', 'Configurar BGP eBGP', 'Verificar adjacencias', 'Diagnosticar rotas dinamicas'],
    m11: ['Configurar VPN IPSec', 'Configurar PPTP/L2TP', 'Verificar SA Phase', 'Testar tunel VPN'],
    m12: ['Usar /tool torch', 'Capturar pacotes Sniffer', 'Usar /log print', 'Analisar trafego suspeito'],
    m13: ['Configurar CAPsMAN', 'Gerenciar APs remotamente', 'Distribuir configuracoes', 'Roaming entre APs'],
    m14: ['Criar scripts RouterOS', 'Usar scheduler', 'Automatizar backups', 'Enviar alertas por e-mail'],
    m15: ['Hardening completo do router', 'Desativar servicos desnecessarios', 'Firewall avancado', 'Documentar configuracoes']
  };
  return map[moduleId] || ['Configurar equipamentos MikroTik', 'Verificar e testar conectividade', 'Solucionar problemas de rede', 'Documentar configuracoes'];
}
