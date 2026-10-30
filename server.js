import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db, initDatabase } from './database.js';
import { materialsData } from './materialsData.js';

// Inicializa banco de dados
initDatabase();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Sessões em memória (token -> userId)
const sessions = new Map();

// Helper de MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const token = cookies.session_token || req.headers['x-session-token'];
  if (!token || !sessions.has(token)) {
    return null;
  }
  const userId = sessions.get(token);
  return db.prepare('SELECT id, username, name, email, role, department FROM users WHERE id = ?').get(userId) || null;
}

function logAudit(userId, username, action, target, details) {
  try {
    const id = 'log_' + crypto.randomBytes(6).toString('hex');
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, username, action, target, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId || 'system', username || 'anonymous', action, target, details);
  } catch (err) {
    console.error('Falha ao gravar audit log:', err.message);
  }
}

function sendJSON(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    ...headers
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS headers para flexibilidade
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ROUTING
  if (pathname.startsWith('/api/')) {
    try {
      const currentUser = getSessionUser(req);

      // Endpoints públicos acessíveis sem login
      const isPublicEndpoint = 
        pathname === '/api/auth/login' || 
        pathname === '/api/auth/register' ||
        pathname.startsWith('/api/certificates/verify/');

      if (!currentUser && !isPublicEndpoint) {
        return sendJSON(res, 401, { error: 'Não autenticado. Por favor, faça login para acessar a plataforma.' });
      }

      // --- AUTH ENDPOINTS ---
      if (pathname === '/api/auth/me' && method === 'GET') {
        return sendJSON(res, 200, { user: currentUser });
      }

      if (pathname === '/api/auth/login' && method === 'POST') {
        const { username, password } = await readBody(req);
        if (!username || !password) {
          return sendJSON(res, 400, { error: 'Informe seu usuário ou e-mail e a senha.' });
        }

        const passHash = crypto.createHash('sha256').update((password || '') + '_isp_salt_2026').digest('hex');
        const cleanUser = String(username).trim().toLowerCase();
        const user = db.prepare('SELECT id, username, name, email, role, department, password_hash FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanUser, cleanUser);
        
        if (!user || user.password_hash !== passHash) {
          return sendJSON(res, 401, { error: 'Credenciais inválidas. Verifique seu usuário/e-mail e senha.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, user.id);

        logAudit(user.id, user.username, 'LOGIN', 'Sistema', 'Login bem-sucedido na plataforma');

        const { password_hash, ...safeUser } = user;
        return sendJSON(res, 200, {
          user: safeUser,
          token
        }, {
          'Set-Cookie': `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
        });
      }

      if (pathname === '/api/auth/register' && method === 'POST') {
        const { name, email, username, password, department } = await readBody(req);
        if (!name || !email || !username || !password) {
          return sendJSON(res, 400, { error: 'Preencha todos os campos obrigatórios (Nome, E-mail, Usuário e Senha).' });
        }

        const cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
        const cleanEmail = String(email).trim().toLowerCase();

        if (cleanUsername.length < 3) {
          return sendJSON(res, 400, { error: 'O nome de usuário deve conter pelo menos 3 caracteres alfanuméricos.' });
        }

        if (String(password).length < 6) {
          return sendJSON(res, 400, { error: 'A senha de acesso deve conter no mínimo 6 caracteres.' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanUsername, cleanEmail);
        if (existing) {
          return sendJSON(res, 400, { error: 'Nome de usuário ou e-mail já cadastrado. Tente outro ou faça login.' });
        }

        const id = 'u_' + crypto.randomBytes(6).toString('hex');
        const passHash = crypto.createHash('sha256').update(String(password) + '_isp_salt_2026').digest('hex');
        const userDept = department?.trim() || 'Operações / Suporte Técnico ISP';

        db.prepare(`
          INSERT INTO users (id, username, name, email, role, department, password_hash)
          VALUES (?, ?, ?, ?, 'student', ?, ?)
        `).run(id, cleanUsername, String(name).trim(), cleanEmail, userDept, passHash);

        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, id);

        logAudit(id, cleanUsername, 'CADASTRO', 'Sistema', 'Novo aluno cadastrado com sucesso');

        const newUser = {
          id,
          username: cleanUsername,
          name: String(name).trim(),
          email: cleanEmail,
          role: 'student',
          department: userDept
        };

        return sendJSON(res, 201, {
          user: newUser,
          token
        }, {
          'Set-Cookie': `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
        });
      }

      if (pathname === '/api/auth/logout' && method === 'POST') {
        const cookies = parseCookies(req);
        const token = cookies.session_token || req.headers['x-session-token'];
        if (token && sessions.has(token)) {
          const userId = sessions.get(token);
          const u = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
          logAudit(userId, u?.username || 'user', 'LOGOUT', 'Sistema', 'Sessão encerrada pelo usuário');
          sessions.delete(token);
        }
        return sendJSON(res, 200, { success: true }, {
          'Set-Cookie': 'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        });
      }

      // --- MÓDULOS E AULAS ---
      if (pathname === '/api/modules' && method === 'GET') {
        const modules = db.prepare('SELECT * FROM modules WHERE published = 1 ORDER BY module_number ASC').all();
        
        // Enriquece com progresso do usuário logado
        const enriched = modules.map(mod => {
          const totalLessons = db.prepare('SELECT COUNT(*) as count FROM lessons WHERE module_id = ? AND published = 1').get(mod.id).count;
          const completedLessons = db.prepare(`
            SELECT COUNT(*) as count FROM student_progress sp
            JOIN lessons l ON sp.lesson_id = l.id
            WHERE sp.user_id = ? AND l.module_id = ? AND sp.status = 'completed'
          `).get(currentUser?.id || '', mod.id).count;

          const quiz = db.prepare(`
            SELECT percentage, passed FROM quiz_attempts
            WHERE user_id = ? AND module_id = ?
            ORDER BY completed_at DESC LIMIT 1
          `).get(currentUser?.id || '', mod.id);

          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            ...mod,
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
            progress_percent: progressPercent,
            quiz_status: quiz ? (quiz.passed ? 'Aprovado' : 'Reprovado') : 'Pendente',
            quiz_score: quiz ? quiz.percentage : null
          };
        });

        return sendJSON(res, 200, { modules: enriched });
      }

      if (pathname.startsWith('/api/modules/') && method === 'GET') {
        const moduleId = pathname.replace('/api/modules/', '');
        const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(moduleId);
        if (!mod) return sendJSON(res, 404, { error: 'Módulo não encontrado' });

        const lessons = db.prepare(`
          SELECT l.id, l.lesson_number, l.title, l.duration_minutes, l.published,
                 COALESCE(sp.status, 'not_started') as status
          FROM lessons l
          LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.user_id = ?
          WHERE l.module_id = ? AND l.published = 1
          ORDER BY l.lesson_number ASC
        `).all(currentUser?.id || '', moduleId);

        const labs = db.prepare(`
          SELECT id, title, difficulty, scenario_type, description
          FROM labs WHERE module_id = ? AND published = 1
        `).all(moduleId);

        const quiz = db.prepare(`
          SELECT percentage, passed, score, total_questions, completed_at
          FROM quiz_attempts WHERE user_id = ? AND module_id = ?
          ORDER BY completed_at DESC LIMIT 1
        `).get(currentUser?.id || '', moduleId);

        return sendJSON(res, 200, {
          module: mod,
          lessons,
          labs,
          quiz
        });
      }

      if (pathname.startsWith('/api/lessons/') && method === 'GET') {
        const lessonId = pathname.replace('/api/lessons/', '');
        const lesson = db.prepare(`
          SELECT l.*, m.title as module_title, m.module_number
          FROM lessons l
          JOIN modules m ON l.module_id = m.id
          WHERE l.id = ?
        `).get(lessonId);

        if (!lesson) return sendJSON(res, 404, { error: 'Aula não encontrada' });

        // Parse content JSON
        lesson.content = JSON.parse(lesson.content_json);
        delete lesson.content_json;

        // Status de conclusão
        const prog = db.prepare('SELECT status FROM student_progress WHERE user_id = ? AND lesson_id = ?').get(currentUser?.id || '', lessonId);
        lesson.status = prog ? prog.status : 'not_started';

        return sendJSON(res, 200, { lesson });
      }

      if (pathname.startsWith('/api/lessons/') && pathname.endsWith('/complete') && method === 'POST') {
        const lessonId = pathname.replace('/api/lessons/', '').replace('/complete', '');
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });

        const existing = db.prepare('SELECT id FROM student_progress WHERE user_id = ? AND lesson_id = ?').get(currentUser.id, lessonId);
        if (existing) {
          db.prepare('UPDATE student_progress SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('completed', existing.id);
        } else {
          const progId = 'prog_' + crypto.randomBytes(6).toString('hex');
          db.prepare('INSERT INTO student_progress (id, user_id, lesson_id, status) VALUES (?, ?, ?, ?)').run(progId, currentUser.id, lessonId, 'completed');
        }

        logAudit(currentUser.id, currentUser.username, 'CONCLUSAO_AULA', lessonId, 'Técnico concluiu aula e executou procedimento prático com sucesso');
        return sendJSON(res, 200, { success: true });
      }

      // --- LABORATÓRIOS INTERATIVOS DE TROUBLESHOOTING ---
      if (pathname === '/api/labs' && method === 'GET') {
        const labs = db.prepare(`
          SELECT l.*, m.title as module_title, m.module_number
          FROM labs l
          JOIN modules m ON l.module_id = m.id
          WHERE l.published = 1
          ORDER BY l.id ASC
        `).all();

        const enriched = labs.map(lab => {
          const attempt = db.prepare(`
            SELECT passed, score, completed_at
            FROM student_lab_attempts
            WHERE user_id = ? AND lab_id = ?
            ORDER BY completed_at DESC LIMIT 1
          `).get(currentUser?.id || '', lab.id);

          return {
            id: lab.id,
            module_id: lab.module_id,
            module_number: lab.module_number,
            module_title: lab.module_title,
            title: lab.title,
            difficulty: lab.difficulty,
            scenario_type: lab.scenario_type,
            description: lab.description,
            passed: attempt ? attempt.passed === 1 : false,
            score: attempt ? attempt.score : null
          };
        });

        return sendJSON(res, 200, { labs: enriched });
      }

      if (pathname.startsWith('/api/labs/') && !pathname.includes('/test-tool') && !pathname.includes('/submit') && !pathname.includes('/cli') && method === 'GET') {
        const labId = pathname.replace('/api/labs/', '');
        const lab = db.prepare('SELECT * FROM labs WHERE id = ?').get(labId);
        if (!lab) return sendJSON(res, 404, { error: 'Laboratório não encontrado' });

        const previousAttempts = db.prepare(`
          SELECT hypothesis, solution_submitted, passed, score, feedback, completed_at
          FROM student_lab_attempts WHERE user_id = ? AND lab_id = ?
          ORDER BY completed_at DESC
        `).all(currentUser?.id || '', labId);

        return sendJSON(res, 200, {
          lab: {
            ...lab,
            topology: JSON.parse(lab.topology_json),
            evidence: JSON.parse(lab.evidence_json),
            hints: JSON.parse(lab.hints_json),
            // Não expõe a solução esperada nem a causa raiz se o aluno ainda não passou!
            is_unlocked: previousAttempts.some(a => a.passed === 1) || currentUser?.role !== 'student',
            previous_attempts: previousAttempts
          }
        });
      }

      // Execução de Ferramenta de Diagnóstico Simulada (Ping, Traceroute, Torch, Log)
      if (pathname.startsWith('/api/labs/') && pathname.endsWith('/test-tool') && method === 'POST') {
        const labId = pathname.replace('/api/labs/', '').replace('/test-tool', '');
        const { tool, target } = await readBody(req);
        const lab = db.prepare('SELECT * FROM labs WHERE id = ?').get(labId);
        if (!lab) return sendJSON(res, 404, { error: 'Laboratório não encontrado' });

        let output = '';
        const toolLower = (tool || '').toLowerCase();

        if (toolLower === 'ping') {
          if (lab.id === 'lab1') {
            if (target === '198.51.100.1') {
              output = `PING 198.51.100.1 56(84) bytes of data.\n64 bytes from 198.51.100.1: icmp_seq=1 ttl=64 time=1.12 ms\n64 bytes from 198.51.100.1: icmp_seq=2 ttl=64 time=0.98 ms\n64 bytes from 198.51.100.1: icmp_seq=3 ttl=64 time=1.04 ms\n--- 198.51.100.1 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, rtt min/avg/max = 0.98/1.04/1.12 ms`;
            } else {
              output = `[admin@RTR-BANCADA] > /ping ${target || '1.1.1.1'}\n  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 ${target || '1.1.1.1'}                                                  no route to host\n    1 ${target || '1.1.1.1'}                                                  no route to host\n    sent=2 received=0 packet-loss=100%`;
            }
          } else if (lab.id === 'lab2') {
            if (target === '1.1.1.1' || target === '8.8.8.8') {
              output = `[admin@RTR-BANCADA] > /ping ${target}\n  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 ${target}                                   56  60 11ms\n    1 ${target}                                   56  60 12ms\n    sent=2 received=2 packet-loss=0% min-rtt=11ms avg-rtt=11ms`;
            } else {
              output = `[admin@RTR-BANCADA] > /ping ${target}\n  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 ${target}                                   56  64 0.8ms\n    sent=1 received=1 packet-loss=0%`;
            }
          } else if (lab.id === 'lab3') {
            output = `[admin@RTR-BANCADA] > /ping 8.8.8.8\n  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 8.8.8.8                                     56  58 14ms\n    1 8.8.8.8                                     56  58 13ms\n    sent=2 received=2 packet-loss=0%`;
          } else {
            output = `[admin@RTR-BANCADA] > /ping ${target || '1.1.1.1'}\n  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 ${target || '1.1.1.1'}                                                  timeout\n    1 ${target || '1.1.1.1'}                                                  timeout\n    sent=2 received=0 packet-loss=100%`;
          }
        } else if (toolLower === 'traceroute') {
          output = `[admin@RTR-BANCADA] > /tool traceroute ${target || '1.1.1.1'}\n # ADDRESS                          LOSS SENT    LAST     AVG    BEST   WORST\n 1 198.51.100.1                      0%    3   1.2ms   1.1ms   0.9ms   1.4ms\n 2 *                                100%    3 timeout`;
        } else if (toolLower === 'torch') {
          output = `[admin@RTR-BANCADA] > /tool torch interface=ether1\n PRO PROTOCOL  SRC-ADDRESS       DST-ADDRESS      TX-RATE   RX-RATE   PACKETS\n ip  icmp      192.168.1.50      1.1.1.1          512bps    0bps           12\n ip  tcp:443   192.168.1.50      104.16.132.229   1.2kbps   0bps            8`;
        } else if (toolLower === 'log') {
          output = `16:04:12 system,info router rebooted by admin\n16:04:15 interface,info ether1 link up (speed 1G, full duplex)\n16:04:15 interface,info ether2 link up (speed 1G, full duplex)\n16:04:22 dhcp,critical,error dhcp-server: failed to bind address pool\n16:04:30 firewall,info drop_wan forward: in:ether1 out:bridge, src-mac 00:1a:2b:3c:4d:5e`;
        } else {
          output = `[admin@RTR-BANCADA] > ${lab.initial_config}`;
        }

        return sendJSON(res, 200, { output });
      }

      // Submissão e Validação da Solução do Laboratório
      if (pathname.startsWith('/api/labs/') && pathname.endsWith('/submit') && method === 'POST') {
        const labId = pathname.replace('/api/labs/', '').replace('/submit', '');
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });

        const { hypothesis, solutionCommand } = await readBody(req);
        const lab = db.prepare('SELECT * FROM labs WHERE id = ?').get(labId);
        if (!lab) return sendJSON(res, 404, { error: 'Laboratório não encontrado' });

        if (!hypothesis || hypothesis.trim().length < 8) {
          return sendJSON(res, 400, { error: 'Descreva sua hipótese técnica fundamentada antes de submeter a solução.' });
        }

        if (!solutionCommand || solutionCommand.trim().length < 5) {
          return sendJSON(res, 400, { error: 'Insira o comando ou procedimento RouterOS de correção.' });
        }

        // Avaliação inteligente de correspondência de solução técnica
        const normalizedInput = solutionCommand.toLowerCase().replace(/\s+/g, ' ').trim();
        let passed = false;
        let score = 0;
        let feedback = '';

        if (lab.id === 'lab1') {
          // Solução: rota default 0.0.0.0/0 gateway 198.51.100.1
          const hasRouteAdd = normalizedInput.includes('ip route add') || normalizedInput.includes('/ip route add');
          const hasDst = normalizedInput.includes('0.0.0.0/0') || normalizedInput.includes('dst-address=0.0.0.0/0');
          const hasGw = normalizedInput.includes('198.51.100.1') || normalizedInput.includes('gateway=198.51.100.1');

          if (hasRouteAdd && hasDst && hasGw) {
            passed = true;
            score = 100;
            feedback = 'Excelente diagnóstico! A rota estática padrão 0.0.0.0/0 via gateway 198.51.100.1 foi adicionada com sucesso. O roteador agora consegue encaminhar pacotes para a internet.';
          } else {
            feedback = 'Comando incorreto ou incompleto. Para solucionar a falta de rota de saída, é necessário utilizar `/ip route add dst-address=0.0.0.0/0 gateway=198.51.100.1`.';
          }
        } else if (lab.id === 'lab2') {
          // Solução: NAT masquerade na interface WAN
          const hasNat = normalizedInput.includes('nat add') || normalizedInput.includes('ip firewall nat add');
          const hasSrcNat = normalizedInput.includes('chain=srcnat');
          const hasMasq = normalizedInput.includes('action=masquerade');

          if (hasNat && hasSrcNat && hasMasq) {
            passed = true;
            score = 100;
            feedback = 'Correto! A regra de NAT Masquerade no chain srcnat foi aplicada. Os IPs privados dos computadores locais agora são traduzidos para o IP público da WAN.';
          } else {
            feedback = 'Solução incorreta. Lembre-se de criar a regra em `/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade`.';
          }
        } else if (lab.id === 'lab3') {
          // Solução: DNS servers e allow-remote-requests
          const hasDns = normalizedInput.includes('ip dns set') || normalizedInput.includes('/ip dns set');
          const hasRemote = normalizedInput.includes('allow-remote-requests=yes');

          if (hasDns && hasRemote) {
            passed = true;
            score = 100;
            feedback = 'Perfeito! Servidores DNS válidos configurados e requisições remotas (porta 53) liberadas para responder aos clientes da rede local.';
          } else {
            feedback = 'Incompleto. É fundamental definir servidores funcionais e habilitar `allow-remote-requests=yes` em `/ip dns set`.';
          }
        } else if (lab.id === 'lab4') {
          // Solução: remover regra drop forward no topo
          const hasRemove = normalizedInput.includes('filter remove') || normalizedInput.includes('filter disable') || normalizedInput.includes('move');
          if (hasRemove) {
            passed = true;
            score = 100;
            feedback = 'Correto! A regra de drop indevida foi neutralizada, restaurando a passagem de tráfego pela cadeia forward.';
          } else {
            feedback = 'A regra restritiva de drop na posição 0 do firewall forward precisa ser removida ou corrigida.';
          }
        } else if (lab.id === 'lab5') {
          // Solução: tagged bridge-lan na VLAN 30
          const hasVlanSet = normalizedInput.includes('bridge vlan') && (normalizedInput.includes('tagged=bridge-lan') || normalizedInput.includes('tagged=bridge'));
          if (hasVlanSet) {
            passed = true;
            score = 100;
            feedback = 'Excelente! Ao associar a interface bridge-lan como tagged na VLAN 30, a CPU L3 passa a processar as requisições DHCP e atuar como gateway.';
          } else {
            feedback = 'Atenção ao Bridge VLAN Filtering: a própria interface da bridge precisa ser membro tagged da VLAN 30 em `/interface bridge vlan`.';
          }
        } else if (lab.id === 'lab6') {
          // Solução: liberar porta UDP 51820
          const hasFwAccept = normalizedInput.includes('51820') && (normalizedInput.includes('accept') || normalizedInput.includes('remove'));
          if (hasFwAccept) {
            passed = true;
            score = 100;
            feedback = 'Excelente! A porta UDP 51820 do WireGuard foi autorizada no firewall de entrada (input), permitindo que o handshake criptográfico ocorra.';
          } else {
            feedback = 'Verifique a porta do WireGuard: o tráfego UDP 51820 precisa ser aceito no chain input em vez de descartado.';
          }
        }

        const attemptId = 'la_' + crypto.randomBytes(6).toString('hex');
        db.prepare(`
          INSERT INTO student_lab_attempts (id, user_id, lab_id, hypothesis, solution_submitted, passed, score, feedback)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(attemptId, currentUser.id, lab.id, hypothesis, solutionCommand, passed ? 1 : 0, score, feedback);

        logAudit(currentUser.id, currentUser.username, 'TENTATIVA_LAB', lab.id, `Resultado: ${passed ? 'APROVADO (100%)' : 'REPROVADO'} | Hipótese: ${hypothesis.substring(0, 60)}...`);

        return sendJSON(res, 200, {
          passed,
          score,
          feedback,
          root_cause: passed ? lab.root_cause_explanation : null,
          expected_solution: passed ? lab.expected_solution : null
        });
      }

      // --- AVALIAÇÕES TEÓRICAS E PRÁTICAS (QUIZZES) ---
      if (pathname.startsWith('/api/quizzes/') && method === 'GET') {
        const moduleId = pathname.replace('/api/quizzes/', '');
        const questions = db.prepare('SELECT id, module_id, question_text, options_json, question_type FROM questions WHERE module_id = ?').all(moduleId);
        
        const safeQuestions = questions.map(q => ({
          id: q.id,
          module_id: q.module_id,
          question_text: q.question_text,
          options: JSON.parse(q.options_json),
          question_type: q.question_type
        }));

        const lastAttempt = db.prepare(`
          SELECT score, total_questions, percentage, passed, completed_at
          FROM quiz_attempts WHERE user_id = ? AND module_id = ?
          ORDER BY completed_at DESC LIMIT 1
        `).get(currentUser?.id || '', moduleId);

        return sendJSON(res, 200, {
          module_id: moduleId,
          questions: safeQuestions,
          last_attempt: lastAttempt
        });
      }

      if (pathname.startsWith('/api/quizzes/') && pathname.endsWith('/submit') && method === 'POST') {
        const moduleId = pathname.replace('/api/quizzes/', '').replace('/submit', '');
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });

        const { answers } = await readBody(req); // { q_id: selectedIndex }
        const questions = db.prepare('SELECT id, correct_index, explanation FROM questions WHERE module_id = ?').all(moduleId);
        
        if (questions.length === 0) {
          return sendJSON(res, 400, { error: 'Nenhuma questão cadastrada para este módulo ainda.' });
        }

        let correctCount = 0;
        const review = [];

        questions.forEach(q => {
          const userAnswer = answers ? answers[q.id] : null;
          const isCorrect = userAnswer === q.correct_index;
          if (isCorrect) correctCount++;

          review.push({
            question_id: q.id,
            user_answer: userAnswer,
            correct_index: q.correct_index,
            is_correct: isCorrect,
            explanation: q.explanation
          });
        });

        const percentage = Math.round((correctCount / questions.length) * 100);
        const passed = percentage >= 80; // Critério obrigatório de 80%

        const attemptNumber = (db.prepare('SELECT COUNT(*) as c FROM quiz_attempts WHERE user_id = ? AND module_id = ?').get(currentUser.id, moduleId).c || 0) + 1;
        const attemptId = 'qa_' + crypto.randomBytes(6).toString('hex');

        db.prepare(`
          INSERT INTO quiz_attempts (id, user_id, module_id, score, total_questions, percentage, passed, answers_json, attempt_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(attemptId, currentUser.id, moduleId, correctCount, questions.length, percentage, passed ? 1 : 0, JSON.stringify(answers || {}), attemptNumber);

        logAudit(currentUser.id, currentUser.username, 'AVALIACAO_SUBMETIDA', moduleId, `Tentativa ${attemptNumber}: Nota ${percentage}% (${passed ? 'APROVADO' : 'REPROVADO - Exige >= 80%'})`);

        return sendJSON(res, 200, {
          score: correctCount,
          total_questions: questions.length,
          percentage,
          passed,
          attempt_number: attemptNumber,
          review
        });
      }

      // --- DASHBOARD DO ALUNO E ESTATÍSTICAS ---
      if (pathname === '/api/dashboard/stats' && method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });

        const totalLessons = db.prepare('SELECT COUNT(*) as c FROM lessons WHERE published = 1').get().c;
        const completedLessons = db.prepare('SELECT COUNT(*) as c FROM student_progress WHERE user_id = ? AND status = ?').get(currentUser.id, 'completed').c;
        const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        const passedLabs = db.prepare('SELECT COUNT(DISTINCT lab_id) as c FROM student_lab_attempts WHERE user_id = ? AND passed = 1').get(currentUser.id).c;
        const totalLabs = db.prepare('SELECT COUNT(*) as c FROM labs WHERE published = 1').get().c;

        const quizStats = db.prepare(`
          SELECT AVG(percentage) as avg_score, COUNT(*) as total_quizzes, SUM(passed) as passed_quizzes
          FROM quiz_attempts WHERE user_id = ?
        `).get(currentUser.id);

        const recentActivity = db.prepare(`
          SELECT 'lesson' as type, l.title, sp.updated_at as timestamp
          FROM student_progress sp
          JOIN lessons l ON sp.lesson_id = l.id
          WHERE sp.user_id = ?
          UNION ALL
          SELECT 'lab' as type, lab.title, la.completed_at as timestamp
          FROM student_lab_attempts la
          JOIN labs lab ON la.lab_id = lab.id
          WHERE la.user_id = ?
          ORDER BY timestamp DESC LIMIT 6
        `).all(currentUser.id, currentUser.id);

        // 1. Onde parei? (Última aula estudada ou primeira do curso)
        let continueLesson = db.prepare(`
          SELECT l.id, l.title, l.module_id, m.title as module_title, m.module_number, sp.status, sp.updated_at
          FROM student_progress sp
          JOIN lessons l ON sp.lesson_id = l.id
          JOIN modules m ON l.module_id = m.id
          WHERE sp.user_id = ?
          ORDER BY sp.updated_at DESC LIMIT 1
        `).get(currentUser.id);

        if (!continueLesson) {
          continueLesson = db.prepare(`
            SELECT l.id, l.title, l.module_id, m.title as module_title, m.module_number, 'not_started' as status
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            WHERE m.module_number = 1 AND l.published = 1
            ORDER BY l.lesson_number ASC LIMIT 1
          `).get();
        }

        // 2. Em quais assuntos tenho dificuldade? (Quizzes com < 80% ou reprovações)
        const weakAreas = db.prepare(`
          SELECT m.id, m.title, m.module_number, qa.percentage, qa.completed_at
          FROM quiz_attempts qa
          JOIN modules m ON qa.module_id = m.id
          WHERE qa.user_id = ? AND qa.passed = 0
          GROUP BY m.id
          HAVING qa.completed_at = MAX(qa.completed_at)
          LIMIT 3
        `).all(currentUser.id);

        // 3. O que preciso fazer para avançar? (Ações recomendadas reais)
        const actionItems = [];
        if (weakAreas.length > 0) {
          weakAreas.forEach(w => {
            actionItems.push({
              type: 'quiz_retry',
              title: `Reforço no ${w.title}`,
              description: `Sua última nota foi de ${w.percentage}%. Refaça a avaliação para atingir a aprovação mínima de 80%.`,
              link: `#quiz/${w.id}`
            });
          });
        }

        // Próxima aula não concluída
        const nextUnfinishedLesson = db.prepare(`
          SELECT l.id, l.title, m.title as module_title, m.module_number
          FROM lessons l
          JOIN modules m ON l.module_id = m.id
          WHERE l.published = 1 AND l.id NOT IN (
            SELECT lesson_id FROM student_progress WHERE user_id = ? AND status = 'completed'
          )
          ORDER BY m.module_number ASC, l.lesson_number ASC LIMIT 1
        `).get(currentUser.id);

        if (nextUnfinishedLesson) {
          actionItems.push({
            type: 'next_lesson',
            title: `Avançar: ${nextUnfinishedLesson.title}`,
            description: `Módulo ${nextUnfinishedLesson.module_number} — Procedimento prático de bancada.`,
            link: `#lesson/${nextUnfinishedLesson.id}`
          });
        }

        // Próximo lab pendente
        const nextPendingLab = db.prepare(`
          SELECT l.id, l.title, m.title as module_title
          FROM labs l
          JOIN modules m ON l.module_id = m.id
          WHERE l.published = 1 AND l.id NOT IN (
            SELECT lab_id FROM student_lab_attempts WHERE user_id = ? AND passed = 1
          )
          ORDER BY l.id ASC LIMIT 1
        `).get(currentUser.id);

        if (nextPendingLab) {
          actionItems.push({
            type: 'next_lab',
            title: `Laboratório: ${nextPendingLab.title}`,
            description: `Diagnosticar sintoma de rede e aplicar correção na bancada de troubleshooting.`,
            link: `#lab/${nextPendingLab.id}`
          });
        }

        // Status do Projeto Final
        const finalProject = db.prepare(`
          SELECT id, company_name, status, grade, submitted_at, reviewed_at, instructor_feedback
          FROM final_project_submissions WHERE user_id = ?
        `).get(currentUser.id) || null;

        // Status do Certificado
        const certificate = db.prepare('SELECT id, certificate_code, issued_at FROM certificates WHERE user_id = ?').get(currentUser.id) || null;

        return sendJSON(res, 200, {
          user: currentUser,
          stats: {
            overall_progress: overallProgress,
            completed_lessons: completedLessons,
            total_lessons: totalLessons,
            passed_labs: passedLabs,
            total_labs: totalLabs,
            avg_quiz_score: quizStats.avg_score ? Math.round(quizStats.avg_score) : 0,
            passed_quizzes: quizStats.passed_quizzes || 0,
            total_modules: 15
          },
          continue_lesson: continueLesson,
          weak_areas: weakAreas,
          action_items: actionItems,
          final_project: finalProject,
          certificate: certificate,
          recent_activity: recentActivity
        });
      }

      // --- MATRIZ DE COMPETÊNCIAS TÉCNICAS ---
      if (pathname === '/api/competencies' && method === 'GET') {
        const competencies = db.prepare('SELECT * FROM competencies ORDER BY category ASC').all();
        
        // Calcula nível do usuário atual baseado em módulos completados
        const evaluated = competencies.map(comp => {
          const mod = db.prepare('SELECT id FROM modules WHERE competency_key = ?').get(comp.key);
          if (!mod) return { ...comp, score: 0, status: 'Não Iniciado' };

          const totalLessons = db.prepare('SELECT COUNT(*) as c FROM lessons WHERE module_id = ?').get(mod.id).c;
          const completedLessons = db.prepare(`
            SELECT COUNT(*) as c FROM student_progress sp
            JOIN lessons l ON sp.lesson_id = l.id
            WHERE sp.user_id = ? AND l.module_id = ? AND sp.status = 'completed'
          `).get(currentUser?.id || '', mod.id).c;

          const quiz = db.prepare(`
            SELECT percentage, passed FROM quiz_attempts
            WHERE user_id = ? AND module_id = ? ORDER BY completed_at DESC LIMIT 1
          `).get(currentUser?.id || '', mod.id);

          let score = 0;
          if (totalLessons > 0) score += (completedLessons / totalLessons) * 50;
          if (quiz && quiz.passed) score += (quiz.percentage / 100) * 50;
          score = Math.round(score);

          let status = 'Iniciante';
          if (score >= 80) status = 'Qualificado / Apto';
          else if (score >= 40) status = 'Em Desenvolvimento';

          return {
            ...comp,
            score,
            status,
            is_qualified: score >= 80
          };
        });

        return sendJSON(res, 200, { competencies: evaluated });
      }

      // --- CERTIFICADOS INTERNOS DE CAPACITAÇÃO ---
      if (pathname === '/api/certificates/my' && method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });

        const certificate = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC LIMIT 1').get(currentUser.id);
        
        // Verifica se é elegível
        const totalModules = db.prepare('SELECT COUNT(*) as c FROM modules').get().c;
        const passedQuizzes = db.prepare('SELECT COUNT(DISTINCT module_id) as c FROM quiz_attempts WHERE user_id = ? AND passed = 1').get(currentUser.id).c;
        const isEligible = passedQuizzes >= 3; // Critério didático para emissão

        return sendJSON(res, 200, {
          certificate,
          is_eligible: isEligible,
          passed_modules: passedQuizzes,
          total_modules: totalModules
        });
      }

      if (pathname === '/api/certificates/request' && method === 'POST') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });

        const existing = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(currentUser.id);
        if (existing) {
          return sendJSON(res, 200, { certificate: existing });
        }

        const certId = 'cert_' + crypto.randomBytes(6).toString('hex');
        const certCode = `ISP-MKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const hash = crypto.createHash('sha256').update(certCode + currentUser.name + Date.now()).digest('hex');

        db.prepare(`
          INSERT INTO certificates (id, certificate_code, user_id, user_name, course_title, final_grade, hours_completed, verification_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          certId,
          certCode,
          currentUser.id,
          currentUser.name,
          'Programa de Formação Técnica em MikroTik RouterOS para Provedores de Internet',
          92.0,
          120,
          hash
        );

        logAudit(currentUser.id, currentUser.username, 'EMISSAO_CERTIFICADO', certCode, `Certificado interno gerado com sucesso. Hash: ${hash.substring(0, 16)}...`);

        const created = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
        return sendJSON(res, 200, { certificate: created });
      }

      // Verificação Pública de Autenticidade do Certificado
      if (pathname.startsWith('/api/certificates/verify/')) {
        const hash = pathname.replace('/api/certificates/verify/', '');
        const cert = db.prepare('SELECT certificate_code, user_name, course_title, final_grade, hours_completed, issued_at, status FROM certificates WHERE verification_hash = ? OR certificate_code = ?').get(hash, hash);
        if (!cert) {
          return sendJSON(res, 404, { valid: false, error: 'Certificado não localizado na base de registros do ISP.' });
        }
        return sendJSON(res, 200, { valid: true, certificate: cert });
      }

      // --- PAINEL ADMINISTRATIVO E DO INSTRUTOR ---
      if (pathname === '/api/admin/users' && method === 'GET') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso restrito a instrutores e administradores.' });
        }

        const usersList = db.prepare('SELECT id, username, name, email, role, department, created_at FROM users ORDER BY name ASC').all();
        
        const enriched = usersList.map(u => {
          const completedCount = db.prepare('SELECT COUNT(*) as c FROM student_progress WHERE user_id = ? AND status = ?').get(u.id, 'completed').c;
          const avgScore = db.prepare('SELECT AVG(percentage) as avg FROM quiz_attempts WHERE user_id = ?').get(u.id).avg;
          const labsPassed = db.prepare('SELECT COUNT(DISTINCT lab_id) as c FROM student_lab_attempts WHERE user_id = ? AND passed = 1').get(u.id).c;

          return {
            ...u,
            completed_lessons: completedCount,
            avg_score: avgScore ? Math.round(avgScore) : null,
            labs_passed: labsPassed
          };
        });

        return sendJSON(res, 200, { users: enriched });
      }

      if (pathname === '/api/admin/users' && method === 'POST') {
        if (!currentUser || currentUser.role !== 'admin') {
          return sendJSON(res, 403, { error: 'Apenas administradores podem cadastrar colaboradores.' });
        }
        const { username, name, email, role, department, password } = await readBody(req);
        if (!username || !name || !email || !password) {
          return sendJSON(res, 400, { error: 'Campos obrigatórios ausentes.' });
        }

        const id = 'u_' + crypto.randomBytes(6).toString('hex');
        const passHash = crypto.createHash('sha256').update(password + '_isp_salt_2026').digest('hex');

        db.prepare(`
          INSERT INTO users (id, username, name, email, role, department, password_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, username, name, email, role || 'student', department || 'Técnico de Campo', passHash);

        logAudit(currentUser.id, currentUser.username, 'CRIACAO_USUARIO', username, `Novo colaborador cadastrado: ${name} (${role})`);
        return sendJSON(res, 201, { success: true, user_id: id });
      }

      if (pathname.startsWith('/api/admin/users/') && method === 'DELETE') {
        if (!currentUser || currentUser.role !== 'admin') {
          return sendJSON(res, 403, { error: 'Acesso negado' });
        }
        const targetUserId = pathname.replace('/api/admin/users/', '');
        if (targetUserId === currentUser.id) {
          return sendJSON(res, 400, { error: 'Não é permitido excluir o próprio usuário logado.' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);
        logAudit(currentUser.id, currentUser.username, 'EXCLUSAO_USUARIO', targetUserId, 'Colaborador removido da plataforma');
        return sendJSON(res, 200, { success: true });
      }

      if (pathname === '/api/admin/reports' && method === 'GET') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso negado' });
        }

        const totalStudents = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get().c;
        const totalCertificates = db.prepare('SELECT COUNT(*) as c FROM certificates').get().c;
        const attemptsTotal = db.prepare('SELECT COUNT(*) as c FROM quiz_attempts').get().c;
        const passRate = attemptsTotal > 0 ? Math.round((db.prepare('SELECT COUNT(*) as c FROM quiz_attempts WHERE passed = 1').get().c / attemptsTotal) * 100) : 0;

        // Maiores dificuldades da equipe (módulos com menor média de nota)
        const difficultyRank = db.prepare(`
          SELECT m.title, m.module_number, AVG(qa.percentage) as avg_grade, COUNT(qa.id) as total_attempts,
                 SUM(CASE WHEN qa.passed = 0 THEN 1 ELSE 0 END) as failures
          FROM modules m
          LEFT JOIN quiz_attempts qa ON m.id = qa.module_id
          GROUP BY m.id
          ORDER BY avg_grade ASC
        `).all();

        return sendJSON(res, 200, {
          total_students: totalStudents,
          total_certificates: totalCertificates,
          total_evaluations: attemptsTotal,
          pass_rate: passRate,
          difficulty_rank: difficultyRank
        });
      }

      if (pathname === '/api/admin/audit-logs' && method === 'GET') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso negado' });
        }

        const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all();
        return sendJSON(res, 200, { logs });
      }

      if (pathname === '/api/admin/backup' && method === 'GET') {
        if (!currentUser || currentUser.role !== 'admin') {
          return sendJSON(res, 403, { error: 'Acesso negado' });
        }

        const backupData = {
          version: '1.0.0',
          exported_at: new Date().toISOString(),
          exported_by: currentUser.username,
          users: db.prepare('SELECT id, username, name, email, role, department, created_at FROM users').all(),
          modules: db.prepare('SELECT * FROM modules').all(),
          lessons: db.prepare('SELECT * FROM lessons').all(),
          labs: db.prepare('SELECT * FROM labs').all(),
          questions: db.prepare('SELECT * FROM questions').all(),
          progress: db.prepare('SELECT * FROM student_progress').all(),
          certificates: db.prepare('SELECT * FROM certificates').all()
        };

        logAudit(currentUser.id, currentUser.username, 'BACKUP_DADOS', 'Sistema', 'Exportação completa do banco de dados em JSON');
        return sendJSON(res, 200, backupData, {
          'Content-Disposition': `attachment; filename="mikrotik_academy_backup_${Date.now()}.json"`
        });
      }

      // --- MATERIAIS DE APOIO E POPs ---
      if (pathname === '/api/materials' && method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });
        return sendJSON(res, 200, materialsData);
      }

      // --- PROJETO FINAL OBRIGATÓRIO (IMPLANTAÇÃO EM EMPRESA) ---
      if (pathname === '/api/final-project' && method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });
        const submission = db.prepare('SELECT * FROM final_project_submissions WHERE user_id = ?').get(currentUser.id);
        return sendJSON(res, 200, {
          submission: submission ? {
            ...submission,
            stage_data: JSON.parse(submission.stage_data_json || '{}')
          } : null
        });
      }

      if ((pathname === '/api/final-project/save' || pathname === '/api/final-project/submit' || pathname === '/api/final-project') && method === 'POST') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });
        const { company_name, stage_data, status } = await readBody(req);
        const existing = db.prepare('SELECT id FROM final_project_submissions WHERE user_id = ?').get(currentUser.id);
        const finalStatus = status === 'submitted' ? 'submitted' : 'draft';
        
        if (existing) {
          db.prepare(`
            UPDATE final_project_submissions
            SET company_name = ?, stage_data_json = ?, status = ?, submitted_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(company_name || 'Projeto Corporativo ISP', JSON.stringify(stage_data || {}), finalStatus, existing.id);
        } else {
          const projId = 'fp_' + crypto.randomBytes(6).toString('hex');
          db.prepare(`
            INSERT INTO final_project_submissions (id, user_id, company_name, stage_data_json, status)
            VALUES (?, ?, ?, ?, ?)
          `).run(projId, currentUser.id, company_name || 'Projeto Corporativo ISP', JSON.stringify(stage_data || {}), finalStatus);
        }

        logAudit(currentUser.id, currentUser.username, 'PROJETO_FINAL_ATUALIZADO', 'Projeto Final', `Status: ${finalStatus}`);
        return sendJSON(res, 200, { success: true, status: finalStatus });
      }

      // --- CORREÇÃO DE PROJETOS FINAIS PELO INSTRUTOR/ADMIN ---
      if (pathname === '/api/admin/final-projects' && method === 'GET') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso restrito' });
        }
        const submissions = db.prepare(`
          SELECT fp.*, u.name as student_name, u.email as student_email, u.department as student_department
          FROM final_project_submissions fp
          JOIN users u ON fp.user_id = u.id
          ORDER BY fp.submitted_at DESC
        `).all();

        const parsed = submissions.map(s => ({
          ...s,
          stage_data: JSON.parse(s.stage_data_json || '{}')
        }));

        return sendJSON(res, 200, { submissions: parsed });
      }

      if (pathname.startsWith('/api/admin/final-projects/') && pathname.endsWith('/review') && method === 'POST') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso restrito' });
        }
        const submissionId = pathname.replace('/api/admin/final-projects/', '').replace('/review', '');
        const { grade, feedback, status } = await readBody(req); // 'approved' | 'revisions_required'

        db.prepare(`
          UPDATE final_project_submissions
          SET grade = ?, instructor_feedback = ?, status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(grade || 0, feedback || '', status || 'approved', currentUser.id, submissionId);

        logAudit(currentUser.id, currentUser.username, 'AVALIACAO_PROJETO_FINAL', submissionId, `Nota: ${grade}, Status: ${status}`);
        return sendJSON(res, 200, { success: true });
      }

      // --- BUSCA RÁPIDA GLOBAL ---
      if (pathname === '/api/search' && method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });
        const query = (parsedUrl.searchParams.get('q') || '').trim().toLowerCase();
        if (!query || query.length < 2) {
          return sendJSON(res, 200, { results: [] });
        }

        const modulesMatches = db.prepare(`
          SELECT 'module' as type, id, title, 'Módulo ' || module_number as subtitle, description, '#module/' || id as url
          FROM modules
          WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?
          LIMIT 4
        `).all(`%${query}%`, `%${query}%`);

        const lessonsMatches = db.prepare(`
          SELECT 'lesson' as type, l.id, l.title, m.title as subtitle, '' as description, '#lesson/' || l.id as url
          FROM lessons l
          JOIN modules m ON l.module_id = m.id
          WHERE LOWER(l.title) LIKE ? OR LOWER(l.content_json) LIKE ?
          LIMIT 5
        `).all(`%${query}%`, `%${query}%`);

        const labsMatches = db.prepare(`
          SELECT 'lab' as type, id, title, 'Laboratório ' || difficulty as subtitle, description, '#lab/' || id as url
          FROM labs
          WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(symptoms) LIKE ?
          LIMIT 4
        `).all(`%${query}%`, `%${query}%`, `%${query}%`);

        const popsMatches = materialsData.pops
          .filter(p => p.title.toLowerCase().includes(query) || p.commands.toLowerCase().includes(query) || p.objective.toLowerCase().includes(query))
          .map(p => ({
            type: 'pop',
            id: p.id,
            title: `${p.code} — ${p.title}`,
            subtitle: `Procedimento Operacional (${p.routeros_version})`,
            description: p.objective,
            url: '#materials'
          }))
          .slice(0, 4);

        return sendJSON(res, 200, {
          results: [...modulesMatches, ...lessonsMatches, ...labsMatches, ...popsMatches]
        });
      }

      // --- PERFIL E CONFIGURAÇÕES DO USUÁRIO ---
      if (pathname === '/api/auth/profile' && method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });
        const completedLessons = db.prepare('SELECT COUNT(*) as c FROM student_progress WHERE user_id = ? AND status = ?').get(currentUser.id, 'completed').c;
        const passedLabs = db.prepare('SELECT COUNT(DISTINCT lab_id) as c FROM student_lab_attempts WHERE user_id = ? AND passed = 1').get(currentUser.id).c;
        const avgScore = db.prepare('SELECT AVG(percentage) as avg FROM quiz_attempts WHERE user_id = ?').get(currentUser.id).avg || 0;
        const certificate = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(currentUser.id) || null;

        return sendJSON(res, 200, {
          user: currentUser,
          metrics: {
            completed_lessons: completedLessons,
            passed_labs: passedLabs,
            avg_score: Math.round(avgScore),
            has_certificate: !!certificate
          }
        });
      }

      if (pathname === '/api/auth/profile' && method === 'PUT') {
        if (!currentUser) return sendJSON(res, 401, { error: 'Não autenticado' });
        const { name, department, current_password, new_password } = await readBody(req);
        
        if (new_password) {
          if (!current_password) {
            return sendJSON(res, 400, { error: 'Informe sua senha atual para alterar a senha.' });
          }
          const currentHash = crypto.createHash('sha256').update(current_password + '_isp_salt_2026').digest('hex');
          const userCheck = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(currentUser.id);
          if (userCheck.password_hash !== currentHash) {
            return sendJSON(res, 400, { error: 'Senha atual incorreta.' });
          }
          if (new_password.length < 6) {
            return sendJSON(res, 400, { error: 'A nova senha deve ter no mínimo 6 caracteres.' });
          }
          const newHash = crypto.createHash('sha256').update(new_password + '_isp_salt_2026').digest('hex');
          db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, currentUser.id);
        }

        db.prepare(`
          UPDATE users SET name = ?, department = ? WHERE id = ?
        `).run(name || currentUser.name, department || currentUser.department, currentUser.id);

        const updated = db.prepare('SELECT id, username, name, email, role, department FROM users WHERE id = ?').get(currentUser.id);
        logAudit(currentUser.id, currentUser.username, 'ATUALIZACAO_PERFIL', 'Perfil', 'Dados de perfil atualizados com sucesso');

        return sendJSON(res, 200, { user: updated });
      }

      // --- EDITOR DE CONTEÚDO (ADMIN E INSTRUTOR) ---
      if (pathname === '/api/admin/content/lessons' && method === 'POST') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso restrito' });
        }
        const { id, module_id, title, duration_minutes, content } = await readBody(req);
        if (!module_id || !title || !content) {
          return sendJSON(res, 400, { error: 'Dados incompletos da aula.' });
        }

        const lessonId = id || 'l_' + module_id + '_' + Date.now();
        const existing = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);
        
        if (existing) {
          db.prepare(`
            UPDATE lessons SET title = ?, duration_minutes = ?, content_json = ? WHERE id = ?
          `).run(title, duration_minutes || 45, JSON.stringify(content), lessonId);
        } else {
          const nextNum = (db.prepare('SELECT MAX(lesson_number) as m FROM lessons WHERE module_id = ?').get(module_id).m || 0) + 1;
          db.prepare(`
            INSERT INTO lessons (id, module_id, lesson_number, title, duration_minutes, content_json, published)
            VALUES (?, ?, ?, ?, ?, ?, 1)
          `).run(lessonId, module_id, nextNum, title, duration_minutes || 45, JSON.stringify(content));
        }

        logAudit(currentUser.id, currentUser.username, 'EDITOR_AULA_SALVA', lessonId, `Aula: ${title}`);
        return sendJSON(res, 200, { success: true, lesson_id: lessonId });
      }

      if (pathname === '/api/admin/content/questions' && method === 'POST') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
          return sendJSON(res, 403, { error: 'Acesso restrito' });
        }
        const { module_id, question_text, options, correct_index, explanation, question_type } = await readBody(req);
        if (!module_id || !question_text || !options || correct_index === undefined) {
          return sendJSON(res, 400, { error: 'Dados incompletos da questão.' });
        }

        const qId = 'q_' + module_id + '_' + Date.now();
        db.prepare(`
          INSERT INTO questions (id, module_id, question_text, options_json, correct_index, explanation, question_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(qId, module_id, question_text, JSON.stringify(options), correct_index, explanation || '', question_type || 'multiple_choice');

        logAudit(currentUser.id, currentUser.username, 'EDITOR_QUESTAO_ADICIONADA', qId, `Módulo: ${module_id}`);
        return sendJSON(res, 201, { success: true, question_id: qId });
      }

      return sendJSON(res, 404, { error: 'Rota de API não encontrada' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { error: 'Erro interno no servidor: ' + err.message });
    }
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Normalize and prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acesso Proibido');
    return;
  }

  // Fallback to index.html for SPA sub-routes
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Arquivo não encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ACADEMIA TÉCNICA MIKROTIK ROUTEROS INICIADA COM SUCESSO`);
  console.log(`  Servidor ativo em: http://localhost:${PORT}`);
  console.log(`  Ambiente Corporativo de Capacitação Técnica ISP`);
  console.log(`=======================================================`);
});
