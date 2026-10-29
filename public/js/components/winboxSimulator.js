// COMPONENTE: SIMULADOR VISUAL DO WINBOX MIKROTIK
export function renderWinBoxSimulator(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    identity = 'RTR-CORP-GW01',
    activeTab = 'interfaces',
    safeMode = false
  } = options;

  let isSafeMode = safeMode;
  let currentMenu = activeTab;

  const menuItems = [
    { id: 'quickset', label: 'Quick Set' },
    { id: 'interfaces', label: 'Interfaces' },
    { id: 'bridge', label: 'Bridge' },
    { id: 'ip_addresses', label: 'IP -> Addresses' },
    { id: 'ip_routes', label: 'IP -> Routes' },
    { id: 'ip_firewall', label: 'IP -> Firewall' },
    { id: 'ip_dns', label: 'IP -> DNS' },
    { id: 'ip_dhcp', label: 'IP -> DHCP Server' },
    { id: 'system_identity', label: 'System -> Identity' },
    { id: 'files', label: 'Files' }
  ];

  function getTableContent(menu) {
    if (menu === 'interfaces') {
      return `
        <table class="winbox-table">
          <thead>
            <tr>
              <th style="width:30px">Flag</th>
              <th>Name</th>
              <th>Type</th>
              <th>MTU</th>
              <th>Actual MTU</th>
              <th>MAC Address</th>
              <th>Tx (bps)</th>
              <th>Rx (bps)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="selected">
              <td><span style="color:#4ade80">R</span></td>
              <td>ether1-WAN</td>
              <td>Ethernet</td>
              <td>1500</td>
              <td>1500</td>
              <td>48:8F:5A:11:22:01</td>
              <td>12.4 Mbps</td>
              <td>48.2 Mbps</td>
            </tr>
            <tr>
              <td><span style="color:#4ade80">R S</span></td>
              <td>ether2</td>
              <td>Ethernet</td>
              <td>1500</td>
              <td>1500</td>
              <td>48:8F:5A:11:22:02</td>
              <td>1.2 Mbps</td>
              <td>3.4 Mbps</td>
            </tr>
            <tr>
              <td><span style="color:#4ade80">R S</span></td>
              <td>ether3</td>
              <td>Ethernet</td>
              <td>1500</td>
              <td>1500</td>
              <td>48:8F:5A:11:22:03</td>
              <td>420 kbps</td>
              <td>1.1 Mbps</td>
            </tr>
            <tr>
              <td><span style="color:#4ade80">R S</span></td>
              <td>ether4</td>
              <td>Ethernet</td>
              <td>1500</td>
              <td>1500</td>
              <td>48:8F:5A:11:22:04</td>
              <td>0 bps</td>
              <td>0 bps</td>
            </tr>
            <tr>
              <td><span style="color:#4ade80">R</span></td>
              <td>bridge-lan</td>
              <td>Bridge</td>
              <td>1500</td>
              <td>1500</td>
              <td>48:8F:5A:11:22:02</td>
              <td>1.6 Mbps</td>
              <td>4.5 Mbps</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (menu === 'ip_addresses') {
      return `
        <table class="winbox-table">
          <thead>
            <tr>
              <th style="width:30px">#</th>
              <th>Address</th>
              <th>Network</th>
              <th>Interface</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr class="selected">
              <td>0</td>
              <td>203.0.113.10/24</td>
              <td>203.0.113.0</td>
              <td>ether1-WAN</td>
              <td>Link Principal ISP Dedicado</td>
            </tr>
            <tr>
              <td>1</td>
              <td>192.168.10.1/24</td>
              <td>192.168.10.0</td>
              <td>bridge-lan</td>
              <td>Gateway LAN Corporativa</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (menu === 'ip_routes') {
      return `
        <table class="winbox-table">
          <thead>
            <tr>
              <th style="width:40px">Flags</th>
              <th>Dst. Address</th>
              <th>Gateway</th>
              <th>Distance</th>
              <th>Routing Table</th>
            </tr>
          </thead>
          <tbody>
            <tr class="selected">
              <td><span style="color:#4ade80">AS</span></td>
              <td>0.0.0.0/0</td>
              <td>203.0.113.1 (reachable)</td>
              <td>1</td>
              <td>main</td>
            </tr>
            <tr>
              <td><span style="color:#38bdf8">DAc</span></td>
              <td>192.168.10.0/24</td>
              <td>bridge-lan (reachable)</td>
              <td>0</td>
              <td>main</td>
            </tr>
            <tr>
              <td><span style="color:#38bdf8">DAc</span></td>
              <td>203.0.113.0/24</td>
              <td>ether1-WAN (reachable)</td>
              <td>0</td>
              <td>main</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (menu === 'ip_firewall') {
      return `
        <table class="winbox-table">
          <thead>
            <tr>
              <th style="width:30px">#</th>
              <th>Chain</th>
              <th>Action</th>
              <th>Src. Address</th>
              <th>Dst. Port</th>
              <th>Protocol</th>
              <th>Packets</th>
              <th>Bytes</th>
            </tr>
          </thead>
          <tbody>
            <tr class="selected">
              <td>0</td>
              <td>input</td>
              <td><span style="color:#4ade80">accept</span></td>
              <td>(any)</td>
              <td></td>
              <td></td>
              <td>142.920</td>
              <td>18.4 MB</td>
            </tr>
            <tr>
              <td>1</td>
              <td>input</td>
              <td><span style="color:#f87171">drop</span></td>
              <td>(any)</td>
              <td></td>
              <td></td>
              <td>3.810</td>
              <td>240 KB</td>
            </tr>
            <tr>
              <td>2</td>
              <td>forward</td>
              <td><span style="color:#4ade80">accept</span></td>
              <td>192.168.10.0/24</td>
              <td></td>
              <td></td>
              <td>849.201</td>
              <td>112 MB</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    return `
      <div style="padding: 24px; color: #94a3b8; font-size: 12px; text-align: center;">
        <p>Configurações ativas de <strong>${menu}</strong> carregadas no RouterOS.</p>
        <p style="margin-top: 8px; color: #64748b;">Utilize a barra de ferramentas para simular ações de bancada.</p>
      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      <div class="winbox-window">
        <!-- Titlebar -->
        <div class="winbox-titlebar">
          <div class="winbox-title">
            <div class="winbox-title-icon"></div>
            <span>${escapeHtml(identity)} (admin) - WinBox v3.40 on RB750Gr3 (mipsbe) [RouterOS v7.14]</span>
          </div>
          <div class="winbox-controls">
            <div class="winbox-btn-ctrl"></div>
            <div class="winbox-btn-ctrl"></div>
            <div class="winbox-btn-ctrl close"></div>
          </div>
        </div>

        <!-- Toolbar com Safe Mode -->
        <div class="winbox-toolbar">
          <button id="wb-safe-mode-btn" class="winbox-tool-btn safe-mode ${isSafeMode ? 'active' : ''}">
            <span>${isSafeMode ? '✓ Safe Mode (F4) ATIVO' : 'Safe Mode [F4]'}</span>
          </button>
          <div style="height:14px; width:1px; background:#263859;"></div>
          <span style="font-size:11px; color:#94a3b8; font-family:monospace;">CPU: 3% | RAM: 184.2 MiB | Uptime: 4d 12:44:10</span>
        </div>

        <!-- Body -->
        <div class="winbox-body">
          <div class="winbox-sidebar">
            ${menuItems.map(item => `
              <div class="winbox-menu-item ${item.id === currentMenu ? 'active' : ''}" data-menu="${item.id}">
                ${item.label}
              </div>
            `).join('')}
          </div>

          <div class="winbox-content">
            <div class="winbox-table-actions">
              <div class="winbox-action-icon add" title="Add item">+</div>
              <div class="winbox-action-icon remove" title="Remove item">-</div>
              <div class="winbox-action-icon enable" title="Enable">✓</div>
              <div class="winbox-action-icon disable" title="Disable">✗</div>
              <div class="winbox-action-icon" title="Comment">💬</div>
            </div>

            <div class="winbox-table-wrapper">
              ${getTableContent(currentMenu)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.winbox-menu-item').forEach(el => {
      el.addEventListener('click', () => {
        currentMenu = el.getAttribute('data-menu');
        render();
      });
    });

    const safeBtn = container.querySelector('#wb-safe-mode-btn');
    if (safeBtn) {
      safeBtn.addEventListener('click', () => {
        isSafeMode = !isSafeMode;
        render();
      });
    }
  }

  render();
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
