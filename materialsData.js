// BANCO DE MATERIAIS DE APOIO, PROCEDIMENTOS OPERACIONAIS PADRÃO (POPs) E REFERÊNCIA TÉCNICA
export const materialsData = {
  version: '1.0.0',
  last_updated: '2026-10-29',
  
  // 11 Procedimentos Operacionais Padrão (POPs) Corporativos
  pops: [
    {
      id: 'pop-01',
      code: 'POP-ISP-01',
      title: 'Primeiro Acesso, Hardening e Desativação de Serviços Inseguros',
      category: 'Segurança & Instalação',
      routeros_version: 'v7.12+',
      severity: 'Crítico',
      objective: 'Eliminar vetores de ataque em roteadores recém-retirados da caixa antes da conexão à rede pública.',
      checklist: [
        'Conectar exclusivamente via cabo direto na porta ether2 em bancada isolada',
        'Acessar via WinBox utilizando endereço MAC com Safe Mode (F4) ativado',
        'Remover a senha em branco padrão e definir credencial forte (mínimo 12 caracteres)',
        'Desativar serviços inseguros: telnet, ftp, www, api, api-ssl (manter apenas winbox e ssh)',
        'Restringir a porta SSH e WinBox para as sub-redes da gerência/NOC',
        'Desativar MNDP / MAC-Telnet / MAC-WinBox em interfaces públicas WAN'
      ],
      commands: `/system identity set name="RTR-BANCADA-01"
/user add name="noc.admin" group=full password="SenhaSeguraISP@2026#"
/user remove admin

# Desativação de portas inseguras
/ip service disable telnet,ftp,www,api,api-ssl
/ip service set winbox port=8291 address=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
/ip service set ssh port=2222 address=10.0.0.0/8,192.168.0.0/16

# Bloqueio de MAC Server na WAN
/tool mac-server set allowed-interface-list=LAN
/tool mac-server mac-winbox set allowed-interface-list=LAN
/ip neighbor discovery-settings set discover-interface-list=LAN`,
      verification: '/ip service print\n/tool mac-server print\n/tool mac-server mac-winbox print'
    },
    {
      id: 'pop-02',
      code: 'POP-ISP-02',
      title: 'Substituição Emergencial de Roteador em Campo (Disaster Recovery)',
      category: 'Operações de Campo',
      routeros_version: 'v6 / v7',
      severity: 'Crítico',
      objective: 'Restabelecer o cliente corporativo em menos de 15 minutos utilizando backup em script limpo (.rsc).',
      checklist: [
        'Nunca restaurar arquivo .backup de modelos diferentes (gera conflito de MAC e interfaces)',
        'Localizar o arquivo de exportação de configuração limpa (.rsc) no servidor de backup do NOC',
        'Conectar à nova RouterBOARD, atualizar RouterOS para versão homologada e resetar sem default config',
        'Abrir o script .rsc em editor e revisar interfaces físicas (ex: ether1 WAN, ether2-ether5 LAN)',
        'Importar via terminal: /import file-name=cliente_config.rsc verbose=yes',
        'Testar conectividade, gateway e validar leases DHCP'
      ],
      commands: `# No roteador novo em bancada antes de levar a campo:
/system reset-configuration no-defaults=yes skip-backup=yes

# Após reinicializar:
/file upload ... (enviar cliente.rsc)
/import file-name=cliente.rsc verbose=yes`,
      verification: '/interface print\n/ip address print\n/ip route print\n/ping 8.8.8.8 count=4'
    },
    {
      id: 'pop-03',
      code: 'POP-ISP-03',
      title: 'Criação de VLANs e Segmentação L2 com Bridge VLAN Filtering',
      category: 'Redes Locais & VLANs',
      routeros_version: 'v7 (Obrigatório)',
      severity: 'Alto',
      objective: 'Segmentar redes corporativas, servidores, CFTV e visitantes com aceleração por hardware (HW Offloading).',
      checklist: [
        'Criar uma única bridge central (ex: bridge-lan) com vlan-filtering=no durante a configuração',
        'Criar as interfaces virtuais de VLAN vinculadas à bridge-lan para roteamento L3',
        'Atribuir endereços IP, DHCP Servers e Pools para cada interface de VLAN',
        'Configurar /interface bridge vlan definindo portas tagged (trunks) e untagged (access)',
        'Definir o PVID correspondente nas portas de acesso em /interface bridge port',
        'Ativar Safe Mode (F4) antes de ligar o vlan-filtering=yes na bridge'
      ],
      commands: `/interface bridge add name=bridge-lan vlan-filtering=no

# Criação das interfaces L3
/interface vlan add name=vlan10-adm vlan-id=10 interface=bridge-lan
/interface vlan add name=vlan20-cftv vlan-id=20 interface=bridge-lan
/interface vlan add name=vlan30-guest vlan-id=30 interface=bridge-lan

# Atribuição de portas
/interface bridge port add bridge=bridge-lan interface=ether2 pvid=10
/interface bridge port add bridge=bridge-lan interface=ether3 pvid=20
/interface bridge port add bridge=bridge-lan interface=sfp-sfpplus1

# Configuração da tabela 802.1Q
/interface bridge vlan add bridge=bridge-lan vlan-ids=10 tagged=bridge-lan,sfp-sfpplus1 untagged=ether2
/interface bridge vlan add bridge=bridge-lan vlan-ids=20 tagged=bridge-lan,sfp-sfpplus1 untagged=ether3
/interface bridge vlan add bridge=bridge-lan vlan-ids=30 tagged=bridge-lan,sfp-sfpplus1

# ATIVAÇÃO FINAL
/interface bridge set bridge-lan vlan-filtering=yes`,
      verification: '/interface bridge vlan print\n/interface bridge port monitor [find] once'
    },
    {
      id: 'pop-04',
      code: 'POP-ISP-04',
      title: 'Configuração de WAN PPPoE e Redundância Multi-WAN com Failover Automático',
      category: 'Roteamento & WAN',
      routeros_version: 'v7.x',
      severity: 'Alto',
      objective: 'Garantir disponibilidade contínua com link principal e backup utilizando check-gateway e distâncias administrativas.',
      checklist: [
        'Configurar interface PPPoE client na WAN1 com user/senha e max-mtu=1492 / max-mru=1492',
        'Criar regra de TCP MSS Clamping para pacotes TCP com MTU 1492 (MSS 1452)',
        'Configurar IP fixo ou DHCP client na WAN2 (Backup) desmarcando add-default-route',
        'Cadastrar rota default da WAN1 com distância 1 e check-gateway=ping',
        'Cadastrar rota default da WAN2 com distância 2',
        'Testar chaveamento desconectando o cabo da WAN1'
      ],
      commands: `/interface pppoe-client add name=pppoe-wan1 interface=ether1 user="cliente@provedor.com.br" password="SenhaPPPoE2026" add-default-route=no max-mtu=1492 max-mru=1492 disabled=no

# MSS Clamping para PPPoE
/ip firewall mangle add chain=forward protocol=tcp tcp-flags=syn action=change-mss new-mss=clamp-to-pmtu passthrough=yes out-interface=pppoe-wan1

# Rotas com Failover e Check-Gateway
/ip route add dst-address=0.0.0.0/0 gateway=pppoe-wan1 distance=1 check-gateway=ping comment="WAN1-Principal-Fibra"
/ip route add dst-address=0.0.0.0/0 gateway=192.168.15.1 distance=2 comment="WAN2-Backup-Radio"

# NAT Masquerade para ambas as saídas
/ip firewall nat add chain=srcnat out-interface=pppoe-wan1 action=masquerade comment="NAT WAN1"
/ip firewall nat add chain=srcnat out-interface=ether2-wan2 action=masquerade comment="NAT WAN2"`,
      verification: '/ip route print detail where dst-address="0.0.0.0/0"\n/ping 1.1.1.1 count=4'
    },
    {
      id: 'pop-05',
      code: 'POP-ISP-05',
      title: 'Ativação de Túnel WireGuard Seguro Site-to-Site no RouterOS v7',
      category: 'VPN & Conectividade',
      routeros_version: 'v7.x',
      severity: 'Alto',
      objective: 'Interligar matriz e filiais de empresas com WireGuard criptografado de alta performance.',
      checklist: [
        'Criar a interface WireGuard definindo a porta de escuta (padrão UDP 51820)',
        'Copiar a chave pública gerada automaticamente pelo kernel',
        'Cadastrar o IP de transporte ponto a ponto na interface WireGuard (ex: 10.255.255.1/30)',
        'Cadastrar o Peer remoto com a chave pública dele e allowed-address da sub-rede remota',
        'Adicionar rota estática para a sub-rede da filial apontando para a interface wireguard1',
        'Liberar tráfego UDP 51820 no firewall input na WAN'
      ],
      commands: `# Na Matriz:
/interface wireguard add name=wg-matriz listen-port=51820
/ip address add address=10.255.255.1/30 interface=wg-matriz

# Adicionar Peer da Filial
/interface wireguard peers add interface=wg-matriz public-key="CHAVE_PUBLICA_DA_FILIAL==" allowed-address=10.255.255.2/32,192.168.20.0/24 endpoint-address=203.0.113.10 endpoint-port=51820 persistent-keepalive=25s

# Rota para a rede interna da Filial
/ip route add dst-address=192.168.20.0/24 gateway=wg-matriz

# Firewall Input
/ip firewall filter add chain=input protocol=udp dst-port=51820 action=accept comment="Permitir WireGuard" place-before=0`,
      verification: '/interface wireguard peers print\n/ping 10.255.255.2 count=4'
    },
    {
      id: 'pop-06',
      code: 'POP-ISP-06',
      title: 'Atualização Segura de RouterOS v7 e Firmware RouterBOOT',
      category: 'Manutenção & Ciclo de Vida',
      routeros_version: 'v7.x',
      severity: 'Médio',
      objective: 'Aplicar patches de segurança sem risco de travamento ou perda de pacotes em produção.',
      checklist: [
        'Realizar backup completo binário (.backup) e exportação em script (.rsc) antes do início',
        'Verificar espaço livre em disco em /system resource (mínimo 20MB livres)',
        'Baixar pacote pelo canal stable em /system package update',
        'Reiniciar equipamento em janela programada de manutenção (madrugada)',
        'Após reinício, atualizar obrigatoriamente o firmware RouterBOOT em /system routerboard upgrade',
        'Reiniciar uma segunda vez para aplicar o novo bootloader'
      ],
      commands: `# 1. Backup Preventivo
/system backup save name="pre_upgrade_$[/system identity get name]"
/export file="pre_upgrade_$[/system identity get name]"

# 2. Download e Instalação
/system package update check-for-updates
/system package update install

# 3. Após o reboot (Atualizar Firmware de Hardware)
/system routerboard upgrade
/system reboot`,
      verification: '/system resource print\n/system routerboard print'
    },
    {
      id: 'pop-07',
      code: 'POP-ISP-07',
      title: 'Diagnóstico de Saturação de CPU e Análise com Tool Profile',
      category: 'Troubleshooting Avançado',
      routeros_version: 'v6 / v7',
      severity: 'Alto',
      objective: 'Identificar a causa raiz de lentidão extrema ou travamento de roteador em produção.',
      checklist: [
        'Abrir /tool profile para inspecionar o consumo por núcleo de CPU',
        'Se o processo dominante for "firewall": analisar regras de conexão pesadas ou falta de FastTrack',
        'Se for "networking" ou "ethernet": verificar loops de rede L2 ou tempestades de broadcast',
        'Se for "btest" ou "traffic-gen": encerrar testes de banda internos que consomem CPU da controladora',
        'Ativar FastTrack nas conexões established/related para liberar processamento de pacotes TCP/UDP'
      ],
      commands: `/tool profile cpu=all
/tool torch interface=ether1

# Regra de FastTrack para aliviar CPU
/ip firewall filter add chain=forward action=fasttrack-connection connection-state=established,related comment="FastTrack HW Acceleration" place-before=1
/ip firewall filter add chain=forward action=accept connection-state=established,related place-before=2`,
      verification: '/system resource cpu print\n/ip firewall connection print count-only'
    },
    {
      id: 'pop-08',
      code: 'POP-ISP-08',
      title: 'Padronização de Nomenclatura, Identidade e Documentação ISP',
      category: 'Governança & Padrões',
      routeros_version: 'Geral',
      severity: 'Médio',
      objective: 'Garantir que qualquer técnico do NOC consiga operar o roteador imediatamente sem dúvidas de cabeamento.',
      checklist: [
        'Definir /system identity no padrão: [TIPO]-[CLIENTE]-[CIDADE] (ex: RTR-EMPRESAX-SP)',
        'Comentar todas as interfaces físicas com destino (ex: ether1-WAN-FIBRA, ether2-LAN-SWITCH)',
        'Adicionar comentários em todas as regras de firewall e rotas estáticas',
        'Salvar esquema de endereçamento na documentação do NOC antes da entrega'
      ],
      commands: `/system identity set name="RTR-CLIENTE-MATRIZ"
/interface set ether1 comment="WAN1: Conexao Provedor Fibra 500M"
/interface set ether2 comment="TRUNK: Conexao Switch Core Aruba 2930F"
/interface set ether5 comment="MGMT: Porta de Acesso Exclusiva Tecnico"`,
      verification: '/interface print\n/system identity print'
    },
    {
      id: 'pop-09',
      code: 'POP-ISP-09',
      title: 'Mitigação de Ataques de Força Bruta e Port Scanners via Address-Lists',
      category: 'Segurança & Defesa',
      routeros_version: 'v7.x',
      severity: 'Alto',
      objective: 'Bloquear automaticamente IPs que realizem tentativas sequenciais de login ou escaneamento de portas.',
      checklist: [
        'Criar regra no firewall chain=input monitorando tentativas de conexão na porta SSH ou WinBox',
        'Se houver 3 tentativas em menos de 1 minuto, inserir o IP atacante na address-list "blacklist-bloqueados"',
        'Configurar tempo de permanência na blacklist de 24 horas',
        'Criar regra drop no topo da chain input para qualquer IP presente na "blacklist-bloqueados"'
      ],
      commands: `/ip firewall filter add chain=input src-address-list=blacklist-bloqueados action=drop comment="DROP IPs em Blacklist" place-before=0

# Captura de Força Bruta no SSH
/ip firewall filter add chain=input protocol=tcp dst-port=22 connection-state=new src-address-list=ssh_stage3 action=add-src-to-address-list address-list=blacklist-bloqueados address-list-timeout=1d comment="Adiciona a Blacklist 24h"
/ip firewall filter add chain=input protocol=tcp dst-port=22 connection-state=new src-address-list=ssh_stage2 action=add-src-to-address-list address-list=ssh_stage3 address-list-timeout=1m
/ip firewall filter add chain=input protocol=tcp dst-port=22 connection-state=new src-address-list=ssh_stage1 action=add-src-to-address-list address-list=ssh_stage2 address-list-timeout=1m
/ip firewall filter add chain=input protocol=tcp dst-port=22 connection-state=new action=add-src-to-address-list address-list=ssh_stage1 address-list-timeout=1m`,
      verification: '/ip firewall address-list print where list="blacklist-bloqueados"'
    },
    {
      id: 'pop-10',
      code: 'POP-ISP-10',
      title: 'Configuração de Wi-Fi Corporativo WPA3 e Isolamento de Visitantes',
      category: 'Wi-Fi & Redes Sem Fio',
      routeros_version: 'v7 (WifiWave2 / WiFi)',
      severity: 'Médio',
      objective: 'Prover rede sem fio de alta velocidade para equipe e isolar clientes visitantes da rede de dados da empresa.',
      checklist: [
        'Criar perfil de segurança com WPA2-PSK/WPA3-SAE para funcionários',
        'Criar Virtual AP (VAP) com SSID "Visitante" vinculado à VLAN 30',
        'Ativar client-isolation (default-forwarding=no) na rede de visitantes para que um celular não escaneie outro',
        'Configurar canais sem sobreposição: 1, 6 ou 11 em 2.4 GHz (20 MHz) e 36, 44, 149 em 5 GHz (80 MHz)'
      ],
      commands: `/interface wifi configuration add name=cfg-corp ssid="Empresa-Corporativo" security.authentication-types=wpa2-psk,wpa3-psk security.passphrase="ChaveCorp2026!"
/interface wifi configuration add name=cfg-guest ssid="Empresa-Visitantes" security.authentication-types=wpa2-psk security.passphrase="BemVindo2026" datapath.vlan-id=30 datapath.client-isolation=yes`,
      verification: '/interface wifi registration-table print'
    },
    {
      id: 'pop-11',
      code: 'POP-ISP-11',
      title: 'Emissão de Relatório de Análise de Causa Raiz Pós-Incidente (RCA)',
      category: 'Qualidade & Documentação',
      routeros_version: 'Geral',
      severity: 'Médio',
      objective: 'Documentar formalmente falhas de rede para prevenir reincidência e alimentar a base de conhecimento do ISP.',
      checklist: [
        'Horário exato de início e fim da degradação ou queda',
        'Equipamento impactado, versão de RouterOS e clientes afetados',
        'Causa Raiz técnica apurada (ex: loop de broadcast, esgotamento de pool DHCP, falha de rota BGP)',
        'Ação imediata de contingência aplicada pelo técnico',
        'Ação definitiva corretiva e plano de prevenção para evitar novo incidente'
      ],
      commands: `/log print where topics~"error" or topics~"critical"
/system history print detail`,
      verification: 'Preenchimento do formulário no painel NOC e arquivamento no banco de chamados'
    }
  ],

  // Tabela Comparativa RouterOS v6 vs RouterOS v7
  v6_vs_v7: [
    {
      recurso: 'Kernel Linux Base',
      v6: 'Linux 3.3.5 (Legacy, suporte a hardware moderno limitado)',
      v7: 'Linux 5.6.3 (Suporte SMP moderno, novos chipsets ARM/x86_64, desempenho superior)',
      impacto_isp: 'Permite aproveitar múltiplos núcleos de CPU de forma balanceada nos modelos CCR e RB5009.'
    },
    {
      recurso: 'Roteamento Dinâmico BGP',
      v6: 'Monothreaded em processo único (/routing bgp). Lento para carregar Full Routing table.',
      v7: 'Nova Routing Engine multi-threaded (/routing/bgp). Suporta templates, affinity e converte milhões de prefixos em segundos.',
      impacto_isp: 'Indispensável para ISPs com mais de um trânsito IP ou conexão ao IX.br (PTT).'
    },
    {
      recurso: 'Roteamento OSPF',
      v6: 'Instâncias separadas de OSPFv2 (IPv4) e OSPFv3 (IPv6).',
      v7: 'Instâncias unificadas de OSPFv2 e OSPFv3 sob a mesma arquitetura de templates e áreas.',
      impacto_isp: 'Simplifica a governança de redes de distribuição e anéis metro-ethernet.'
    },
    {
      recurso: 'VPN Moderna',
      v6: 'IPsec tradicional, OpenVPN (TCP apenas), L2TP/IPsec e SSTP.',
      v7: 'Suporte nativo ao protocolo WireGuard integrado ao kernel com criptografia ChaCha20/Poly1305.',
      impacto_isp: 'Túneis ponto a ponto com latência mínima e altíssimo throughput entre matriz e filiais.'
    },
    {
      recurso: 'Bridge VLAN Filtering',
      v6: 'Introduzido nas versões finais, mas com limitações de HW Offloading em switches.',
      v7: 'Padrão da indústria com aceleração por hardware (HW-Offload) nativa em chips Marvell, Realtek e Atheros.',
      impacto_isp: 'Comutação de pacotes em velocidade de fio (wire-speed) sem sobrecarregar a CPU do roteador.'
    },
    {
      recurso: 'Driver Sem Fio (Wi-Fi)',
      v6: 'Pacote "wireless" legado (apenas 802.11a/b/g/n/ac com WPA2).',
      v7: 'Novo driver "wifi" (antigo WifiWave2) com suporte a Wi-Fi 6 (802.11ax), OFDMA, MU-MIMO e WPA3.',
      impacto_isp: 'Permite projetar redes corporativas de altíssima densidade em empresas e eventos.'
    }
  ],

  // Portas e Protocolos Essenciais
  essential_ports: [
    { port: '8291/TCP', service: 'WinBox', description: 'Utilitário administrativo proprietário MikroTik' },
    { port: '22/TCP', service: 'SSH', description: 'Linha de comando segura (CLI) para scripts e automações' },
    { port: '53/UDP/TCP', service: 'DNS', description: 'Resolução de nomes de domínio (deve ter allow-remote restrito a LAN)' },
    { port: '67,68/UDP', service: 'DHCP', description: 'Distribuição dinâmica de endereçamento IP' },
    { port: '51820/UDP', service: 'WireGuard', description: 'Porta padrão de escuta para túneis VPN WireGuard' },
    { port: '179/TCP', service: 'BGP', description: 'Sessões Border Gateway Protocol entre roteadores de borda' },
    { port: '89/IP', service: 'OSPF', description: 'Protocolo de transporte IP 89 para roteamento interno' },
    { port: '161/UDP', service: 'SNMP', description: 'Monitoramento por Zabbix, Grafana ou Dude' }
  ]
};

