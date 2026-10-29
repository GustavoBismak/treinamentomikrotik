// DEFINIÇÃO DOS 15 MÓDULOS E 15 COMPETÊNCIAS DA ACADEMIA TÉCNICA MIKROTIK

export const modulesData = [
  {
    id: 'm1',
    module_number: 1,
    title: 'Módulo 1 — Fundamentos de Redes',
    description: 'Modelos OSI e TCP/IP, endereçamento IPv4/IPv6, cálculo CIDR, máscaras, gateways, portas TCP/UDP, MTU/MSS e interpretação de topologias.',
    level: 'Iniciante',
    duration_hours: 8,
    icon: 'network',
    competency_key: 'fundamentos_rede',
    published: 1
  },
  {
    id: 'm2',
    module_number: 2,
    title: 'Módulo 2 — Conhecendo os Equipamentos MikroTik',
    description: 'Hardware RouterBOARD vs RouterOS, arquitetura de processamento, modelos de mercado (hEX, RB4011, CCR), licenciamento e RouterOS v6 vs v7.',
    level: 'Iniciante',
    duration_hours: 6,
    icon: 'cpu',
    competency_key: 'hardware_routerboard',
    published: 1
  },
  {
    id: 'm3',
    module_number: 3,
    title: 'Módulo 3 — Primeiro Acesso e Configuração Inicial',
    description: 'Conexão física, WinBox (MAC vs IP), default config, backup binário vs export script (.rsc), atualização de firmware RouterBOARD, Safe Mode e hardening de serviços.',
    level: 'Iniciante',
    duration_hours: 8,
    icon: 'terminal',
    competency_key: 'acesso_seguro',
    published: 1
  },
  {
    id: 'm4',
    module_number: 4,
    title: 'Módulo 4 — Interfaces, Bridge e Endereçamento',
    description: 'Interfaces Ethernet, criação de bridges L2, comutação com RSTP anti-loop, endereçamento IP, ARP e tabela de vizinhos (MNDP/LLDP).',
    level: 'Intermediário',
    duration_hours: 8,
    icon: 'layers',
    competency_key: 'bridge_enderecamento',
    published: 1
  },
  {
    id: 'm5',
    module_number: 5,
    title: 'Módulo 5 — DHCP, DNS e Serviços Básicos',
    description: 'Configuração de DHCP Server, Pools de IP, Leases estáticos por MAC, Gateway/DNS para clientes, DNS cache com remote requests e diagnóstico de conectividade.',
    level: 'Intermediário',
    duration_hours: 8,
    icon: 'server',
    competency_key: 'dhcp_dns_servicos',
    published: 1
  },
  {
    id: 'm6',
    module_number: 6,
    title: 'Módulo 6 — Internet, Rotas e NAT',
    description: 'WAN DHCP Client, IP estático, PPPoE Client, rota default 0.0.0.0/0, distância administrativa, failover de links com check-gateway, NAT masquerade e port forwarding seguro.',
    level: 'Intermediário',
    duration_hours: 10,
    icon: 'globe',
    competency_key: 'roteamento_nat',
    published: 1
  },
  {
    id: 'm7',
    module_number: 7,
    title: 'Módulo 7 — Firewall e Segurança',
    description: 'Cadeias input, forward e output, connection tracking (established, related, invalid, new), address-lists, proteção contra ataques de força bruta e regras de contenção.',
    level: 'Intermediário',
    duration_hours: 12,
    icon: 'shield',
    competency_key: 'firewall_defesa',
    published: 1
  },
  {
    id: 'm8',
    module_number: 8,
    title: 'Módulo 8 — VLANs e Segmentação de Empresas',
    description: 'Padrão 802.1Q, Bridge VLAN Filtering moderno do RouterOS v7, portas tagged/untagged, PVID, interfaces VLAN L3, DHCP por VLAN e isolamento seguro entre setores.',
    level: 'Avançado',
    duration_hours: 12,
    icon: 'git-commit',
    competency_key: 'vlans_segmentacao',
    published: 1
  },
  {
    id: 'm9',
    module_number: 9,
    title: 'Módulo 9 — Wi-Fi Corporativo',
    description: 'Frequências 2.4 GHz e 5 GHz, canais sem sobreposição, largura de canal, potências, WPA2/WPA3, SSIDs corporativo e visitante em VLAN, WifiWave2 no RouterOS v7.',
    level: 'Intermediário',
    duration_hours: 8,
    icon: 'wifi',
    competency_key: 'wifi_corporativo',
    published: 1
  },
  {
    id: 'm10',
    module_number: 10,
    title: 'Módulo 10 — VPN e Acesso Remoto Seguro',
    description: 'WireGuard moderno no RouterOS v7, chaves públicas/privadas, peers, portas UDP 51820, túneis site-to-site matriz/filial, IPsec IKEv2 e políticas de firewall.',
    level: 'Avançado',
    duration_hours: 10,
    icon: 'lock',
    competency_key: 'vpn_wireguard_ipsec',
    published: 1
  },
  {
    id: 'm11',
    module_number: 11,
    title: 'Módulo 11 — Controle de Banda e Qualidade de Serviço (QoS)',
    description: 'Simple Queues, Queue Tree com Mangle, PCQ para divisão justa de banda, controle de bufferbloat, latência e interação com FastTrack.',
    level: 'Avançado',
    duration_hours: 8,
    icon: 'bar-chart',
    competency_key: 'qos_controle_banda',
    published: 1
  },
  {
    id: 'm12',
    module_number: 12,
    title: 'Módulo 12 — Monitoramento e Troubleshooting',
    description: 'Torch em tempo real, Packet Sniffer, Tool Profile (análise de CPU 100%), Logs do sistema, MTU/MSS clamping e Metodologia Padronizada ISP de Diagnóstico de Causa Raiz.',
    level: 'Avançado',
    duration_hours: 10,
    icon: 'activity',
    competency_key: 'troubleshooting_isp',
    published: 1
  },
  {
    id: 'm13',
    module_number: 13,
    title: 'Módulo 13 — Instalação de MikroTik em Empresas',
    description: 'As 5 etapas completas: levantamento técnico, planejamento, instalação física/rack, configuração segura e testes de homologação. Estudo de 3 projetos práticos reais.',
    level: 'Avançado',
    duration_hours: 14,
    icon: 'briefcase',
    competency_key: 'projetos_empresas',
    published: 1
  },
  {
    id: 'm14',
    module_number: 14,
    title: 'Módulo 14 — Recursos Avançados',
    description: 'OSPF v2/v3 para anéis de distribuição, BGP básico para trânsito ISP e ASN, VRRP para redundância de gateway ativo/backup, Scripts e Netwatch.',
    level: 'Avançado',
    duration_hours: 12,
    icon: 'zap',
    competency_key: 'recursos_avancados',
    published: 1
  },
  {
    id: 'm15',
    module_number: 15,
    title: 'Módulo 15 — Padrões Operacionais da Equipe Técnica',
    description: '11 Procedimentos Operacionais Padrão (POPs): novo roteador, troca em campo, alteração de VLAN, firewall seguro, atualização RouterOS e relatório pós-incidente.',
    level: 'Avançado',
    duration_hours: 10,
    icon: 'file-text',
    competency_key: 'padroes_operacionais',
    published: 1
  }
];

export const competenciesData = [
  { key: 'fundamentos_rede', name: 'Fundamentos de Redes e Protocolos', category: 'Base', description: 'Capacidade de calcular sub-redes CIDR, analisar portas TCP/UDP e interpretar modelos OSI/TCP-IP.' },
  { key: 'hardware_routerboard', name: 'Hardware RouterBOARD & RouterOS', category: 'Equipamentos', description: 'Critérios de escolha de hardware, arquitetura MIPS/ARM, licenciamento e versões RouterOS v6/v7.' },
  { key: 'acesso_seguro', name: 'Primeiro Acesso e Hardening Básico', category: 'Segurança', description: 'WinBox MAC/IP, atualização firmware, desativação de serviços inseguros e Safe Mode.' },
  { key: 'bridge_enderecamento', name: 'Interfaces, Bridge e Endereçamento IP', category: 'Redes L2/L3', description: 'Criação de bridges, comutação L2 sem loop (RSTP), ARP e configuração de IPs.' },
  { key: 'dhcp_dns_servicos', name: 'DHCP Server, Leases e DNS Cache', category: 'Serviços de Rede', description: 'Pools de endereços, leases estáticos por MAC, resolução DNS e diagnóstico de clientes sem IP.' },
  { key: 'roteamento_nat', name: 'Internet WAN, Rotas e NAT Masquerade', category: 'Roteamento & WAN', description: 'PPPoE Client, rotas default, métrica de failover, srcnat masquerade e port forwarding.' },
  { key: 'firewall_defesa', name: 'Firewall RouterOS e Proteção Ativa', category: 'Segurança', description: 'Cadeias input/forward, connection tracking, address-lists, defesa contra brute-force e isolamento.' },
  { key: 'vlans_segmentacao', name: 'VLANs Corporativas e Bridge VLAN Filtering', category: 'Segmentação L2', description: 'Padronização 802.1Q no RouterOS v7, tagged/untagged, PVID e roteamento inter-VLAN.' },
  { key: 'wifi_corporativo', name: 'Wi-Fi Corporativo e WifiWave2', category: 'Wireless', description: 'Canais 2.4/5GHz, potências, WPA2/WPA3, SSIDs corporativo e visitante isolado em VLAN.' },
  { key: 'vpn_wireguard_ipsec', name: 'VPNs Corporativas e Acesso Remoto', category: 'Conectividade Segura', description: 'Túneis WireGuard modernos, chaves públicas/privadas, peers, IPsec e rotas matriz-filial.' },
  { key: 'qos_controle_banda', name: 'QoS, Simple Queues e PCQ', category: 'Qualidade de Serviço', description: 'Limitação por IP, bandas dinâmicas PCQ, prevenção de bufferbloat e FastTrack.' },
  { key: 'troubleshooting_isp', name: 'Monitoramento Avançado e Troubleshooting ISP', category: 'Operações', description: 'Torch em tempo real, Packet Sniffer, Tool Profile, Logs e Metodologia Hipótese-Validação.' },
  { key: 'projetos_empresas', name: 'Instalação e Homologação Corporativa', category: 'Engenharia de Campo', description: 'Execução dos 5 estágios: levantamento, dimensionamento, rack físico, configuração e entrega.' },
  { key: 'recursos_avancados', name: 'Roteamento Dinâmico (OSPF/BGP) e VRRP', category: 'Avançado', description: 'Roteamento interno OSPF, anúncios BGP introdutórios, VRRP alta disponibilidade e scripts.' },
  { key: 'padroes_operacionais', name: 'POPs Técnicos e Procedimentos Operacionais', category: 'Governança', description: 'Execução de POPs de troca, contingência, upgrade de firmware e elaboração de relatório de causa raiz.' }
];
