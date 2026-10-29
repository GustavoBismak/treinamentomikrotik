// COMPONENTE: EMULADOR INTERATIVO DE TERMINAL ROUTEROS
export function renderTerminalEmulator(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    identity = 'RTR-CORP-GW01',
    user = 'admin',
    initialCommands = []
  } = options;

  let history = [];
  let historyIndex = -1;

  container.innerHTML = `
    <div class="terminal-window">
      <div class="terminal-titlebar">
        <div class="terminal-dots">
          <div class="terminal-dot red"></div>
          <div class="terminal-dot yellow"></div>
          <div class="terminal-dot green"></div>
        </div>
        <div>Terminal - ${escapeHtml(user)}@${escapeHtml(identity)}</div>
        <div style="font-size:10px; color:#64748b;">RouterOS v7.14 (mipsbe)</div>
      </div>

      <div class="terminal-body" id="term-body-${containerId}">
        <div class="terminal-banner">  MMM      MMM       KKK                          TTTTTTTTTTT      KKK
  MMMM    MMMM       KKK      III  KKK  RRRRRR     TTT     III  KKK
  MMM MMMM MMM  III  KKK  KK       KKK  RRR  RRR   TTT          KKK  KK
  MMM  MM  MMM  III  KKKKK    III  KKK  RRRRRR     TTT     III  KKKKK
  MMM      MMM  III  KKK  KK  III  KKK  RRR  RRR   TTT     III  KKK  KK
  MMM      MMM  III  KKK   KK III  KKK  RRR   RRR  TTT     III  KKK   KK

  MikroTik RouterOS 7.14 (c) 1999-2026       http://www.mikrotik.com/
        </div>
        <div id="term-output-${containerId}"></div>

        <div class="terminal-input-row">
          <span class="terminal-prompt">[${escapeHtml(user)}@${escapeHtml(identity)}] &gt;</span>
          <input type="text" class="terminal-input" id="term-input-${containerId}" autocomplete="off" spellcheck="false" />
        </div>
      </div>
    </div>
  `;

  const outputEl = document.getElementById(`term-output-${containerId}`);
  const inputEl = document.getElementById(`term-input-${containerId}`);
  const bodyEl = document.getElementById(`term-body-${containerId}`);

  function appendLine(text, type = 'output') {
    const line = document.createElement('div');
    line.className = `terminal-output-line ${type}`;
    line.textContent = text;
    outputEl.appendChild(line);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function handleCommand(cmdRaw) {
    const cmd = cmdRaw.trim();
    if (!cmd) return;

    history.push(cmd);
    historyIndex = history.length;

    appendLine(`[${user}@${identity}] > ${cmd}`, 'prompt');

    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      outputEl.innerHTML = '';
      return;
    }

    if (lower === 'help' || lower === '?') {
      appendLine('Comandos disponíveis para laboratório:\n  /ip address print\n  /ip route print\n  /ip firewall filter print\n  /interface print\n  /ping <ip>\n  /system identity print\n  /system resource print\n  /export\n  clear', 'system');
      return;
    }

    if (lower.startsWith('/ip address print') || lower === 'ip address print') {
      appendLine('Flags: X - DISABLED, I - INVALID, D - DYNAMIC\nColumns: ADDRESS, NETWORK, INTERFACE\n#   ADDRESS          NETWORK        INTERFACE\n0   203.0.113.10/24  203.0.113.0    ether1-WAN\n1   192.168.10.1/24  192.168.10.0   bridge-lan', 'success');
      return;
    }

    if (lower.startsWith('/ip route print') || lower === 'ip route print') {
      appendLine('Flags: D - DYNAMIC; A - ACTIVE; c - CONNECT, s - STATIC\nColumns: DST-ADDRESS, GATEWAY, DISTANCE\n  DST-ADDRESS     GATEWAY                   DISTANCE\n0 AS  0.0.0.0/0   203.0.113.1 (reachable)   1\n1 DAc 192.168.10.0/24  bridge-lan           0\n2 DAc 203.0.113.0/24   ether1-WAN           0', 'success');
      return;
    }

    if (lower.startsWith('/interface print') || lower === 'interface print') {
      appendLine('Flags: R - RUNNING; S - SLAVE\nColumns: NAME, TYPE, ACTUAL-MTU, MAC-ADDRESS\n#   NAME        TYPE      ACTUAL-MTU  MAC-ADDRESS\n0 R ether1-WAN  ether     1500        48:8F:5A:11:22:01\n1 RS ether2     ether     1500        48:8F:5A:11:22:02\n2 RS ether3     ether     1500        48:8F:5A:11:22:03\n3 R bridge-lan  bridge    1500        48:8F:5A:11:22:02', 'success');
      return;
    }

    if (lower.startsWith('/system resource print')) {
      appendLine('                   uptime: 4d12h44m10s\n                  version: 7.14 (stable)\n               build-time: 2026-03-12 11:20:00\n         factory-software: 6.48.6\n              free-memory: 184.2MiB\n             total-memory: 256.0MiB\n                      cpu: MIPS 1004Kc V2.15\n                cpu-count: 2\n            cpu-frequency: 880MHz\n                 cpu-load: 4%\n           free-hdd-space: 11.2MiB\n          total-hdd-space: 16.0MiB\n  write-sect-since-reboot: 4280\n         write-sect-total: 31209', 'system');
      return;
    }

    if (lower.startsWith('/ping') || lower.startsWith('ping')) {
      const parts = cmd.split(' ');
      const target = parts[1] || '1.1.1.1';
      appendLine(`  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 ${target}                                   56  58 11ms\n    1 ${target}                                   56  58 12ms\n    2 ${target}                                   56  58 11ms\n    sent=3 received=3 packet-loss=0% min-rtt=11ms avg-rtt=11ms max-rtt=12ms`, 'success');
      return;
    }

    if (lower.startsWith('/export') || lower === 'export') {
      appendLine(`# 2026-10-26 16:15:00 by RouterOS 7.14\n# software id = 4K8A-X9L2\n# model = RB750Gr3\n/interface bridge add name=bridge-lan protocol-mode=rstp\n/interface bridge port add bridge=bridge-lan interface=ether2\n/ip address add address=203.0.113.10/24 interface=ether1-WAN\n/ip address add address=192.168.10.1/24 interface=bridge-lan\n/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1\n/ip firewall nat add chain=srcnat out-interface=ether1-WAN action=masquerade`, 'system');
      return;
    }

    // Resposta padrão RouterOS para alterações de configuração
    appendLine(`syntax error (bad command name "${cmd}") - Digite "?" ou "help" para lista de comandos.`, 'error');
  }

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = inputEl.value;
      inputEl.value = '';
      handleCommand(val);
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIndex > 0) {
        historyIndex--;
        inputEl.value = history[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        inputEl.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        inputEl.value = '';
      }
      e.preventDefault();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputEl.value.trim();
      const suggestions = ['/ip address print', '/ip route print', '/ip firewall filter print', '/interface print', '/ping 1.1.1.1', '/system resource print', '/export'];
      const match = suggestions.find(s => s.startsWith(val));
      if (match) inputEl.value = match;
    }
  });

  // Executa comandos iniciais se houver
  if (initialCommands.length > 0) {
    initialCommands.forEach(c => handleCommand(c));
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
