// COMPONENTE: DIAGRAMA DE TOPOLOGIA DE REDE INTERATIVO (SVG VETORIAL)
export function renderTopologyDiagram(containerId, topologyData) {
  const container = document.getElementById(containerId);
  if (!container || !topologyData) return;

  const { devices = [], nodes = [], links = [], title = 'Topologia de Rede' } = topologyData;
  const items = nodes.length > 0 ? nodes : devices;

  // Layout dinâmico de coordenadas
  const width = 640;
  const height = 240;
  const count = items.length;
  const spacing = count > 1 ? (width - 160) / (count - 1) : width / 2;

  const calculatedNodes = items.map((node, i) => {
    return {
      id: node.id || `node_${i}`,
      label: node.label || node.name || `Device ${i + 1}`,
      ip: node.ip || '',
      port: node.port || '',
      status: node.status || 'online',
      x: count > 1 ? 80 + i * spacing : width / 2,
      y: height / 2 + (i % 2 === 0 ? -15 : 15)
    };
  });

  // Gera linhas de enlace SVG
  let linesSvg = '';
  if (links.length > 0) {
    links.forEach(link => {
      const source = calculatedNodes.find(n => n.id === link.from) || calculatedNodes[0];
      const target = calculatedNodes.find(n => n.id === link.to) || calculatedNodes[1];
      if (source && target) {
        linesSvg += `
          <line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#1e293b" stroke-width="3" stroke-dasharray="4,4"/>
          <line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#0284c7" stroke-width="2" stroke-opacity="0.8">
            <animate attributeName="stroke-dashoffset" values="20;0" dur="1.5s" repeatCount="indefinite" />
          </line>
          <text x="${(source.x + target.x) / 2}" y="${(source.y + target.y) / 2 - 8}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle">${link.label || ''}</text>
        `;
      }
    });
  } else {
    // Enlace padrão linear sequencial
    for (let i = 0; i < calculatedNodes.length - 1; i++) {
      const s = calculatedNodes[i];
      const t = calculatedNodes[i + 1];
      linesSvg += `
        <line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#0284c7" stroke-width="2" stroke-opacity="0.8"/>
        <circle r="3" fill="#38bdf8">
          <animateMotion path="M ${s.x} ${s.y} L ${t.x} ${t.y}" dur="2s" repeatCount="indefinite" />
        </circle>
      `;
    }
  }

  // Gera nós SVG
  let nodesSvg = '';
  calculatedNodes.forEach(node => {
    const isError = node.status === 'offline' || node.status === 'error' || node.status === 'isolated';
    const isDegraded = node.status === 'warning' || node.status === 'degraded' || node.status === 'handshake_failed';
    const statusColor = isError ? '#ef4444' : (isDegraded ? '#f59e0b' : '#10b981');

    nodesSvg += `
      <g class="topology-node" style="cursor: pointer;" transform="translate(${node.x}, ${node.y})">
        <rect x="-42" y="-32" width="84" height="64" rx="6" fill="#0d1424" stroke="#263859" stroke-width="1.5" />
        <circle cx="30" cy="-20" r="4" fill="${statusColor}">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Ícone Router/Switch -->
        <path d="M-12 -12 L12 -12 L12 0 L-12 0 Z" fill="#0284c7" opacity="0.3"/>
        <line x1="-12" y1="-6" x2="12" y2="-6" stroke="#38bdf8" stroke-width="1.5"/>
        <circle cx="-6" cy="-6" r="1.5" fill="#ffffff"/>
        <circle cx="6" cy="-6" r="1.5" fill="#ffffff"/>

        <text x="0" y="14" fill="#f8fafc" font-size="10" font-weight="600" font-family="sans-serif" text-anchor="middle">${escapeXml(node.label)}</text>
        <text x="0" y="26" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">${escapeXml(node.ip || node.port || '')}</text>
      </g>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-size:12px; font-weight:600; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px;">${escapeXml(title)}</span>
      <span style="font-size:11px; color:#64748b; font-family:monospace;">SVG L2/L3 Topo Engine</span>
    </div>
    <svg class="topology-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="topo-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#topo-glow)" />
      ${linesSvg}
      ${nodesSvg}
    </svg>
  `;
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
