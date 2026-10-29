// BANCO DE LABORATÓRIOS PRÁTICOS DE TROUBLESHOOTING ROUTEROS V7

export const labsData = [
  {
    id: 'lab1',
    module_id: 'm6',
    title: 'Cenário 01: Roteador e Clientes sem Acesso à Internet após Troca de Operadora',
    difficulty: 'Básico',
    scenario_type: 'routing_outage',
    description: 'Um provedor realizou a migração de um link corporativo dedicado para um novo bloco de IP fixo. O técnico configurou o novo endereço IP público na interface ether1, mas nem o roteador nem os computadores da empresa conseguem acessar nenhum endereço na internet.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'isp', label: 'Operadora ISP Gateway', ip: '198.51.100.1/30', status: 'online' },
        { id: 'rtr', label: 'MikroTik RB750Gr3 (ether1)', ip: '198.51.100.2/30', status: 'degraded' },
        { id: 'lan', label: 'Rede Local Empresa (bridge-lan)', ip: '192.168.1.1/24', status: 'isolated' }
      ],
      links: [
        { from: 'isp', to: 'rtr', label: 'ether1 (WAN)' },
        { from: 'rtr', to: 'lan', label: 'bridge-lan (LAN)' }
      ]
    }),
    initial_config: `/interface bridge add name=bridge-lan
/interface bridge port add bridge=bridge-lan interface=ether2
/ip address add address=198.51.100.2/30 interface=ether1 comment="Link Dedicado WAN"
/ip address add address=192.168.1.1/24 interface=bridge-lan comment="LAN"
/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade
/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes
# Observe a tabela de rotas existente:
/ip route print
Flags: D - DYNAMIC; A - ACTIVE; c - CONNECT
Columns: DST-ADDRESS, GATEWAY, DISTANCE
0  DAc  192.168.1.0/24    bridge-lan  0
1  DAc  198.51.100.0/30   ether1      0`,
    symptoms: '1. O técnico tenta pingar 1.1.1.1 a partir do terminal do roteador e recebe o erro "no route to host".\n2. Clientes na rede interna recebem IP via DHCP normalmente, mas nenhum site carrega no navegador.\n3. O ping do terminal para o gateway da operadora (198.51.100.1) responde normalmente em 1ms.',
    evidence_json: JSON.stringify([
      { tool: 'Ping 198.51.100.1', output: 'SENT: 198.51.100.1 | STATUS: 4 packets transmitted, 4 received, 0% packet loss, avg RTT 1.2ms' },
      { tool: 'Ping 1.1.1.1', output: 'SENT: 1.1.1.1 | ERROR: no route to host' },
      { tool: 'Route List Inspection', output: 'Nenhuma rota estática com destino 0.0.0.0/0 foi encontrada. Apenas rotas conectadas (DAc) existem.' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: O roteador consegue conversar com o IP do gateway imediato da operadora, mas não sabe para onde encaminhar pacotes destinados à internet global.',
      'Dica 2: Qual a sintaxe do comando no RouterOS para adicionar uma rota padrão com destino a qualquer rede via o gateway do provedor?'
    ]),
    expected_solution: '/ip route add dst-address=0.0.0.0/0 gateway=198.51.100.1',
    root_cause_explanation: 'A ausência da Rota Padrão (Default Route 0.0.0.0/0). Embora o IP estático estivesse configurado na interface ether1 e a tradução NAT estivesse ativa, o roteador não possuía uma instrução na tabela de roteamento indicando que qualquer pacote fora de sua rede local conectada deveria ser encaminhado para o gateway 198.51.100.1.'
  },
  {
    id: 'lab2',
    module_id: 'm6',
    title: 'Cenário 02: Roteador Acessa a Internet, mas Usuários da Rede Local Não Navegam',
    difficulty: 'Intermediário',
    scenario_type: 'nat_missing',
    description: 'Após uma manutenção de rotina na tabela de firewall, os técnicos do suporte relatam que o roteador MikroTik responde perfeitamente a pings para 1.1.1.1 e 8.8.8.8 em seu terminal, mas nenhuma estação de trabalho dos colaboradores navega ou estabelece conexões externas.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'isp', label: 'Internet Global', ip: '0.0.0.0/0', status: 'online' },
        { id: 'rtr', label: 'MikroTik Gateway', ip: '200.180.50.2/29', status: 'online' },
        { id: 'lan', label: 'Estações Corporativas', ip: '10.0.0.0/24', status: 'offline' }
      ],
      links: [
        { from: 'isp', to: 'rtr', label: 'WAN ether1' },
        { from: 'rtr', to: 'lan', label: 'LAN bridge' }
      ]
    }),
    initial_config: `/ip address add address=200.180.50.2/29 interface=ether1
/ip address add address=10.0.0.1/24 interface=bridge-lan
/ip route add dst-address=0.0.0.0/0 gateway=200.180.50.1
/ip firewall nat print
Flags: X - disabled, I - invalid, D - dynamic
# Nenhuma regra de NAT configurada!`,
    symptoms: '1. Ping 8.8.8.8 direto do MikroTik: 100% sucesso (RTT 3ms).\n2. Ping 8.8.8.8 do computador 10.0.0.50: Request timed out.\n3. Ping do computador para o gateway 10.0.0.1: Responde em <1ms.',
    evidence_json: JSON.stringify([
      { tool: 'Torch ether1', output: 'SRC: 10.0.0.50 | DST: 8.8.8.8 | PROTO: ICMP | TX: 64bps | RX: 0bps (Pacote saindo com IP privado na internet pública)' },
      { tool: 'NAT Rule Count', output: 'Regras encontradas na chain srcnat: 0' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: IPs privados da RFC 1918 (10.0.0.0/24) não são roteáveis na internet pública e são descartados pelas operadoras.',
      'Dica 2: É necessário traduzir o endereço de origem dos pacotes saindo pela WAN ether1 utilizando a ação masquerade.'
    ]),
    expected_solution: '/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade',
    root_cause_explanation: 'Ausência da regra de Source NAT (Masquerade). Sem a regra de masquerade na interface WAN, o MikroTik encaminhava os pacotes dos computadores com seus endereços IPs privados de origem (10.0.0.x) direto para a internet. Os roteadores de trânsito descartam esses pacotes por violação da RFC 1918.'
  },
  {
    id: 'lab3',
    module_id: 'm5',
    title: 'Cenário 03: Computadores Recebem IP mas Não Navegam por Falha de DNS',
    difficulty: 'Básico',
    scenario_type: 'dns_issue',
    description: 'Após a instalação de um novo escritório, os colaboradores relatam que o aplicativo de VoIP e o comando `ping 1.1.1.1` funcionam normalmente, mas nenhum navegador consegue abrir nenhum site (google.com, globo.com, etc.), exibindo a mensagem DNS_PROBE_FINISHED_BAD_CONFIG.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'dns_ext', label: 'Cloudflare DNS', ip: '1.1.1.1', status: 'online' },
        { id: 'rtr', label: 'MikroTik DNS Cache', ip: '192.168.15.1', status: 'online' },
        { id: 'pcs', label: 'PCs Clientes', ip: '192.168.15.0/24', status: 'degraded' }
      ],
      links: [
        { from: 'dns_ext', to: 'rtr', label: 'Internet WAN' },
        { from: 'rtr', to: 'pcs', label: 'DHCP LAN' }
      ]
    }),
    initial_config: `/ip pool add name=dhcp-pool ranges=192.168.15.10-192.168.15.100
/ip dhcp-server add name=dhcp1 interface=bridge-lan address-pool=dhcp-pool disabled=no
/ip dhcp-server network add address=192.168.15.0/24 gateway=192.168.15.1 dns-server=192.168.15.1
/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=no`,
    symptoms: '1. `nslookup google.com` nos computadores clientes retorna "DNS request timed out".\n2. No MikroTik, a resolução de nomes via terminal funciona: `/ping google.com` responde.\n3. O parâmetro allow-remote-requests do DNS do RouterOS está desmarcado.',
    evidence_json: JSON.stringify([
      { tool: 'DNS Configuration Print', output: 'servers: 1.1.1.1,8.8.8.8 | allow-remote-requests: no | cache-size: 2048KiB' },
      { tool: 'Port 53 UDP Sniffer', output: 'IN: 192.168.15.50:53421 -> 192.168.15.1:53 (UDP) | STATUS: Connection refused / Port unreachable' }
    ]),
    hints_json: JSON.stringify([
      'Dica: O DHCP entrega o próprio MikroTik (192.168.15.1) como servidor de DNS para as máquinas locais.',
      'Dica: O RouterOS possui um parâmetro de segurança que precisa ser habilitado para responder consultas DNS de clientes.'
    ]),
    expected_solution: '/ip dns set allow-remote-requests=yes',
    root_cause_explanation: 'O parâmetro allow-remote-requests estava configurado como "no". Como as estações da rede local foram instruídas pelo DHCP a consultar o IP do roteador (192.168.15.1) para resolução de nomes, o MikroTik rejeitava todas as requisições UDP na porta 53 vindas da rede interna.'
  },
  {
    id: 'lab4',
    module_id: 'm8',
    title: 'Cenário 04: Câmeras de Segurança sem Comunicação após Implementação de VLANs',
    difficulty: 'Avançado',
    scenario_type: 'vlan_filtering',
    description: 'Um técnico implantou segmentação de VLANs corporativas no switch MikroTik CRS328 utilizando o recurso de Bridge VLAN Filtering. Após ativar o filtro, a VLAN 50 (Câmeras IP conectadas nas portas ether5 e ether6) perdeu completamente o acesso ao gravador NVR.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'nvr', label: 'NVR Servidor', ip: '172.16.50.10/24 (VLAN 50)', status: 'online' },
        { id: 'crs', label: 'MikroTik CRS328', ip: '172.16.50.1/24', status: 'warning' },
        { id: 'cam1', label: 'Câmera Portão (ether5)', ip: '172.16.50.51', status: 'offline' }
      ],
      links: [
        { from: 'crs', to: 'cam1', label: 'ether5 (Untagged PVID 1)' }
      ]
    }),
    initial_config: `/interface bridge add name=bridge1 vlan-filtering=yes
/interface bridge port add bridge=bridge1 interface=ether5 pvid=1
/interface bridge port add bridge=bridge1 interface=ether6 pvid=1
/interface bridge vlan add bridge=bridge1 tagged=bridge1 untagged=ether5,ether6 vlan-ids=50`,
    symptoms: '1. Câmeras conectadas em ether5 e ether6 não recebem IP e não respondem a ping.\n2. Na tabela de bridge ports, o PVID das portas ether5 e ether6 permanece com valor 1 (default).',
    evidence_json: JSON.stringify([
      { tool: 'Bridge Port Print', output: 'ether5 -> bridge: bridge1, pvid: 1 | ether6 -> bridge: bridge1, pvid: 1' },
      { tool: 'Bridge VLAN Print', output: 'vlan-ids: 50 -> tagged: bridge1, untagged: ether5,ether6' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: Em portas de acesso (onde equipamentos finais enviam quadros sem tag 802.1Q), a porta precisa ter o PVID configurado para a VLAN de destino.',
      'Dica 2: Ajuste o PVID das portas ether5 e ether6 para 50.'
    ]),
    expected_solution: '/interface bridge port set [find interface=ether5] pvid=50; /interface bridge port set [find interface=ether6] pvid=50',
    root_cause_explanation: 'Incompatibilidade de PVID nas portas de acesso da Bridge. Embora a VLAN 50 estivesse associada às portas na tabela `/interface bridge vlan`, as portas físicas mantinham o PVID 1. Ao receber pacotes sem tag das câmeras, o MikroTik os classificava na VLAN 1 em vez da VLAN 50.'
  },
  {
    id: 'lab5',
    module_id: 'm7',
    title: 'Cenário 05: Bloqueio Total de Acesso ao WinBox após Regra de Firewall Mal Posicionada',
    difficulty: 'Intermediário',
    scenario_type: 'firewall_lockout',
    description: 'Durante uma tentativa de fechar acessos externos, um técnico criou uma regra de drop no topo da chain input para descartar conexões suspeitas, mas esqueceu de aceitar previamente as conexões estabelecidas e relacionadas (established,related). O WinBox desconectou imediatamente e ninguém consegue acessar o roteador.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'admin', label: 'Notebook do NOC', ip: '192.168.88.254', status: 'blocked' },
        { id: 'rtr', label: 'MikroTik RB4011', ip: '192.168.88.1', status: 'locked' }
      ],
      links: [
        { from: 'admin', to: 'rtr', label: 'Porta ether2 (Bloqueada pelo drop)' }
      ]
    }),
    initial_config: `/ip firewall filter add chain=input action=drop comment="Drop All"
/ip firewall filter add chain=input connection-state=established,related action=accept
/ip firewall filter add chain=input dst-port=8291 protocol=tcp action=accept`,
    symptoms: '1. WinBox desconecta e informa "Could not connect to 192.168.88.1".\n2. Regra 0 (ação drop) captura todo o tráfego antes que as regras de accept possam ser avaliadas.',
    evidence_json: JSON.stringify([
      { tool: 'Firewall Chain Input Order', output: '0: chain=input action=drop (Packets: 1542, Bytes: 98KB) -> Nenhuma regra abaixo é avaliada!' }
    ]),
    hints_json: JSON.stringify([
      'Dica: As regras de firewall no RouterOS são processadas sequencialmente de cima para baixo (top-down).',
      'Dica: A regra de drop incondicional nunca pode ficar no índice 0.'
    ]),
    expected_solution: '/ip firewall filter move [find comment="Drop All"] 2',
    root_cause_explanation: 'Processamento Sequencial Top-Down do Firewall. A regra `action=drop` sem condições foi inserida na posição 0. Todo pacote direcionado ao roteador (inclusive pacotes legítimos do WinBox) correspondia à regra 0 e era descartado antes de chegar às regras permissivas.'
  },
  {
    id: 'lab6',
    module_id: 'm10',
    title: 'Cenário 06: Túnel VPN WireGuard Estabelecido mas sem Tráfego entre Sub-redes',
    difficulty: 'Avançado',
    scenario_type: 'vpn_routing',
    description: 'Um túnel WireGuard foi configurado para interligar a Matriz (192.168.10.0/24) à Filial (192.168.20.0/24). O handshake do WireGuard acontece com sucesso a cada 2 minutos, porém nenhum computador da Matriz consegue pingar nenhuma máquina da Filial.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'matriz', label: 'MikroTik Matriz', ip: '10.255.0.1 (WG)', status: 'online' },
        { id: 'filial', label: 'MikroTik Filial', ip: '10.255.0.2 (WG)', status: 'online' }
      ],
      links: [
        { from: 'matriz', to: 'filial', label: 'Túnel WireGuard UDP 51820' }
      ]
    }),
    initial_config: `/interface wireguard add name=wg0 listen-port=51820
/interface wireguard peers add interface=wg0 public-key="abc..." allowed-address=10.255.0.2/32
# Falta rota estática para a sub-rede remota 192.168.20.0/24!`,
    symptoms: '1. Handshake ativo no menu WireGuard Peers: "latest handshake: 14s ago".\n2. Ping do IP 10.255.0.1 para 10.255.0.2 responde com sucesso.\n3. Ping do PC Matriz (192.168.10.15) para o PC Filial (192.168.20.15) dá "Host destination unreachable".',
    evidence_json: JSON.stringify([
      { tool: 'Allowed-Address Peer Print', output: 'allowed-address: 10.255.0.2/32 (Falta a sub-rede 192.168.20.0/24 nos dois lados)' },
      { tool: 'Route Table Matriz', output: 'Nenhuma rota encontrada para 192.168.20.0/24 apontando para wg0' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: O WireGuard no RouterOS exige que as sub-redes permitidas sejam especificadas no campo allowed-address do peer.',
      'Dica 2: O roteador precisa de uma rota estática para encaminhar o tráfego da sub-rede remota pela interface wg0.'
    ]),
    expected_solution: '/interface wireguard peers set [find interface=wg0] allowed-address=10.255.0.2/32,192.168.20.0/24; /ip route add dst-address=192.168.20.0/24 gateway=wg0',
    root_cause_explanation: 'Cryptokey Routing e Falha de Roteamento Estático no WireGuard. O WireGuard descarta silenciosamente qualquer pacote cuja rede de destino não esteja declarada explicitamente no campo `allowed-address` do peer. Além disso, sem uma rota estática na tabela de rotas (`/ip route`), o roteador enviava os pacotes para o gateway default da internet em vez da interface virtual wg0.'
  }
];
