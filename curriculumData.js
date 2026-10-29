// BANCO DE QUESTÕES E AULAS COMPLETAS PARA OS 15 MÓDULOS DA ACADEMIA TÉCNICA MIKROTIK

export const allQuestions = [
  // ==========================================
  // MÓDULO 1: Fundamentos de Redes
  // ==========================================
  {
    id: 'q_m1_1',
    module_id: 'm1',
    question_text: 'Qual a principal diferença técnica entre um switch de camada 2 (L2) e um roteador de camada 3 (L3)?',
    options: [
      'Switches comutam quadros baseados em endereços físicos MAC no mesmo domínio de broadcast; roteadores encaminham pacotes entre sub-redes lógicas diferentes utilizando endereços IP e tabelas de rotas.',
      'Switches operam exclusivamente com sinais Wi-Fi e roteadores apenas com cabos de fibra óptica.',
      'Roteadores não possuem tabela de encaminhamento e switches sim.',
      'Switches alteram os endereços IP de origem dos pacotes e roteadores preservam os dados sem modificação.'
    ],
    correct_index: 0,
    explanation: 'Switches operam na Camada 2 (Enlace) comutando quadros Ethernet através da tabela CAM (endereços MAC). Roteadores operam na Camada 3 (Rede), inspecionando cabeçalhos IP para interligar redes distintas e selecionar o melhor caminho na tabela de roteamento.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m1_2',
    module_id: 'm1',
    question_text: 'Quantos endereços IP úteis para computadores estão disponíveis em uma sub-rede com máscara /29 (255.255.255.248)?',
    options: [
      '2 endereços úteis.',
      '6 endereços úteis.',
      '8 endereços úteis.',
      '14 endereços úteis.'
    ],
    correct_index: 1,
    explanation: 'A máscara /29 deixa 3 bits para hosts (32 - 29 = 3). O total de endereços é 2³ = 8. Descontando o identificador de rede (primeiro) e o endereço de broadcast (último), restam exatamente 6 endereços IP utilizáveis.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m1_3',
    module_id: 'm1',
    question_text: 'Em uma conexão PPPoE de provedor com MTU 1492, por que algumas páginas web em HTTPS travam no carregamento se o parâmetro MSS não estiver ajustado no roteador?',
    options: [
      'Porque conexões HTTPS exigem obrigatoriamente cabos blindados Cat7.',
      'Porque o cabeçalho PPPoE consome 8 bytes extras do pacote Ethernet padrão (1500 - 8 = 1492); se o TCP MSS não for reduzido para 1452 via clamping, pacotes com a flag Don\'t Fragment (DF) são descartados sem aviso ao cliente.',
      'Porque o protocolo PPPoE bloqueia a porta TCP 443 por padrão.',
      'Porque o RouterOS não suporta criptografia SSL em interfaces WAN.'
    ],
    correct_index: 1,
    explanation: 'O encapsulation PPPoE consome 8 bytes de overhead, limitando o MTU a 1492. O MSS (Maximum Segment Size) do TCP deve ser ajustado para MTU - 40 bytes (cabeçalhos IP e TCP), totalizando 1452. Sem TCP MSS Clamping, pacotes grandes com bit DF são descartados gerando o sintoma clássico de "Black Hole MTU" em sites HTTPS.',
    question_type: 'scenario'
  },
  {
    id: 'q_m1_4',
    module_id: 'm1',
    question_text: 'Quais são as portas padrão dos serviços DNS, HTTP, HTTPS e WinBox, respectivamente?',
    options: [
      'DNS: 53 | HTTP: 80 | HTTPS: 443 | WinBox: 8291',
      'DNS: 21 | HTTP: 25 | HTTPS: 110 | WinBox: 22',
      'DNS: 8080 | HTTP: 80 | HTTPS: 8443 | WinBox: 80',
      'DNS: 67 | HTTP: 80 | HTTPS: 443 | WinBox: 161'
    ],
    correct_index: 0,
    explanation: 'As portas IANA padrão são: DNS na porta 53 (UDP/TCP), HTTP na porta 80 (TCP), HTTPS na porta 443 (TCP) e o utilitário administrativo WinBox na porta proprietária 8291 (TCP).',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 2: Conhecendo os Equipamentos MikroTik
  // ==========================================
  {
    id: 'q_m2_1',
    module_id: 'm2',
    question_text: 'Em relação às versões do RouterOS, qual a principal evolução estrutural introduzida no RouterOS v7 em comparação com o RouterOS v6?',
    options: [
      'O RouterOS v7 removeu o suporte a cabos de rede Ethernet.',
      'O RouterOS v7 atualizou o kernel Linux (5.x), reescreveu o motor de roteamento com suporte avançado a BGP/OSPF, adicionou a VPN WireGuard nativa e o novo ecossistema WifiWave2.',
      'O RouterOS v7 deixou de permitir conexão com o software WinBox.',
      'O RouterOS v7 só roda em máquinas virtuais na nuvem.'
    ],
    correct_index: 1,
    explanation: 'O RouterOS v7 trouxe kernel Linux moderno, novo stack de roteamento com convergência ultrarrápida, suporte oficial nativo a WireGuard e drivers modernos WifiWave2/qcom para chips 802.11ac/ax.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m2_2',
    module_id: 'm2',
    question_text: 'Sobre o licenciamento do RouterOS, qual nível de licença (Level) acompanha a maioria dos roteadores de acesso (ex: hEX, hAP ac) permitindo operar como AP sem fio e servidor de VPN?',
    options: [
      'Level 0 (Modo demonstração de 24 horas)',
      'Level 1 (Apenas para switches sem roteamento)',
      'Level 4 (Suporta modo AP sem fio, interfaces ilimitadas e até 200 túneis PPPoE/PPTP simultâneos)',
      'Level 10 (Exclusivo para provedores internacionais)'
    ],
    correct_index: 2,
    explanation: 'A licença Level 4 é o padrão para equipamentos corporativos como hEX e hAP, permitindo roteamento ilimitado, modo Access Point wireless e até 200 túneis simultâneos.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m2_3',
    module_id: 'm2',
    question_text: 'Qual linha de equipamentos MikroTik é especificamente projetada para atuar como roteador de borda (BGP/Core de Provedor) com alto throughput e múltiplos núcleos de CPU?',
    options: [
      'Linha mAP (Micro Access Points)',
      'Linha CCR (Cloud Core Router) com processadores ARM64/Tile e dezenas de núcleos',
      'Linha cAP (Ceiling Access Points)',
      'Linha SXT (Antenas integradas para enlaces ponto a ponto)'
    ],
    correct_index: 1,
    explanation: 'Os Cloud Core Routers (CCR, como CCR2004 e CCR2116) possuem arquitetura de múltiplos núcleos (multicore ARM64) e interfaces 10G/25G/100G SFP+, projetados para processar tráfego pesado de borda e BGP em provedores.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m2_4',
    module_id: 'm2',
    question_text: 'O que significa a sigla "CRS" no catálogo de produtos da MikroTik e qual sua função prioritária?',
    options: [
      'Cloud Router Switch: Equipamentos com chip de switch dedicado de alta densidade de portas, projetados prioritariamente para comutação L2/L3 com Hardware Offloading.',
      'Central Radio System: Rádios de longa distância para torres de transmissão.',
      'Compact Redundant Server: Servidores de e-mail e DNS internos.',
      'Cable Repair Station: Ferramenta de teste de cabo de rede.'
    ],
    correct_index: 0,
    explanation: 'CRS (Cloud Router Switch) são switches gerenciáveis com chip de comutação por hardware (Switch Chip Marvell). Embora rodem RouterOS, seu uso correto é comutação L2/L3 por hardware, evitando tarefas pesadas de CPU como filas complexas.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 3: Primeiro Acesso e Configuração Inicial
  // ==========================================
  {
    id: 'q_m3_1',
    module_id: 'm3',
    question_text: 'Por que é uma boa prática técnica fundamental ativar a função "Safe Mode" (tecla F4) no WinBox antes de alterar regras de firewall ou interfaces de rede?',
    options: [
      'Porque o Safe Mode aumenta o processamento do roteador em 30%.',
      'Porque cria uma transação reversível no kernel: se a conexão do técnico cair devido a uma regra restritiva ou erro de rota, as alterações são revertidas automaticamente, prevenindo bloqueio de acesso (lockout).',
      'Porque o Safe Mode faz backup em nuvem imediatamente.',
      'Porque o Safe Mode zera as senhas dos roteadores vizinhos.'
    ],
    correct_index: 1,
    explanation: 'O Safe Mode é o mecanismo de segurança indispensável no RouterOS. Ao ser ativado, qualquer perda de conectividade na sessão de gerenciamento cancela as modificações aplicadas na sessão e restaura o estado anterior.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m3_2',
    module_id: 'm3',
    question_text: 'Qual a principal diferença técnica entre um backup binário (`/system backup save`) e um arquivo de script exportado (`/export file=...`)?',
    options: [
      'O backup binário é legível no Bloco de Notas e o export é criptografado.',
      'O backup binário (.backup) é uma imagem proprietária que preserva senhas criptografadas e configurações de hardware para o mesmo modelo; o export (.rsc) é um script de comandos em texto puro auditável e portável entre modelos.',
      'Ambos os arquivos têm o mesmo formato e não há diferença operacional.',
      'O script de export só pode ser restaurado via cabo serial.'
    ],
    correct_index: 1,
    explanation: 'O arquivo .backup é uma imagem binária completa para disaster recovery no mesmo equipamento. O arquivo .rsc é um script legível com comandos CLI que pode ser editado, auditado e reaproveitado em outros roteadores e versões.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m3_3',
    module_id: 'm3',
    question_text: 'No processo de hardening inicial de um roteador que atenderá uma empresa, quais serviços em `/ip service` devem ser IMEDIATAMENTE desativados por segurança?',
    options: [
      'winbox e ssh.',
      'telnet, ftp, www (HTTP sem criptografia), api e api-ssl se não forem utilizados.',
      'apenas o serviço de relógio NTP.',
      'nenhum serviço deve ser desativado segundo a MikroTik.'
    ],
    correct_index: 1,
    explanation: 'Telnet e FTP trafegam usuários e senhas em texto claro na rede. O serviço WebFig (www na porta 80) é vulnerável a interceptações se não usar HTTPS. Manter apenas Winbox e SSH com IPs de gerência restritos é a melhor prática recomendada.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m3_4',
    module_id: 'm3',
    question_text: 'Como o WinBox consegue localizar e conectar a uma RouterBOARD recém-saída da caixa conectada diretamente ao notebook do técnico, mesmo sem endereço IP configurado?',
    options: [
      'Utilizando satélite GPS integrado.',
      'Através do protocolo de camada 2 MNDP (MikroTik Neighbor Discovery Protocol) via broadcast UDP 20561, permitindo conexão direta pelo endereço MAC físico.',
      'Acessando a porta USB do equipamento.',
      'Usando o protocolo Bluetooth de fábrica.'
    ],
    correct_index: 1,
    explanation: 'O WinBox usa o protocolo L2 MNDP/CDP para descobrir roteadores no mesmo domínio de broadcast através de pacotes UDP na porta 20561, possibilitando o gerenciamento completo via MAC WinBox antes de qualquer configuração IP.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 4: Interfaces, Bridge e Endereçamento
  // ==========================================
  {
    id: 'q_m4_1',
    module_id: 'm4',
    question_text: 'Quando portas físicas (ex: ether2, ether3, ether4) são adicionadas a uma bridge chamada "bridge-lan", onde o endereço IP do gateway da rede local deve ser configurado?',
    options: [
      'Na interface física ether2 obrigatoriamente.',
      'Na interface virtual "bridge-lan", pois as portas físicas tornam-se escravas L2 e a bridge passa a ser a interface L3 mestre de todas elas.',
      'Em todas as portas físicas simultaneamente com o mesmo endereço IP.',
      'No menu Routing Filter exclusivamente.'
    ],
    correct_index: 1,
    explanation: 'Portas escravas de uma bridge operam puramente em camada 2. Para que todas as portas compartilhem o mesmo gateway, servidores DHCP e regras de firewall, o endereço IP deve ser associado à interface pai "bridge-lan".',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m4_2',
    module_id: 'm4',
    question_text: 'O que indica a flag "H" na coluna de portas em `/interface bridge port print` no RouterOS v7?',
    options: [
      'A porta está com erro de Hardware.',
      'Hardware Offloading ativo: os pacotes entre as portas participantes são comutados diretamente pelo chip switch integrado da placa sem consumir ciclos de CPU do roteador.',
      'A porta está em modo Half-Duplex a 10 Mbps.',
      'A porta requer autenticação Hotspot.'
    ],
    correct_index: 1,
    explanation: 'A flag "H" (Hardware Offloading) confirma que o processamento L2 foi delegado ao chip de switch (Switch Chip ASIC), permitindo comutação de gigabits por segundo com 0% de uso de CPU.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m4_3',
    module_id: 'm4',
    question_text: 'Qual protocolo ativado na bridge do MikroTik previne a paralisação da rede por tempestades de broadcast caso alguém conecte as duas pontas de um cabo em portas da mesma rede?',
    options: [
      'RSTP (Rapid Spanning Tree Protocol - IEEE 802.1w), que detecta loops em milissegundos e bloqueia a porta redundante.',
      'OSPF (Open Shortest Path First).',
      'BGP (Border Gateway Protocol).',
      'SNMP (Simple Network Management Protocol).'
    ],
    correct_index: 0,
    explanation: 'O RSTP monitora Bridge Protocol Data Units (BPDUs). Ao detectar um loop em camada 2, o protocolo coloca a porta redundante no estado "discarding / alternate" imediatamente, evitando colapso da rede.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m4_4',
    module_id: 'm4',
    question_text: 'Qual ferramenta do RouterOS permite visualizar os dispositivos vizinhos conectados diretamente às interfaces (como switches, antenas e outros roteadores)?',
    options: [
      '/ip dns cache print',
      '/ip neighbor print (exibindo vizinhos detectados via MNDP, LLDP e CDP)',
      '/system history print',
      '/tool email send'
    ],
    correct_index: 1,
    explanation: 'A tabela de Neighbor Discovery (/ip neighbor print) exibe equipamentos vizinhos, informando endereço MAC, IP, nome do dispositivo, versão do software e interface de conexão.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 5: DHCP, DNS e Serviços Básicos
  // ==========================================
  {
    id: 'q_m5_1',
    module_id: 'm5',
    question_text: 'Ao habilitar a opção `allow-remote-requests=yes` em `/ip dns`, qual medida de segurança deve ser tomada OBRIGATORIAMENTE no firewall?',
    options: [
      'Nenhuma medida é necessária, pois o MikroTik bloqueia a porta 53 automaticamente.',
      'Criar uma regra no firewall (chain=input in-interface=WAN protocol=udp/tcp dst-port=53 action=drop) para impedir que invasores usem o roteador em ataques de amplificação DNS (DNS Amplification DDoS).',
      'Desativar a interface LAN.',
      'Trocar o cabo de rede da operadora.'
    ],
    correct_index: 1,
    explanation: 'Com `allow-remote-requests=yes`, o MikroTik responde a consultas DNS na porta 53. Se a porta não for bloqueada na interface WAN, scanners na internet transformarão o equipamento em um "open resolver", gerando ataques de DDoS e alto consumo de banda.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m5_2',
    module_id: 'm5',
    question_text: 'Em uma rede corporativa, qual o procedimento correto no DHCP Server para garantir que a impressora fiscal sempre receba o mesmo endereço IP 192.168.10.50?',
    options: [
      'Reiniciar o servidor DHCP todos os dias às 08:00.',
      'Acessar IP -> DHCP Server -> Leases, localizar o dispositivo pelo MAC address e clicar em "Make Static", fixando o IP desejado.',
      'Diminuir o Lease Time para 1 minuto.',
      'Excluir a máscara de rede.'
    ],
    correct_index: 1,
    explanation: 'Transformar um lease dinâmico em estático ("Make Static") associa permanentemente o endereço MAC da placa de rede ao endereço IP pretendido no banco do DHCP Server.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m5_3',
    module_id: 'm5',
    question_text: 'Um técnico conecta um computador na rede e verifica que ele recebeu o endereço IP 169.254.120.45. Qual o significado desse endereço e qual a causa técnica provável?',
    options: [
      'É um IP público entregue pela operadora.',
      'É um endereço APIPA (Automatic Private IP Addressing), indicando que o computador não recebeu resposta de nenhum servidor DHCP na rede (pool esgotado, cabo desconectado ou DHCP Server inativo).',
      'É o IP padrão do processador MikroTik.',
      'É um endereço de VPN WireGuard.'
    ],
    correct_index: 1,
    explanation: 'A faixa 169.254.0.0/16 é autoconfigurada pelo sistema operacional quando uma requisição DHCP Discover não obtém resposta DHCP Offer na rede local.',
    question_type: 'scenario'
  },
  {
    id: 'q_m5_4',
    module_id: 'm5',
    question_text: 'Qual a vantagem prática de configurar servidores DNS com cache local ativo no próprio roteador MikroTik corporativo?',
    options: [
      'O roteador passa a fabricar energia elétrica para os computadores.',
      'As consultas DNS repetidas de todos os computadores da empresa são respondidas em menos de 1ms pela memória RAM do MikroTik, acelerando o início do carregamento de páginas e reduzindo tráfego no link.',
      'Elimina a necessidade de ter internet contratada.',
      'Garante que nenhuma senha seja necessária no Wi-Fi.'
    ],
    correct_index: 1,
    explanation: 'O DNS Cache armazena as resoluções de nomes recentes na memória RAM da RouterBOARD, respondendo aos clientes locais instantaneamente sem precisar consultar servidores externos repetidas vezes.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 6: Internet, Rotas e NAT
  // ==========================================
  {
    id: 'q_m6_1',
    module_id: 'm6',
    question_text: 'Em uma configuração de redundância com Link Principal e Link Backup, como o RouterOS comuta automaticamente para o backup em caso de queda física ou lógica do provedor principal?',
    options: [
      'Configurando duas rotas default com o mesmo gateway.',
      'Criando a rota do Link Principal com Distance=1 e check-gateway=ping, e a rota do Link Backup com Distance=2.',
      'Desativando o protocolo IPv4 no Link Backup.',
      'Utilizando action=masquerade em todas as portas.'
    ],
    correct_index: 1,
    explanation: 'A distância administrativa menor (1) tem prioridade sobre a maior (2). O parâmetro `check-gateway=ping` monitora o gateway primário; se houver perda de ICMP por 2 ciclos de 10s, a rota principal fica inativa e o RouterOS assume a rota de distância 2 imediatamente.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m6_2',
    module_id: 'm6',
    question_text: 'Por que a regra de NAT Masquerade de saída para a internet deve obrigatoriamente especificar `out-interface=WAN` (ou out-interface-list=WAN)?',
    options: [
      'Para que o roteador reinicie mais rápido.',
      'Para evitar que o tráfego interno (inclusive entre VLANs e sub-redes da empresa) tenha seu IP de origem mascarado indevidamente pelo roteador, o que destruiria a visibilidade dos IPs e quebraria aplicações locais.',
      'Porque o RouterOS gera um erro de compilação sem esse parâmetro.',
      'Apenas por recomendação estética sem impacto técnico.'
    ],
    correct_index: 1,
    explanation: 'Sem a restrição de out-interface, qualquer pacote que passar pelo roteador (mesmo entre duas estações da rede local) sofrerá tradução de NAT de origem, mascarando os IPs reais e inviabilizando servidores locais e auditoria.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m6_3',
    module_id: 'm6',
    question_text: 'Qual a diferença entre a action `masquerade` e a action `src-nat` no firewall NAT do MikroTik?',
    options: [
      'Masquerade é para redes sem fio e src-nat é para fibra óptica.',
      'Masquerade consulta dinamicamente o IP da interface WAN a cada pacote (ideal para IPs dinâmicos DHCP/PPPoE); src-nat com `to-addresses` utiliza um IP estático predefinido, consumindo menos processamento em links dedicados.',
      'Não há diferença técnica entre as duas ações.',
      'src-nat só funciona no RouterOS v6.'
    ],
    correct_index: 1,
    explanation: 'O Masquerade recalcula o IP de origem conforme a interface varia (limpando a tabela conntrack se a WAN cair). O action=src-nat é estático, consome menos CPU e é a melhor prática para blocos de IP fixos em links dedicados.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m6_4',
    module_id: 'm6',
    question_text: 'Qual a forma mais segura de configurar um redirecionamento de porta (DST-NAT) para o servidor RDP ou gravador NVR da empresa acessível pela internet?',
    options: [
      'Abrir a porta 3389 para qualquer IP do planeta sem restrições.',
      'Criar a regra de dst-nat alterando a porta pública externa e restringindo a conexão apenas aos IPs de origem autorizados da equipe através de `src-address` ou `src-address-list`.',
      'Desativar o firewall do MikroTik.',
      'Colocar o IP do servidor em DMZ sem regras de filtro.'
    ],
    correct_index: 1,
    explanation: 'Port forwarding aberto sem restrição de IP de origem expõe portas sensíveis (como 3389 RDP) a varreduras automatizadas e ransomware. Restringir o acesso com `src-address-list` garante que apenas técnicos autorizados alcancem o serviço.',
    question_type: 'scenario'
  },

  // ==========================================
  // MÓDULO 7: Firewall e Segurança
  // ==========================================
  {
    id: 'q_m7_1',
    module_id: 'm7',
    question_text: 'Qual a diferença conceitual fundamental entre a cadeia "INPUT" e a cadeia "FORWARD" no firewall do MikroTik RouterOS?',
    options: [
      'A cadeia INPUT processa apenas conexões IPv6 e a FORWARD conexões IPv4.',
      'A cadeia INPUT trata dos pacotes cujo destino final é o próprio roteador MikroTik (Winbox, SSH, DNS); a cadeia FORWARD filtra os pacotes que atravessam o roteador rumo aos computadores e servidores da rede.',
      'INPUT é para cabos de rede e FORWARD para Wi-Fi.',
      'Ambas realizam o mesmo procedimento sem distinção de destino.'
    ],
    correct_index: 1,
    explanation: 'INPUT protege os serviços do próprio roteador (kernel, serviços locais). FORWARD protege e controla o tráfego dos usuários e dispositivos que trafegam entre interfaces passando pelo equipamento.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m7_2',
    module_id: 'm7',
    question_text: 'Por que a regra `chain=input (ou forward) connection-state=established,related,untracked action=accept` DEVE ficar no topo (posição 0) do firewall?',
    options: [
      'Para gastar menos memória Flash.',
      'Porque a grande maioria dos pacotes de uma rede pertence a conexões já aprovadas anteriormente; colocá-la no topo faz com que o processador libere o pacote no primeiro teste sem avaliar centenas de regras abaixo.',
      'Porque o RouterOS trava se essa regra não for a primeira.',
      'Apenas por convenção visual do WinBox.'
    ],
    correct_index: 1,
    explanation: 'O Connection Tracking classifica fluxos. Aceitar conexões estabelecidas e relacionadas no topo poupa ciclos massivos de CPU, pois pacotes de downloads e navegações ativas não precisam percorrer todas as regras de bloqueio a cada frame.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m7_3',
    module_id: 'm7',
    question_text: 'Como o RouterOS implementa a defesa ativa contra ataques de força bruta (brute-force login) no Winbox ou SSH?',
    options: [
      'Desligando a porta física do equipamento.',
      'Utilizando regras com a ação `add-src-to-address-list` com timeouts progressivos (ex: 1min, 15min, 24h), bloqueando IPs que falharem múltiplas tentativas em curto intervalo.',
      'Alterando a senha do roteador a cada 10 minutos.',
      'Enviando um e-mail para a polícia federal automaticamente.'
    ],
    correct_index: 1,
    explanation: 'Regras de mitigação de força bruta capturam IPs que atingem o roteador repetidas vezes sem sucesso e os adicionam a listas negras dinâmicas (Blacklists) com timeouts temporários, impedindo que o atacante sature a CPU ou descubra a senha.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m7_4',
    module_id: 'm7',
    question_text: 'Qual o risco operacional de aplicar uma regra `chain=input in-interface=ether1 action=drop` sem ter criado antes as regras de exceção para sua rede de gerência?',
    options: [
      'Aumentar o consumo de energia elétrica.',
      'Perda total e imediata do acesso administrativo remoto (Lockout), exigindo deslocamento físico para acesso por console ou reset se o Safe Mode não estiver ativo.',
      'Desconfiguração do servidor DNS.',
      'Nenhum risco, o RouterOS avisa antes de bloquear.'
    ],
    correct_index: 1,
    explanation: 'O firewall do RouterOS é estrito e avalia de cima para baixo. Bloquear a entrada sem regras explícitas que permitam o acesso gerencial da equipe causa lockout instantâneo da sessão.',
    question_type: 'scenario'
  },

  // ==========================================
  // MÓDULO 8: VLANs e Segmentação de Empresas
  // ==========================================
  {
    id: 'q_m8_1',
    module_id: 'm8',
    question_text: 'Ao implementar o moderno Bridge VLAN Filtering no RouterOS v7, por que é obrigatório declarar a própria interface `bridge` como membro TAGGED da VLAN?',
    options: [
      'Apenas para acender os LEDs do equipamento.',
      'Para permitir que a CPU de camada 3 do roteador receba os pacotes daquela VLAN e consiga atuar como Gateway (IP), servidor DHCP e aplicar regras de firewall.',
      'Para evitar o aquecimento do processador.',
      'Para dobrar a velocidade da porta física.'
    ],
    correct_index: 1,
    explanation: 'No modelo unificado de bridge, a interface bridge é o canal que liga o switch L2 à CPU L3. Sem declarar a bridge como tagged, os pacotes ficam confinados no switch chip e nunca alcançam a interface `/interface vlan` de camada 3.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m8_2',
    module_id: 'm8',
    question_text: 'Qual a diferença entre uma porta configurada como "Access" e uma porta configurada como "Trunk" em uma rede segmentada com 802.1Q?',
    options: [
      'Portas Access são para cabos de fibra e Trunk para cabos metálicos.',
      'Portas Access conectam dispositivos finais (PCs, impressoras) sem tags e usam PVID para etiquetar o tráfego; portas Trunk conectam switches e roteadores transportando múltiplos VLAN IDs etiquetados (tagged).',
      'Portas Trunk não suportam tráfego de internet.',
      'Portas Access operam apenas a 10 Mbps.'
    ],
    correct_index: 1,
    explanation: 'Portas de acesso (Untagged com PVID) inserem a tag ao receber dados de estações e removem a tag ao entregar. Portas de Trunk (Tagged) preservam o cabeçalho 802.1Q com as etiquetas de múltiplos setores entre equipamentos de rede.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m8_3',
    module_id: 'm8',
    question_text: 'Em uma empresa com VLAN 10 (Administração) e VLAN 30 (Visitantes), como impedir tecnicamente que visitantes acessem servidores e impressoras da rede administrativa?',
    options: [
      'Desligando o switch da empresa.',
      'Adicionando uma regra no firewall: `/ip firewall filter add chain=forward src-address=172.16.30.0/24 dst-address=10.10.10.0/24 action=drop`.',
      'Colocando a mesma senha no Wi-Fi para todos.',
      'Mudando a cor do cabo de rede da recepção.'
    ],
    correct_index: 1,
    explanation: 'Por padrão, o kernel do RouterOS roteia pacotes entre redes conectadas. Para garantir isolamento efetivo entre redes de visitantes e servidores internos, é indispensável a regra restritiva de drop na cadeia forward.',
    question_type: 'cli_interpretation'
  },
  {
    id: 'q_m8_4',
    module_id: 'm8',
    question_text: 'Qual comando CLI no RouterOS v7 exibe a tabela em tempo real de membros de VLANs ativas (com flags D para dinâmico e A para ativo)?',
    options: [
      '/interface bridge vlan print',
      '/system license print',
      '/ip route rule print',
      '/tool netwatch print'
    ],
    correct_index: 0,
    explanation: 'O comando `/interface bridge vlan print` detalha as VLANs ativas na bridge, listando quais portas estão operando como tagged e quais foram inseridas dinamicamente como untagged via PVID.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 9: Wi-Fi Corporativo
  // ==========================================
  {
    id: 'q_m9_1',
    module_id: 'm9',
    question_text: 'Na faixa de frequência de 2.4 GHz com largura de canal em 20 MHz, quais são os únicos três canais que não sofrem sobreposição e interferência mútua?',
    options: [
      'Canais 1, 2 e 3.',
      'Canais 1, 6 e 11.',
      'Canais 10, 11 e 12.',
      'Canais 36, 40 e 44.'
    ],
    correct_index: 1,
    explanation: 'No espectro de 2.4 GHz regulamentado, os canais 1, 6 e 11 possuem separação de 25 MHz entre suas portadoras centrais, garantindo ausência de sobreposição espectral em canais de 20 MHz.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m9_2',
    module_id: 'm9',
    question_text: 'Por que é um erro técnico grave configurar canais Wi-Fi corporativos em 2.4 GHz com largura de 40 MHz em ambientes comerciais com múltiplos vizinhos?',
    options: [
      'Porque queima o chip transmissor do roteador.',
      'Porque um canal de 40 MHz ocupa mais de 70% de todo o espectro disponível de 2.4 GHz, colidindo com todas as redes vizinhas e gerando alta taxa de retransmissão de pacotes e lentidão.',
      'Porque os celulares não suportam Wi-Fi.',
      'Porque a ANATEL proíbe o uso de roteadores em empresas.'
    ],
    correct_index: 1,
    explanation: 'Canais de 40 MHz em 2.4 GHz geram interferência massiva com outras redes e dispositivos Bluetooth, causando colisões e retransmissões que derrubam o desempenho geral da rede.',
    question_type: 'scenario'
  },
  {
    id: 'q_m9_3',
    module_id: 'm9',
    question_text: 'Qual a principal diferença entre os drivers wireless legados e o novo pacote "WifiWave2 / WiFi" no RouterOS v7?',
    options: [
      'O pacote WifiWave2 não funciona com senhas.',
      'O WifiWave2 oferece suporte completo ao padrão Wi-Fi 6 (802.11ax), criptografia moderna WPA3-SAE, recursos de roaming avançado 802.11k/v/r e melhoria de desempenho para chips Qualcomm/ARM.',
      'WifiWave2 só funciona para conexões de satélite.',
      'Não há diferenças técnicas.'
    ],
    correct_index: 1,
    explanation: 'O pacote WiFi (antigo WifiWave2) é o novo subsistema sem fio do RouterOS v7 para hardware 802.11ac/ax, trazendo suporte a WPA3, Fast BSS Transition (802.11r), MU-MIMO e OFDMA.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m9_4',
    module_id: 'm9',
    question_text: 'Em uma infraestrutura com múltiplos Access Points (CAPs), como isolar o tráfego do SSID "Visitantes" sem que eles acessem a rede local da empresa?',
    options: [
      'Criando uma interface Virtual AP com o SSID "Visitantes" e associando-a à VLAN de convidados (ex: VLAN 30), com isolamento no firewall.',
      'Diminuindo a potência do sinal de rádio.',
      'Mudando o nome do roteador.',
      'Bloqueando os celulares na recepção.'
    ],
    correct_index: 0,
    explanation: 'Interfaces de Virtual AP (VAP) permitem transmitir múltiplos SSIDs na mesma antena física, vinculando o SSID corporativo à VLAN nativa e o SSID de visitantes à VLAN isolada.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 10: VPN e Acesso Remoto Seguro
  // ==========================================
  {
    id: 'q_m10_1',
    module_id: 'm10',
    question_text: 'Qual protocolo de VPN de última geração foi introduzido de forma nativa e integrada no RouterOS v7, oferecendo alto desempenho e criptografia moderna com chaves Curve25519?',
    options: [
      'PPTP (Point-to-Point Tunneling Protocol com MS-CHAPv2 vulnerável).',
      'WireGuard (operando em camada 3 sobre protocolo UDP na porta 51820).',
      'L2TP sem IPsec.',
      'Telnet VPN.'
    ],
    correct_index: 1,
    explanation: 'O WireGuard é uma VPN de camada 3 moderna, extremamente rápida e com poucas linhas de código, baseada em criptografia assimétrica de chaves públicas/privadas sobre UDP.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m10_2',
    module_id: 'm10',
    question_text: 'No WireGuard do MikroTik, qual a função crucial do parâmetro `allowed-address` configurado na entrada de um Peer?',
    options: [
      'Definir a senha do usuário administrativo.',
      'Funciona simultaneamente como lista de controle de acesso (ACL) dos IPs permitidos e tabela interna de roteamento: pacotes destinados a essas sub-redes são roteados pelo túnel e pacotes recebidos são filtrados.',
      'Limitar a velocidade de upload da interface.',
      'Configurar o endereço MAC da placa de rede.'
    ],
    correct_index: 1,
    explanation: 'O parâmetro `allowed-address` define exatamente quais IPs de origem e destino podem trafegar dentro do túnel criptográfico daquele peer, descartando tráfego não autorizado.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m10_3',
    module_id: 'm10',
    question_text: 'Qual protocolo de VPN é a melhor recomendação para interligar filiais quando um dos roteadores possui acelerador de criptografia por hardware (Hardware Crypto AES-NI / IPsec)?',
    options: [
      'IPsec IKEv2 com túnel de transporte protegido por aceleração de hardware (Hw-Crypto).',
      'PPTP com chave vazia.',
      'HTTP Proxy básico.',
      'TFTP sem autenticação.'
    ],
    correct_index: 0,
    explanation: 'IPsec IKEv2 com aceleração de hardware em processadores modernos MikroTik entrega criptografia pesada em velocidade de gigabits com impacto quase nulo na CPU.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m10_4',
    module_id: 'm10',
    question_text: 'Se um túnel WireGuard entre Matriz e Filial exibe no WinBox o status "last-handshake: never", qual a causa mais comum de bloqueio no firewall?',
    options: [
      'Falta de cabo de força no roteador.',
      'A porta UDP configurada (padrão 51820) está sendo descartada (dropped) no chain INPUT do firewall na interface WAN do roteador que atua como servidor.',
      'O nome do roteador possui caracteres maiúsculos.',
      'A máscara de sub-rede da rede local é /24.'
    ],
    correct_index: 1,
    explanation: 'O handshake criptográfico do WireGuard exige comunicação bidirecional UDP na porta designada. Se o firewall descartar pacotes UDP na porta 51820, o aperto de mão nunca se completa.',
    question_type: 'scenario'
  },

  // ==========================================
  // MÓDULO 11: Controle de Banda e Qualidade de Serviço (QoS)
  // ==========================================
  {
    id: 'q_m11_1',
    module_id: 'm11',
    question_text: 'Em uma Simple Queue do RouterOS, qual a diferença entre os parâmetros `limit-at` e `max-limit`?',
    options: [
      'limit-at é para downloads e max-limit é para uploads.',
      'limit-at representa a banda mínima garantida para o cliente mesmo em caso de congestionamento; max-limit é a velocidade máxima permitida quando há folga no link.',
      'limit-at é o tempo de expiração do contrato.',
      'Ambos os valores devem ser rigorosamente idênticos.'
    ],
    correct_index: 1,
    explanation: 'O algoritmo HTB no RouterOS usa `limit-at` como garantia de banda prioritária (Committed Information Rate) e `max-limit` como teto máximo de estouro na fila.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m11_2',
    module_id: 'm11',
    question_text: 'Qual tipo de fila (Queue Type) é ideal para dividir de forma dinâmica e justa a banda de internet entre dezenas de usuários de uma empresa sem precisar criar uma regra individual para cada computador?',
    options: [
      'PFIFO com tamanho 10.',
      'PCQ (Per Connection Queue), agrupando fluxos por `pcq-classifier=dst-address` (para download) ou `src-address` (para upload).',
      'RED (Random Early Detection).',
      'FIFO simples sem parâmetros.'
    ],
    correct_index: 1,
    explanation: 'O PCQ (Per Connection Queue) cria subfilas dinâmicas em tempo real com base no endereço IP, dividindo a banda disponível igualitariamente entre todos os usuários ativos no momento.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m11_3',
    module_id: 'm11',
    question_text: 'O que acontece com as regras de controle de banda (Simple Queues e Queue Tree) se o técnico mantiver ativa a regra padrão de FastTrack (`action=fasttrack-connection`) no firewall?',
    options: [
      'O roteador passa a controlar o dobro de banda.',
      'Os pacotes aprovados pelo FastTrack ignoram o subsistema de filas do kernel do Linux, fazendo com que o controle de banda pare de limitar a velocidade da maioria dos usuários.',
      'A velocidade do link é reduzida a zero.',
      'O WinBox fecha imediatamente.'
    ],
    correct_index: 1,
    explanation: 'O FastTrack faz bypass de processamento no kernel para acelerar o throughput. Como resultado, pacotes acelerados não passam pela árvore de filas (Queues), furando a limitação de velocidade configurada.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m11_4',
    module_id: 'm11',
    question_text: 'O que é o fenômeno "Bufferbloat" e como ele afeta os colaboradores de uma empresa durante transferências pesadas de arquivos?',
    options: [
      'É o superaquecimento da placa de rede.',
      'É o acúmulo excessivo de pacotes em buffers de filas de espera quando o link de upload satura, provocando aumento drástico de latência (ping sobe de 15ms para 800ms) e picotamento de ligações VoIP e videoconferências.',
      'É um vírus de computador que atinge roteadores.',
      'É o bloqueio automático de sites de notícias.'
    ],
    correct_index: 1,
    explanation: 'Bufferbloat é a latência induzida por buffers excessivos em equipamentos sob saturação. O uso de algoritmos modernos de fila como CAKE ou fq_codel no RouterOS v7 mitiga esse efeito.',
    question_type: 'scenario'
  },

  // ==========================================
  // MÓDULO 12: Monitoramento e Troubleshooting
  // ==========================================
  {
    id: 'q_m12_1',
    module_id: 'm12',
    question_text: 'Qual ferramenta nativa do RouterOS permite inspecionar em tempo real os fluxos de pacotes passando por uma interface, exibindo IPs de origem/destino, protocolos, portas e taxas de transferência?',
    options: [
      '/tool torch (Ferramenta Torch)',
      '/system note print',
      '/ip smb print',
      '/tool graphing'
    ],
    correct_index: 0,
    explanation: 'O Torch (/tool torch) é o analisador de tráfego em tempo real mais poderoso do RouterOS para identificar imediatamente qual cliente ou protocolo está saturando uma interface física ou VLAN.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m12_2',
    module_id: 'm12',
    question_text: 'Quando o processador (CPU) de uma RouterBOARD atinge 100% de uso constante, qual ferramenta do RouterOS identifica com precisão qual subsistema (firewall, routing, queues ou profiling) está consumindo os recursos?',
    options: [
      '/tool profile',
      '/tool speed-test',
      '/ip hotspot user print',
      '/system reboot'
    ],
    correct_index: 0,
    explanation: 'A ferramenta Profile (/tool profile) exibe a porcentagem exata de processador gasta por cada tarefa interna do kernel, como firewall, conntrack, networking, btest e criptografia.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m12_3',
    module_id: 'm12',
    question_text: 'Qual é a sequência padronizada e profissional do Método de Diagnóstico de Falhas (Troubleshooting ISP) ensinado na Academia Técnica MikroTik?',
    options: [
      'Trocar o roteador -> Resetar a configuração -> Chamar outro técnico -> Trocar a fonte.',
      '1. Sintoma (coletar relato) -> 2. Hipótese (elaborar causa provável) -> 3. Teste (coletar evidências) -> 4. Resultado -> 5. Correção padronizada -> 6. Validação e Relatório de Causa Raiz.',
      'Reiniciar todos os aparelhos ao mesmo tempo sem inspecionar logs.',
      'Excluir as regras de firewall e esperar o cliente reclamar.'
    ],
    correct_index: 1,
    explanation: 'O método científico padronizado de suporte de engenharia consiste em: Sintoma -> Hipótese -> Teste de Evidência -> Resultado -> Correção -> Validação final e Documentação.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m12_4',
    module_id: 'm12',
    question_text: 'Um cliente corporativo reclama de perda intermitente de pacotes apenas em horários de pico. Qual comando no RouterOS permite inspecionar erros físicos de camada 1 (como CRC errors, drops e colisões) na porta Ethernet?',
    options: [
      '/interface ethernet print stats',
      '/system license print',
      '/ip cloud print',
      '/user print'
    ],
    correct_index: 0,
    explanation: 'A inspeção de estatísticas de interface (/interface ethernet print stats) revela erros de CRC, pacotes descartados por buffer (rx-drop/tx-drop) e problemas de negociação de velocidade física.',
    question_type: 'scenario'
  },

  // ==========================================
  // MÓDULO 13: Instalação de MikroTik em Empresas
  // ==========================================
  {
    id: 'q_m13_1',
    module_id: 'm13',
    question_text: 'Quais são as 5 etapas cronológicas obrigatórias de um projeto profissional de implantação de MikroTik em clientes corporativos?',
    options: [
      'Comprar o roteador -> Ligar na tomada -> Dar a senha para o cliente -> Ir embora -> Mandar a fatura.',
      '1. Levantamento Técnico -> 2. Planejamento e Topologia -> 3. Instalação Física e Rack -> 4. Configuração e Hardening -> 5. Testes de Homologação e Entrega com Documentação.',
      'Formatar o computador do cliente -> Trocar as lâmpadas -> Configurar o Wi-Fi -> Fazer backup.',
      'Apenas configuração remota sem visita presencial.'
    ],
    correct_index: 1,
    explanation: 'A padronização corporativa exige seguir as 5 etapas estruturadas: Levantamento de requisitos -> Planejamento técnico -> Instalação física conforme normas -> Configuração segura -> Homologação com termo de aceite.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m13_2',
    module_id: 'm13',
    question_text: 'Durante a etapa de instalação física em rack corporativo, qual prática técnica de infraestrutura é indispensável para proteger a RouterBOARD contra queima por surtos elétricos induzidos em cabos de rede externos?',
    options: [
      'Pintar o rack com tinta isolante.',
      'Aterramento elétrico adequado do chassi do equipamento, uso de patch panel com conectores blindados (FTP/STP) e protetores de surto homologados nas interfaces de cabos externos.',
      'Ligar o roteador em tomada sem pino terra.',
      'Enrolar os cabos de rede em volta dos cabos de energia de 220V.'
    ],
    correct_index: 1,
    explanation: 'Descargas atmosféricas e induções eletrostáticas exigem aterramento do chassi e cabeamento blindado aterrado para drenar surtos elétricos antes que atinjam os transformadores de pulso Ethernet.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m13_3',
    module_id: 'm13',
    question_text: 'Ao dimensionar um roteador MikroTik para uma empresa com 50 colaboradores utilizando VoIP, tráfego pesado de arquivos, câmeras IP e Wi-Fi de visitantes, qual equipamento atende adequadamente esses requisitos de hardware?',
    options: [
      'Um roteador doméstico básico com 16 MB de RAM.',
      'Uma RouterBOARD com processador multicore (ex: RB4011 ou RB5009) com 1 GB de RAM e portas Gigabit/10G SFP+ dedicadas.',
      'Um rádio de torre de transmissão.',
      'Qualquer equipamento MikroTik tem a mesma capacidade.'
    ],
    correct_index: 1,
    explanation: 'Empresas com 50 usuários e múltiplos serviços demandam roteadores com boa memória RAM (mínimo 1GB) e CPU multicore de arquitetura ARM para sustentar conexões conntrack, queues e firewall sem lentidão.',
    question_type: 'scenario'
  },
  {
    id: 'q_m13_4',
    module_id: 'm13',
    question_text: 'O que deve constar obrigatoriamente no Termo de Homologação e Entrega Técnica assinado pelo cliente ao finalizar a implantação?',
    options: [
      'Apenas o valor pago pelo serviço.',
      'Diagrama da topologia atualizado, plano de endereçamento IP e VLANs, resultados dos testes de velocidade e failover, orientações de contato com o suporte do ISP e confirmação de entrega de backups de segurança.',
      'A senha pessoal do instrutor da empresa.',
      'Uma declaração de que a rede nunca mais precisará de manutenção.'
    ],
    correct_index: 1,
    explanation: 'O termo de homologação encerra o projeto com formalidade técnica: documentação completa da rede entregue, evidências de testes de redundância e comprovação de backup seguro custodiado pelo NOC.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 14: Recursos Avançados
  // ==========================================
  {
    id: 'q_m14_1',
    module_id: 'm14',
    question_text: 'Qual o papel do protocolo OSPF (Open Shortest Path First) no roteamento interno de uma rede de distribuição ou anel de torres de um provedor de internet?',
    options: [
      'Substituir o protocolo Wi-Fi nas casas dos clientes.',
      'Propagar rotas dinamicamente entre múltiplos roteadores e recalcular o menor caminho automaticamente em milissegundos caso um dos enlaces do anel seja rompido.',
      'Emitir notas fiscais eletrônicas.',
      'Bloquear downloads de jogos.'
    ],
    correct_index: 1,
    explanation: 'O OSPF é um protocolo de roteamento dinâmico link-state baseado no algoritmo de Dijkstra. Em topologias de anel ou malha de provedores, ele calcula o caminho mais curto e contorna quedas de fibra automaticamente.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m14_2',
    module_id: 'm14',
    question_text: 'Para que serve o protocolo VRRP (Virtual Router Redundancy Protocol) implementado em dois roteadores MikroTik conectados à mesma rede local corporativa?',
    options: [
      'Para criar uma rede sem fio de alta potência.',
      'Criar um endereço IP virtual compartilhado (Virtual IP Gateway) onde um roteador atua como Master e o outro como Backup: se o Master falhar, o Backup assume o tráfego sem que os usuários percebam.',
      'Aumentar o clock do processador.',
      'Compartilhar arquivos em pastas do Windows.'
    ],
    correct_index: 1,
    explanation: 'O VRRP fornece alta disponibilidade (HA) de primeiro salto em camada 3. Dois equipamentos compartilham o mesmo IP de gateway padrão dos clientes; na falha de um hardware, o segundo assume sem interrupção de serviço.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m14_3',
    module_id: 'm14',
    question_text: 'Qual ferramenta nativa do RouterOS monitora periodicamente a resposta a ping de um endereço IP e pode disparar scripts automatizados quando o host ficar inacessível (down) ou retornar (up)?',
    options: [
      '/tool netwatch',
      '/system reboot',
      '/ip ipsec policy print',
      '/tool graphing'
    ],
    correct_index: 0,
    explanation: 'O Netwatch (/tool netwatch) monitora a disponibilidade de hosts na rede e executa scripts nos eventos "On Up" e "On Down", permitindo automatizar alertas por e-mail, comutações e notificações.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m14_4',
    module_id: 'm14',
    question_text: 'Em qual cenário técnico um provedor de internet (ISP) deve utilizar o protocolo BGP (Border Gateway Protocol)?',
    options: [
      'Apenas para configurar a impressora do escritório.',
      'Para estabelecer sessões de roteamento externo com operadoras de trânsito e pontos de troca de tráfego (IX.br), anunciando o bloco de IP próprio e ASN (Autonomous System Number) do provedor.',
      'Para cadastrar novos técnicos de campo.',
      'Para formatar cartões MicroSD.'
    ],
    correct_index: 1,
    explanation: 'O BGP é o protocolo de roteamento inter-domínio que conecta o Sistema Autônomo (ASN) do provedor à internet global, permitindo múltiplos trânsitos internacionais e conexão a IXPs com redundância.',
    question_type: 'multiple_choice'
  },

  // ==========================================
  // MÓDULO 15: Padrões Operacionais da Equipe Técnica
  // ==========================================
  {
    id: 'q_m15_1',
    module_id: 'm15',
    question_text: 'De acordo com o POP-06 (Alteração Segura de Firewall), qual é a regra de ouro que todo técnico deve seguir antes de aplicar qualquer alteração em produção?',
    options: [
      'Executar as alterações no horário de almoço sem avisar ninguém.',
      'Ter autorização prévia de mudança (GMUD), realizar o backup atual da configuração, ativar o Safe Mode (F4) antes da edição e validar o resultado com testes de conectividade.',
      'Desligar o monitor do computador.',
      'Reiniciar a RouterBOARD antes de começar.'
    ],
    correct_index: 1,
    explanation: 'Boas práticas operacionais exigem: aprovação de mudança, backup preventivo pré-alteração, ativação obrigatória do Safe Mode e bateria de testes de validação pós-aplicação.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m15_2',
    module_id: 'm15',
    question_text: 'Em caso de pane de software em que a RouterBOARD não inicia o RouterOS e não responde nem por IP nem por MAC no WinBox, qual utilitário oficial MikroTik via rede Ethernet reinstala o sistema limpo de fábrica?',
    options: [
      'Netinstall (utilitário oficial executado via cabo de rede na porta ether1/boot com servidor BOOTP/PXE)',
      'Windows Update',
      'Format C: no prompt do Windows',
      'WinZip'
    ],
    correct_index: 0,
    explanation: 'O Netinstall é a ferramenta oficial de recuperação de baixo nível da MikroTik. Ele reinstala o kernel RouterOS na memória flash através de boot de rede (BOOTP/TFTP) na porta ether1.',
    question_type: 'multiple_choice'
  },
  {
    id: 'q_m15_3',
    module_id: 'm15',
    question_text: 'Em uma substituição emergencial de equipamento queimado em campo (POP-02), por que o técnico deve preferir importar o script `.rsc` em vez de restaurar um arquivo binário `.backup` se o novo roteador for de modelo diferente?',
    options: [
      'Porque o arquivo .backup carrega drivers, licenças de hardware e nomes de interfaces do modelo antigo, podendo causar instabilidade ou corrupção de drivers em modelos distintos; o script .rsc aplica comandos limpos.',
      'Porque o arquivo .rsc é mais colorido.',
      'Porque o arquivo .backup apaga o número de série da nova placa.',
      'Não há diferença técnica, qualquer modelo aceita qualquer backup binário.'
    ],
    correct_index: 0,
    explanation: 'Backups binários (.backup) contêm vinculações estritas com o hardware original (MACs, drivers específicos de chip switch). Para migrar configurações entre modelos diferentes, a melhor prática é utilizar o script `/export` (.rsc).',
    question_type: 'scenario'
  },
  {
    id: 'q_m15_4',
    module_id: 'm15',
    question_text: 'O que é o Relatório de Causa Raiz (RCA) elaborado pela equipe técnica após um incidente de queda de rede e qual seu objetivo principal?',
    options: [
      'Um documento para encontrar um culpado e aplicar punições.',
      'Um relatório técnico estruturado que documenta a linha do tempo da falha, a causa primária identificada, a correção aplicada e as ações preventivas para garantir que o mesmo problema nunca mais volte a acontecer.',
      'A fatura mensal cobrada do cliente.',
      'O comprovante de abastecimento do veículo da empresa.'
    ],
    correct_index: 1,
    explanation: 'O Relatório de Causa Raiz (Root Cause Analysis - RCA) é a ferramenta de governança técnica que transforma incidentes em melhorias permanentes de processos e arquitetura de rede.',
    question_type: 'multiple_choice'
  }
];

export const allLessons = [
  // Módulo 1 Aula 1
  {
    id: 'l_m1_1',
    module_id: 'm1',
    lesson_number: 1,
    title: 'Arquitetura TCP/IP, Endereçamento IPv4 e Cálculo de Sub-redes CIDR',
    duration_minutes: 50,
    content: {
      objective: 'Ensinar os fundamentos de arquitetura TCP/IP, cálculo de máscaras de sub-rede CIDR (/24 a /30), planejamento de plano de endereçamento para provedores e identificação de falhas de comunicação.',
      simple_theory: 'Cada computador ou roteador na rede precisa de um número de identificação único chamado endereço IP. A máscara de sub-rede determina onde termina a identificação da rua (rede) e onde começa o número da casa (host).',
      technical_concepts: 'O modelo TCP/IP organiza a comunicação em 4 camadas (Aplicação, Transporte, Internet e Acesso à Rede). O cálculo CIDR (Classless Inter-Domain Routing) utiliza notação com barra (ex: /29) indicando a quantidade de bits fixos de rede. Em uma máscara /30 (utilizada em links ponto a ponto de provedor), restam 2 bits para hosts (4 endereços: rede, 2 IPs úteis e broadcast). O gateway atua como roteador padrão para destinos fora do domínio de broadcast local.',
      real_application: 'Ao ativar um novo cliente corporativo com link dedicado, o provedor entrega um bloco /29 com 6 endereços públicos utilizáveis. O técnico precisa configurar o primeiro IP no MikroTik e entregar os demais para o firewall e servidores do cliente.',
      topology: {
        type: 'ip_cidr',
        title: 'Topologia de Bloco CIDR /29 Entregue pelo ISP',
        description: 'Bloco 203.0.113.0/29: Gateway ISP em 203.0.113.1 e MikroTik Cliente em 203.0.113.2.',
        devices: [
          { name: 'Roteador Borda ISP', ip: '203.0.113.1/29 (Gateway ISP)', port: 'Fibra Óptica' },
          { name: 'MikroTik Cliente ether1', ip: '203.0.113.2/29 (IP Fixo Dedicado)', port: 'ether1' },
          { name: 'Firewall / Servidores', ip: '203.0.113.3 a 203.0.113.6', port: 'DMZ Corporativa' }
        ]
      },
      prerequisites: ['Conhecimento básico de computadores', 'Noções de sistema binário e decimal'],
      step_by_step: [
        '1. Calcule os parâmetros do bloco IP fornecido pela operadora (Rede, Primeiro IP útil, Último IP útil e Broadcast).',
        '2. Acesse o MikroTik via WinBox na porta ether2.',
        '3. Acesse o menu IP -> Addresses e clique em [+].',
        '4. Insira o endereço com a máscara CIDR correta no formato: 203.0.113.2/29.',
        '5. Selecione a interface física de entrada WAN (ether1).',
        '6. Valide se a tabela calcula automaticamente a coluna "Network" como 203.0.113.0.'
      ],
      winbox_steps: [
        'IP -> Addresses -> [+] -> Address: 203.0.113.2/29 -> Interface: ether1 -> Apply -> OK',
        'IP -> Routes -> [+] -> Dst. Address: 0.0.0.0/0 -> Gateway: 203.0.113.1 -> Apply -> OK'
      ],
      cli_commands: [
        '# Configurar IP estatico publico /29 na interface WAN\n/ip address add address=203.0.113.2/29 interface=ether1 comment="Link Dedicado ISP /29"\n',
        '# Configurar rota de saida apontando para o gateway do bloco\n/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1 distance=1 comment="Default Gateway ISP"\n'
      ],
      command_explanations: [
        { cmd: '/ip address add address=203.0.113.2/29 ...', exp: 'Configura o endereço L3 e a máscara de rede. O RouterOS calcula a rede conectada e a adiciona à tabela FIB.' },
        { cmd: '/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1', exp: 'Cria a rota estática default apontando para o IP do roteador do provedor dentro da sub-rede /29.' }
      ],
      expected_output: 'No menu IP Addresses, a entrada exibe status ativo sem flags de erro. O comando `/ping 203.0.113.1 count=4` no terminal responde em < 1ms.',
      validation_tests: [
        'Teste 1: Execute `/ping 203.0.113.1` e valide 0% de perda de pacotes.',
        'Teste 2: Digite `/ip route print` e confirme a flag AS (Active Static) na rota 0.0.0.0/0.'
      ],
      common_gotchas: [
        'Erro 1: Configurar a máscara como /24 em vez de /29. O roteador tentará enviar pacotes locais via ARP para IPs que pertencem à internet.',
        'Erro 2: Tentar usar o endereço de rede (203.0.113.0) ou de broadcast (203.0.113.7) na interface.'
      ],
      diagnostic_procedure: [
        '1. Verifique se o IP configurado pertence à mesma sub-rede do gateway.',
        '2. Execute `/ip arp print` para checar se o endereço MAC do gateway foi resolvido.'
      ],
      security_measures: [
        'Nunca configure blocos de IP públicos na interface local de estações sem firewall ativo.',
        'Documente sempre o plano de sub-redes em planilha técnica do provedor.'
      ],
      practical_exercise: 'Em um roteador de bancada, calcule a sub-rede para o bloco 192.168.100.0/28. Identifique a quantidade de IPs utilizáveis, o primeiro e o último IP e configure na interface ether2.',
      completion_criteria: 'O técnico deve dominar o cálculo de sub-redes /24, /28, /29 e /30 sem calculadoras externas e aplicá-lo no RouterOS com segurança.'
    }
  },

  // Módulo 2 Aula 1
  {
    id: 'l_m2_1',
    module_id: 'm2',
    lesson_number: 1,
    title: 'Hardware RouterBOARD, Critérios de Escolha e RouterOS v6 vs v7',
    duration_minutes: 45,
    content: {
      objective: 'Capacitar o colaborador a compreender a arquitetura dos equipamentos MikroTik, dimensionar processador, memória RAM e interfaces para projetos corporativos e diferenciar RouterOS v6 e v7.',
      simple_theory: 'A MikroTik fabrica o hardware físico (RouterBOARD) e desenvolve o sistema operacional que roda dentro dele (RouterOS). Escolher o modelo certo evita que o equipamento trave por falta de memória ou superaquecimento quando a empresa crescer.',
      technical_concepts: 'As RouterBOARDs utilizam diversas arquiteturas de CPU (MIPS, ARM32, ARM64 e x86/Tile). O processamento de pacotes por software (FastPath) consome ciclos de CPU, enquanto switches da linha CRS utilizam chips de comutação dedicados (Marvell/Atheros) com comutação L2 por hardware. O RouterOS v7 introduziu kernel Linux moderno (5.x) com suporte nativo a 64 bits, WireGuard e WifiWave2.',
      real_application: 'Em um cliente com link de 1 Gbps, colocar uma RB750Gr3 causará lentidão com regras avançadas de firewall ativas. O técnico aprende a recomendar uma RB4011 ou RB5009 que suporta 1 Gbps real com folga de processamento.',
      topology: {
        type: 'hardware_tiers',
        title: 'Hierarquia de Hardware MikroTik no Provedor',
        description: 'Borda ISP (CCR2004) -> Distribuição (CRS326) -> Acesso Corporativo (RB5009).',
        devices: [
          { name: 'Core ISP: CCR2004-16G-2S+', ip: 'Borda BGP / Trânsito 10G', port: 'SFP+ 10Gbps' },
          { name: 'Distribuição: CRS328-24P-4S+', ip: 'Switch L2 PoE com HW-Offload', port: 'SFP+ Trunk' },
          { name: 'Cliente Corporativo: RB5009UG+S+', ip: 'Gateway Empresa 50 usuários', port: 'ether1 2.5G' }
        ]
      },
      prerequisites: ['Conhecimento dos conceitos básicos de redes', 'Acesso ao catálogo de hardware em mikrotik.com'],
      step_by_step: [
        '1. Acesse o WinBox e conecte-se ao equipamento.',
        '2. Abra o menu System -> Resources.',
        '3. Inspecione a arquitetura de CPU, quantidade de núcleos, frequência em MHz e memória RAM disponível.',
        '4. Abra o menu System -> Routerboard para verificar a versão atual do firmware da placa.',
        '5. Se o "Upgrade Firmware" for superior ao "Current Firmware", clique em "Upgrade" e reinicie o equipamento.'
      ],
      winbox_steps: [
        'System -> Resources (Inspecionar CPU, RAM e Versão)',
        'System -> Routerboard -> Upgrade -> Reboot'
      ],
      cli_commands: [
        '/system resource print\n',
        '/system routerboard print\n',
        '/system routerboard upgrade\n/system reboot\n'
      ],
      command_explanations: [
        { cmd: '/system resource print', exp: 'Exibe tempo de atividade (uptime), versão do RouterOS, memória RAM livre e carga do processador em tempo real.' },
        { cmd: '/system routerboard upgrade', exp: 'Grava o firmware mais recente na BIOS da RouterBOARD, garantindo estabilidade e correções elétricas das portas.' }
      ],
      expected_output: 'O comando exibe a versão 7.x estável, memória livre e a confirmação de firmware atualizado.',
      validation_tests: [
        'Teste 1: Valide se a memória RAM livre está acima de 50%.',
        'Teste 2: Confirme se a versão do firmware em `/system routerboard print` é idêntica à versão do RouterOS.'
      ],
      common_gotchas: [
        'Erro comum: Atualizar os pacotes do RouterOS e esquecer de atualizar o firmware RouterBOARD em System -> Routerboard, gerando reinicializações aleatórias.'
      ],
      diagnostic_procedure: [
        'Se o roteador reiniciar sozinho: Verifique `/log print where topics~"error"` e inspecione a voltagem da fonte em System -> Health.'
      ],
      security_measures: [
        'Nunca desligue a fonte de alimentação durante o processo de gravação de firmware (upgrade).'
      ],
      practical_exercise: 'Inspecione três equipamentos diferentes de laboratório (um hEX, um hAP e um CRS). Registre arquitetura de CPU, núcleos e nível de licença de cada um.',
      completion_criteria: 'O técnico deve ser capaz de escolher a RouterBOARD ideal para qualquer cenário corporativo de 5 a 200 usuários sem erro de dimensionamento.'
    }
  },

  // Módulo 5 Aula 1
  {
    id: 'l_m5_1',
    module_id: 'm5',
    lesson_number: 1,
    title: 'DHCP Server, Pools de Endereçamento e Servidor DNS Cache',
    duration_minutes: 50,
    content: {
      objective: 'Capacitar o técnico a configurar o servidor DHCP corporativo com pools restritos, leases estáticos para equipamentos críticos, gateway/DNS distribuídos e proteção contra invasões.',
      simple_theory: 'O DHCP é o carteiro da rede local: quando um computador novo é ligado, ele pede um endereço e o servidor entrega automaticamente um IP, a máscara, o gateway de saída e os servidores DNS para navegação.',
      technical_concepts: 'O protocolo DHCP opera nas portas UDP 67 (servidor) e 68 (cliente) através das quatro fases DORA (Discover, Offer, Request, Acknowledge). O RouterOS gerencia o pool de endereços em `/ip pool`. O parâmetro Lease Time define o tempo de renovação. O DNS local atua como cache recursivo com o parâmetro `allow-remote-requests=yes`.',
      real_application: 'Em uma clínica médica com 30 computadores e 5 impressoras de rede, o técnico configura o DHCP com entrega automática para estações e fixa os IPs das impressoras por MAC address, garantindo que o sistema de prontuários nunca perca a comunicação.',
      topology: {
        type: 'dhcp_lan',
        title: 'Topologia de Distribuição DHCP e DNS Local',
        description: 'Servidor DHCP ativo na bridge-lan distribuindo 192.168.10.100-192.168.10.200 com leases estáticos.',
        devices: [
          { name: 'MikroTik DHCP Server', ip: '192.168.10.1/24 (Gateway e DNS)', port: 'bridge-lan' },
          { name: 'PC Recepção', ip: '192.168.10.105 (Lease Dinâmico)', port: 'ether2' },
          { name: 'Impressora Fiscal', ip: '192.168.10.50 (Lease Estático por MAC)', port: 'ether3' }
        ]
      },
      prerequisites: ['Bridge criada e com endereço IP configurado', 'Compreensão do protocolo UDP'],
      step_by_step: [
        '1. Crie o pool de endereços: Menu IP -> Pool -> [+] -> Name: pool-lan -> Ranges: 192.168.10.100-192.168.10.200.',
        '2. Configure a rede do DHCP: Menu IP -> DHCP Server -> Networks -> [+] -> Address: 192.168.10.0/24 -> Gateway: 192.168.10.1 -> DNS Servers: 192.168.10.1.',
        '3. Crie o serviço DHCP: Menu IP -> DHCP Server -> [+] -> Interface: bridge-lan -> Address Pool: pool-lan -> Lease Time: 08:00:00.',
        '4. Habilite o DNS local: Menu IP -> DNS -> Servers: 1.1.1.1, 8.8.8.8 -> Marque "Allow Remote Requests".',
        '5. Adicione regra de firewall bloqueando consultas DNS vindas da interface WAN.'
      ],
      winbox_steps: [
        'IP -> DHCP Server -> DHCP Setup (Assistente Rápido) -> Interface: bridge-lan -> Next até concluir',
        'IP -> DHCP Server -> Leases -> Selecionar cliente -> Make Static -> OK'
      ],
      cli_commands: [
        '/ip pool add name=pool-lan ranges=192.168.10.100-192.168.10.200\n',
        '/ip dhcp-server network add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=192.168.10.1 comment="Rede Corporativa"\n',
        '/ip dhcp-server add name=dhcp-lan interface=bridge-lan address-pool=pool-lan lease-time=8h disabled=no\n',
        '/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes\n'
      ],
      command_explanations: [
        { cmd: '/ip pool add name=pool-lan ranges=...', exp: 'Reserva a faixa de IPs que o servidor pode entregar aos clientes dinâmicos.' },
        { cmd: '/ip dhcp-server network add ...', exp: 'Define os parâmetros L3 (gateway, DNS e domínio) injetados nos clientes.' }
      ],
      expected_output: 'Clientes conectados recebem IP 192.168.10.x com gateway 192.168.10.1. A aba Leases exibe os equipamentos com a flag "D" (Dynamic) ou "S" (Static).',
      validation_tests: [
        'Teste 1: Conecte um computador e execute `ipconfig /renew` no Windows. Valide se recebe IP do pool.',
        'Teste 2: No terminal do computador, digite `nslookup google.com` e confirme se o servidor que responde é 192.168.10.1.'
      ],
      common_gotchas: [
        'Gotcha Crítico: Não configurar a aba "Networks" do DHCP Server. O cliente recebe o IP, mas fica sem Gateway e sem DNS, impossibilitado de navegar.'
      ],
      diagnostic_procedure: [
        'Verifique `/ip dhcp-server print` para checar se o servidor não está desativado (flag X) ou com erro de interface (flag I).'
      ],
      security_measures: [
        'Crie regra de firewall bloqueando consultas DNS externas (porta 53 na interface WAN).'
      ],
      practical_exercise: 'Configure um servidor DHCP em bancada. Conecte seu notebook, capture o lease e torne-o estático alterando o IP para .55. Verifique a renovação.',
      completion_criteria: 'O técnico deve ser capaz de criar, diagnosticar e resolver qualquer falha de DHCP e DNS em clientes corporativos.'
    }
  },

  // Módulo 9 Aula 1
  {
    id: 'l_m9_1',
    module_id: 'm9',
    lesson_number: 1,
    title: 'Planejamento de Wi-Fi Corporativo, Canais e WifiWave2',
    duration_minutes: 50,
    content: {
      objective: 'Ensinar o planejamento de canais sem sobreposição (2.4GHz e 5GHz), mitigação de interferências, implementação de WPA2/WPA3 corporativo e múltiplos SSIDs com isolamento de VLANs.',
      simple_theory: 'O sinal Wi-Fi viaja pelo ar através de frequências de rádio. Se vários roteadores transmitem no mesmo canal, as ondas colidem e os celulares ficam lentos e caindo. Planejar canais e potências garante sinal estável por toda a empresa.',
      technical_concepts: 'Em 2.4 GHz, apenas os canais 1, 6 e 11 não se sobrepõem em 20 MHz. Em 5 GHz, a banda é mais larga permitindo canais de 40 MHz e 80 MHz com tecnologia DFS (Dynamic Frequency Selection). O pacote WifiWave2 do RouterOS v7 suporta o padrão 802.11ax (Wi-Fi 6), autenticação WPA3-SAE resistente a ataques de dicionário e Fast Transition (802.11r).',
      real_application: 'Em um escritório com 40 notebooks, o técnico distribui 2 Access Points: o primeiro configurado no canal 1 em 2.4GHz e canal 36 em 5GHz; o segundo no canal 6 em 2.4GHz e canal 149 em 5GHz. Os usuários circulam pelo prédio sem sofrer quedas de chamada ou lentidão.',
      topology: {
        type: 'wifi_ap_deployment',
        title: 'Topologia Wi-Fi Corporativa com Dual Band e VLANs',
        description: 'Access Point MikroTik transmitindo SSID Corporativo (VLAN 10) e SSID Visitantes (VLAN 30).',
        devices: [
          { name: 'MikroTik Gateway RB5009', ip: '10.10.10.1 (VLAN 10) e 172.16.30.1 (VLAN 30)', port: 'Core Router' },
          { name: 'AP MikroTik cAP ax', ip: '10.10.10.2 (Gerência)', port: 'Canal 1 (2.4G) e Canal 36 (5G)' },
          { name: 'SSID "EMPRESA-CORP"', ip: 'VLAN 10 (Acesso a servidores)', port: 'WPA2/WPA3 PSK' },
          { name: 'SSID "EMPRESA-GUEST"', ip: 'VLAN 30 (Apenas internet)', port: 'Virtual AP isolado' }
        ]
      },
      prerequisites: ['Conhecimento sobre VLANs 802.1Q', 'Conceitos de espectro eletromagnético'],
      step_by_step: [
        '1. Acesse o menu Wireless / WiFi no WinBox.',
        '2. Configure a interface física de 2.4 GHz: Channel Width: 20MHz -> Frequency: 2412 (Canal 1).',
        '3. Configure a interface física de 5 GHz: Channel Width: 20/40/80MHz -> Frequency: 5180 (Canal 36).',
        '4. Crie o perfil de segurança com WPA2-PSK e WPA3-SAE.',
        '5. Crie a interface Virtual AP para os visitantes vinculada à VLAN 30.',
        '6. Ative o isolamento de clientes (Client Isolation) para que visitantes não comuniquem entre si.'
      ],
      winbox_steps: [
        'Wireless -> Security Profiles -> [+] -> Mode: dynamic keys, WPA2/WPA3 -> Apply',
        'Wireless -> Interfaces -> wlan1 -> Channel Width: 20MHz, Frequency: 2412, Band: 2GHz-only-N -> OK',
        'Wireless -> [+] -> Virtual -> SSID: VISITANTES, VLAN Mode: use tag, VLAN ID: 30 -> OK'
      ],
      cli_commands: [
        '/interface wireless security-profiles add name=sec-corp mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key="SenhaForteCorp2026"\n',
        '/interface wireless set [find default-name=wlan1] ssid="EMPRESA-CORP" frequency=2412 channel-width=20mhz band=2ghz-g/n security-profile=sec-corp disabled=no\n',
        '/interface wireless add name=wlan-guest master-interface=wlan1 ssid="EMPRESA-GUEST" vlan-mode=use-tag vlan-id=30 default-forwarding=no disabled=no\n'
      ],
      command_explanations: [
        { cmd: 'channel-width=20mhz band=2ghz-g/n', exp: 'Fixa canal em 20 MHz para evitar poluição espectral e colisões com redes vizinhas em 2.4 GHz.' },
        { cmd: 'default-forwarding=no', exp: 'Ativa isolamento de estações (Client Isolation): visitantes conectados na mesma rede sem fio não conseguem escanear os celulares uns dos outros.' }
      ],
      expected_output: 'As redes "EMPRESA-CORP" e "EMPRESA-GUEST" são visíveis nos celulares com sinal forte e estável. Clientes convidados recebem IP da VLAN 30 e navegam isolados.',
      validation_tests: [
        'Teste 1: Conecte no Wi-Fi corporativo e valide acesso aos servidores locais.',
        'Teste 2: Conecte no Wi-Fi de visitantes e tente pingar 10.10.10.1. A conexão deve ser bloqueada.'
      ],
      common_gotchas: [
        'Erro 1: Ativar 40 MHz em 2.4 GHz em prédios comerciais, causando desconexões frequentes.',
        'Erro 2: Usar potência máxima (30 dBm), provocando "problema do cliente oculto" (o celular enxerga o roteador, mas o roteador não escuta o sinal fraco do celular).'
      ],
      diagnostic_procedure: [
        'Utilize `/interface wireless scan` para mapear canais ocupados por roteadores vizinhos antes de escolher a frequência.'
      ],
      security_measures: [
        'Nunca deixe redes de visitantes sem senha de acesso e sem isolamento de camada 2.'
      ],
      practical_exercise: 'Realize uma varredura com a ferramenta Snooper ou Scan em um roteador wireless. Identifique o canal mais limpo na sua região e aplique a configuração.',
      completion_criteria: 'O técnico deve saber dimensionar potências, posicionamento de antenas e isolamento de redes corporativas sem gerar interferência.'
    }
  },

  // Módulo 10 Aula 1
  {
    id: 'l_m10_1',
    module_id: 'm10',
    lesson_number: 1,
    title: 'VPN WireGuard no RouterOS v7: Interligação Matriz-Filial e Acesso Remoto',
    duration_minutes: 55,
    content: {
      objective: 'Capacitar o técnico a configurar túneis seguros site-to-site entre matriz e filial e acesso remoto de técnicos utilizando WireGuard no RouterOS v7 com criptografia assimétrica moderna.',
      simple_theory: 'Uma VPN cria um túnel criptografado e invisível passando pela internet pública. É como se passássemos um cabo de rede blindado de quilômetros de distância entre o escritório de São Paulo e a filial do Rio de Janeiro.',
      technical_concepts: 'O WireGuard opera na camada de rede (camada 3) sobre UDP na porta 51820. Ele utiliza chaves de 256 bits geradas por criptografia de curva elíptica Curve25519. O parâmetro `allowed-address` atua como roteador interno e filtro: pacotes só entram e saem do túnel se o IP de origem e destino estiverem explicitamente autorizados na lista.',
      real_application: 'A filial da empresa precisa acessar o sistema ERP hospedado no servidor da matriz. O técnico sobe um túnel WireGuard entre as duas RouterBOARDs, permitindo que a filial (192.168.20.0/24) converse diretamente com a matriz (192.168.10.0/24) com alta velocidade.',
      topology: {
        type: 'wireguard_tunnel',
        title: 'Túnel WireGuard Matriz e Filial',
        description: 'Túnel VPN ponto a ponto sobre UDP 51820 interligando as redes 192.168.10.0/24 e 192.168.20.0/24.',
        devices: [
          { name: 'Matriz (IP Fixo Público: 200.50.1.10)', ip: 'WireGuard: 10.255.0.1/30 | LAN: 192.168.10.1/24', port: 'UDP 51820' },
          { name: 'Filial (IP Dinâmico)', ip: 'WireGuard: 10.255.0.2/30 | LAN: 192.168.20.1/24', port: 'Endpoint Matriz' }
        ]
      },
      prerequisites: ['RouterOS v7 instalado em ambas as pontas', 'IP público fixo ou DDNS na Matriz'],
      step_by_step: [
        '1. Na Matriz: Crie a interface WireGuard: `/interface wireguard add name=wg-corp listen-port=51820`.',
        '2. Configure o IP do túnel na Matriz: `/ip address add address=10.255.0.1/30 interface=wg-corp`.',
        '3. Copie a chave pública (Public Key) gerada na Matriz.',
        '4. Na Filial: Crie a interface WireGuard e adicione o peer apontando para a Matriz (Endpoint: 200.50.1.10:51820).',
        '5. Adicione as rotas para as redes remotas em ambas as pontas.',
        '6. Libere a porta UDP 51820 no firewall input da Matriz.'
      ],
      winbox_steps: [
        'WireGuard -> [+] -> Name: wg-corp, Listen Port: 51820 -> OK',
        'IP -> Addresses -> [+] -> Address: 10.255.0.1/30, Interface: wg-corp -> OK',
        'WireGuard -> Peers -> [+] -> Interface: wg-corp, Public Key: [Chave da Filial], Allowed Address: 10.255.0.2/32, 192.168.20.0/24 -> OK',
        'IP -> Routes -> [+] -> Dst. Address: 192.168.20.0/24, Gateway: 10.255.0.2 -> OK'
      ],
      cli_commands: [
        '# 1. Criar interface WireGuard na Matriz\n/interface wireguard add name=wg-matriz listen-port=51820\n/ip address add address=10.255.0.1/30 interface=wg-matriz\n',
        '# 2. Adicionar o Peer da Filial na Matriz\n/interface wireguard peers add interface=wg-matriz public-key="CHAVE_PUBLICA_FILIAL_ABC123" allowed-address=10.255.0.2/32,192.168.20.0/24 comment="Peer Filial"\n',
        '# 3. Criar rota para a rede local da filial via tunel\n/ip route add dst-address=192.168.20.0/24 gateway=10.255.0.2 comment="Rota LAN Filial via WireGuard"\n',
        '# 4. Autorizar a porta UDP 51820 no firewall input da Matriz\n/ip firewall filter add chain=input protocol=udp dst-port=51820 action=accept comment="Permite WireGuard VPN"\n'
      ],
      command_explanations: [
        { cmd: 'allowed-address=10.255.0.2/32,192.168.20.0/24', exp: 'Instrui o WireGuard a aceitar e enviar pacotes apenas para esses IPs, garantindo isolamento total de tráfego.' },
        { cmd: '/ip route add dst-address=192.168.20.0/24 gateway=10.255.0.2', exp: 'Ensina a tabela de rotas do roteador da Matriz que pacotes destinados à Filial devem entrar pelo túnel WireGuard.' }
      ],
      expected_output: 'Na aba Peers do WinBox, o campo "last handshake" exibe tempo recente (ex: "5s ago") e os contadores de Tx e Rx aumentam continuamente. O ping entre 192.168.10.1 e 192.168.20.1 responde com sucesso.',
      validation_tests: [
        'Teste 1: Do terminal da Matriz, execute `/ping 10.255.0.2 count=4` e confirme 0% packet loss.',
        'Teste 2: De um computador na Filial, acesse a pasta compartilhada ou servidor web na Matriz (192.168.10.x).'
      ],
      common_gotchas: [
        'Erro comum: Esquecer de liberar a porta UDP 51820 no chain input do firewall da Matriz.',
        'Erro 2: Errar o campo allowed-address (ex: esquecer de incluir a sub-rede da rede local remota).'
      ],
      diagnostic_procedure: [
        'Se o handshake não ocorrer: Inspecione o relógio do roteador em `/system clock print`. Se o horário dos roteadores estiver divergente em horas, o handshake criptográfico falha.'
      ],
      security_measures: [
        'Nunca compartilhe a Private Key (Chave Privada) do roteador; apenas a Public Key deve ser transmitida.'
      ],
      practical_exercise: 'Configure um túnel WireGuard entre duas RouterBOARDs de laboratório. Estabeleça a rota e confirme o handshake ativo.',
      completion_criteria: 'O técnico deve ser capaz de criar, diagnosticar e homologar VPNs WireGuard de alto desempenho em minutos.'
    }
  },

  // Módulo 11 Aula 1
  {
    id: 'l_m11_1',
    module_id: 'm11',
    lesson_number: 1,
    title: 'Controle de Banda Profissional com Simple Queues e Algoritmo PCQ',
    duration_minutes: 45,
    content: {
      objective: 'Ensinar o técnico a limitar velocidades de internet de forma estática e dinâmica, aplicar o algoritmo PCQ para divisão justa de banda e controlar o bufferbloat em clientes corporativos.',
      simple_theory: 'Se um único funcionário iniciar o download de um arquivo muito pesado, ele pode consumir toda a internet da empresa, fazendo a ligação VoIP do diretor cair. O controle de banda é o semáforo que garante que ninguém monopolize o link.',
      technical_concepts: 'O RouterOS implementa o escalonador HTB (Hierarchical Token Bucket). As Simple Queues inspecionam pacotes por IP alvo (target). O parâmetro `limit-at` garante velocidade mínima em momentos de pico, enquanto `max-limit` estipula o teto. O algoritmo PCQ (Per Connection Queue) subdivide automaticamente o tráfego em subfilas balanceadas sem necessidade de regras manuais por IP.',
      real_application: 'Em um hotel com link de 200 Mbps e 100 hóspedes, o técnico aplica uma fila PCQ. Se houver 1 hóspede conectado, ele usa 200 Mbps; se houver 50 hóspedes baixando ao mesmo tempo, cada um recebe exatamente 4 Mbps de forma automática e instantânea.',
      topology: {
        type: 'queue_management',
        title: 'Gerenciamento de Fila com Divisão Dinâmica PCQ',
        description: 'Link WAN de 100 Mbps dividido dinamicamente entre os colaboradores da rede interna.',
        devices: [
          { name: 'Link Internet WAN', ip: '100 Mbps Full Duplex', port: 'ether1' },
          { name: 'MikroTik HTB Engine', ip: 'Simple Queue com PCQ', port: 'bridge-lan' },
          { name: 'Usuários Ativos (1 a 50)', ip: 'Subfilas dinâmicas de banda igualitária', port: 'LAN' }
        ]
      },
      prerequisites: ['Conhecimento sobre taxas de transmissão (kbps, Mbps)', 'Compreensão do fluxo de pacotes no RouterOS'],
      step_by_step: [
        '1. No WinBox, acesse Queues -> Queue Types.',
        '2. Crie o tipo de download: [+] -> Name: pcq-download -> Kind: pcq -> Classifier: Dst. Address.',
        '3. Crie o tipo de upload: [+] -> Name: pcq-upload -> Kind: pcq -> Classifier: Src. Address.',
        '4. Acesse Queues -> Simple Queues -> [+].',
        '5. Defina Name: "Fila-Geral-Empresa" -> Target: 192.168.10.0/24.',
        '6. Defina Max Limit: Upload 50M / Download 100M.',
        '7. Na aba Advanced, selecione Queue Type: pcq-upload e pcq-download.'
      ],
      winbox_steps: [
        'Queues -> Queue Types -> [+] -> Name: pcq-down, Kind: pcq, Classifier: Dst. Address -> OK',
        'Queues -> Simple Queues -> [+] -> Name: Fila-LAN, Target: 192.168.10.0/24, Max-Limit: 50M/100M -> OK'
      ],
      cli_commands: [
        '/queue type add name=pcq-down kind=pcq pcq-classifier=dst-address pcq-rate=0\n/queue type add name=pcq-up kind=pcq pcq-classifier=src-address pcq-rate=0\n',
        '/queue simple add name="Controle-Dinamico-LAN" target=192.168.10.0/24 max-limit=50M/100M queue=pcq-up/pcq-down comment="Divisao Justa PCQ"\n'
      ],
      command_explanations: [
        { cmd: 'pcq-classifier=dst-address', exp: 'Cria uma subfila individual para cada endereço IP de destino que estiver recebendo tráfego na rede local.' },
        { cmd: 'max-limit=50M/100M', exp: 'Estabelece o limite máximo de tráfego que o conjunto da rede local pode puxar da internet.' }
      ],
      expected_output: 'No WinBox, a fila exibe cores dinâmicas: verde (< 50% de uso), amarelo (50% a 75%) e vermelho (> 75% atingindo o teto). Múltiplos downloads simultâneos dividem a banda com precisão milimétrica.',
      validation_tests: [
        'Teste 1: Inicie dois testes de velocidade em dois computadores ao mesmo tempo. Valide se ambos atingem exatamente metade da banda total.',
        'Teste 2: Dispare um ping contínuo durante o download e verifique se a latência permanece baixa e sem perda de pacotes.'
      ],
      common_gotchas: [
        'Atenção ao FastTrack: Se houver regra de fasttrack ativa no firewall, o controle de banda não funcionará, pois os pacotes não passam pelas filas.'
      ],
      diagnostic_procedure: [
        'Se a fila não contabilizar tráfego: Verifique se o campo "Target" cobre a sub-rede correta e desative temporariamente a regra de fasttrack.'
      ],
      security_measures: [
        'Nunca deixe links corporativos sem controle de banda se houver serviços prioritários como telefonia VoIP compartilhando o enlace.'
      ],
      practical_exercise: 'Crie uma Simple Queue limitando seu notebook a 10M de download. Execute um teste no Speedtest e confirme se a curva de velocidade fica travada em 10 Mbps.',
      completion_criteria: 'O técnico deve dominar a criação de filas estáticas e algoritmos dinâmicos PCQ para empresas.'
    }
  },

  // Módulo 12 Aula 1
  {
    id: 'l_m12_1',
    module_id: 'm12',
    lesson_number: 1,
    title: 'Monitoramento Avançado com Torch, Profiler e Metodologia de Causa Raiz',
    duration_minutes: 50,
    content: {
      objective: 'Ensinar o uso das ferramentas Torch, Packet Sniffer, Tool Profile para diagnóstico de 100% de CPU e aplicação da metodologia padronizada ISP de diagnóstico de causa raiz.',
      simple_theory: 'Quando um cliente liga dizendo "a internet está horrível", o técnico não pode chutar ou trocar peças aleatoriamente. Ele usa ferramentas como o Torch e o Profiler para enxergar exatamente quem está gastando a banda ou travando o processador.',
      technical_concepts: 'O Torch faz amostragem em tempo real de pacotes passando por qualquer interface física ou lógica, exibindo a tabela com taxa de Tx/Rx, portas TCP/UDP e endereços IP. A ferramenta `/tool profile` inspeciona a distribuição percentual de CPU entre as threads do kernel. A metodologia padronizada de suporte ISP segue: Sintoma -> Hipótese -> Teste de Evidência -> Resultado -> Correção -> Validação.',
      real_application: 'Em um provedor, o NOC recebe alerta de cliente com 100% de uso de CPU na RB3011. O técnico abre o Profile remotamente e identifica que o processo "firewall" está consumindo 92% devido a uma regra mal configurada com regex L7. Ele ajusta a regra e a CPU cai para 4% em segundos.',
      topology: {
        type: 'monitoring_inspection',
        title: 'Inspeção de Tráfego e Processamento com Ferramentas Nativas',
        description: 'Análise de pacotes na interface WAN e perfil de uso de CPU do processador.',
        devices: [
          { name: 'MikroTik RouterOS Core', ip: 'Profile & Torch ativo', port: 'Kernel RouterOS' },
          { name: 'Interface ether1 (WAN)', ip: 'Inspecionada pelo Torch', port: 'Tráfego Real' },
          { name: 'Estação Infratora', ip: 'Identificada consumindo upload', port: 'LAN' }
        ]
      },
      prerequisites: ['Compreensão de portas e protocolos', 'Acesso ao terminal do RouterOS'],
      step_by_step: [
        '1. Acesse Tools -> Torch no WinBox.',
        '2. Selecione a interface ether1 (ou bridge-lan).',
        '3. Marque as opções: Port, Protocol e IP.',
        '4. Clique em "Start" e ordene a coluna "Tx Rate" de forma decrescente.',
        '5. Identifique o IP interno que estiver consumindo a maior taxa de upload.',
        '6. Para checar o processador: Acesse Tools -> Profile e clique em "Start".'
      ],
      winbox_steps: [
        'Tools -> Torch -> Interface: ether1 -> Start',
        'Tools -> Profile -> Start (Inspecionar uso de CPU por processo)'
      ],
      cli_commands: [
        '/tool torch interface=ether1 port=any protocol=any\n',
        '/tool profile cpu=all\n',
        '/log print where topics~"error" or topics~"warning"\n'
      ],
      command_explanations: [
        { cmd: '/tool torch interface=ether1', exp: 'Inicia a captura de fluxos em tempo real na interface especificada.' },
        { cmd: '/tool profile', exp: 'Mede a carga da CPU dividida entre firewall, routing, btest, networking e drivers.' }
      ],
      expected_output: 'A tela do Torch lista os maiores consumidores de banda em tempo real. O Profile exibe a porcentagem exata de processamento por tarefa.',
      validation_tests: [
        'Teste 1: Gere tráfego de teste e valide a exibição imediata no Torch.',
        'Teste 2: Inspecione o Profile durante um teste de banda e observe a variação da CPU.'
      ],
      common_gotchas: [
        'Deixar o Torch ou Packet Sniffer rodando indefinidamente em roteadores com processador fraco pode elevar o uso de CPU.'
      ],
      diagnostic_procedure: [
        'Se a CPU estiver em 100%: 1. Verifique se há teste de btest rodando; 2. Verifique regras de regex L7 no firewall; 3. Inspecione loops L2 na bridge.'
      ],
      security_measures: [
        'Use ferramentas de captura de forma responsável para proteger a privacidade dos usuários.'
      ],
      practical_exercise: 'Abra o Torch na interface de rede do seu laboratório. Inicie um download e localize o fluxo exato com IP e porta no monitor.',
      completion_criteria: 'O técnico deve saber usar Torch e Profile sem hesitação para identificar qualquer gargalo em menos de 3 minutos.'
    }
  },

  // Módulo 13 Aula 1
  {
    id: 'l_m13_1',
    module_id: 'm13',
    lesson_number: 1,
    title: 'Projeto Completo de Implantação Corporativa e Termo de Entrega',
    duration_minutes: 60,
    content: {
      objective: 'Ensinar o técnico a executar um projeto completo de instalação de MikroTik em clientes corporativos, desde o levantamento inicial até a homologação e termo de entrega.',
      simple_theory: 'Uma instalação profissional não é só plugar cabos. Envolve conversar com o cliente, entender o negócio dele, organizar o rack com identificação correta, proteger o equipamento e entregar a rede testada com um documento assinado.',
      technical_concepts: 'O ciclo de vida de um projeto segue: 1. Levantamento técnico (quantitativo de máquinas, links, servidores); 2. Planejamento (mapa de IPs, VLANs e topologia); 3. Instalação física (rack, alimentação e aterramento); 4. Configuração padronizada (hardening, firewall, rotas e serviços); 5. Homologação (testes de failover, throughput e termo de aceite).',
      real_application: 'Um provedor fecha contrato de link dedicado e infraestrutura com um escritório de advocacia de 30 usuários. O técnico segue o checklist padronizado, instala a RB4011 no rack, documenta tudo e entrega a rede funcionando com zero retrabalho.',
      topology: {
        type: 'corporate_project',
        title: 'Topologia do Projeto Corporativo (30 Usuários)',
        description: 'RB4011 com Link Principal (Fibra) + Link Backup (Rádio), VLANs Administrativa, CFTV e Visitantes.',
        devices: [
          { name: 'Link Principal ISP (Fibra 300M)', ip: '200.100.50.2/29', port: 'ether1 (WAN1)' },
          { name: 'Link Backup ISP (Rádio 50M)', ip: '192.168.15.2/24', port: 'ether2 (WAN2)' },
          { name: 'MikroTik Core RB4011', ip: 'Gateways VLAN 10, 20, 30', port: 'Rack Principal' },
          { name: 'Switch Gerenciável L2', ip: 'Trunk 802.1Q na ether5', port: 'Rede Local' }
        ]
      },
      prerequisites: ['Domínio de todos os módulos anteriores de roteamento, firewall e VLANs'],
      step_by_step: [
        '1. Realize o levantamento de campo e preencha a ficha de pré-instalação.',
        '2. Desenhe o diagrama da topologia e defina o plano de endereçamento.',
        '3. Fixe o equipamento no rack, conecte o cabo terra e identifique os cabos de rede com anilhas.',
        '4. Aplique a configuração padronizada com Safe Mode ativo.',
        '5. Teste o failover puxando o cabo do Link 1 e validando se o Link 2 assume em segundos.',
        '6. Gere o backup final (.backup e .rsc) e colete a assinatura no Termo de Entrega.'
      ],
      winbox_steps: [
        'System -> Identity (Padronizar nome)',
        'System -> Users (Criar credenciais seguras)',
        'Files -> Backup (Salvar backup final com data e hora)'
      ],
      cli_commands: [
        '# Script de encerramento de projeto\n/system backup save name="BKP-ENTREGA-CLIENTE-OFICIAL"\n',
        '/export file="EXPORT-ENTREGA-CLIENTE-OFICIAL"\n',
        '/system note set note="REDE HOMOLOGADA PELA ENGENHARIA ISP EM 2026"\n'
      ],
      command_explanations: [
        { cmd: '/system backup save name=...', exp: 'Cria o snapshot binário oficial que será guardado no repositório de desastres do provedor.' },
        { cmd: '/export file=...', exp: 'Gera o arquivo de texto com todo o código executado para auditoria técnica.' }
      ],
      expected_output: 'Todos os testes de conectividade, isolamento de convidados e failover passam com 100% de sucesso. O cliente recebe o documento com o diagrama e contatos do suporte.',
      validation_tests: [
        'Teste 1: Desconecte a WAN principal e cronometre o tempo de comutação para o backup (< 15 segundos).',
        'Teste 2: Verifique a navegação de todas as VLANs e confirme o isolamento dos visitantes.'
      ],
      common_gotchas: [
        'Entregar a rede sem testar a redundância de link na prática na frente do responsável do cliente.'
      ],
      diagnostic_procedure: [
        'Siga o checklist de 20 pontos de homologação antes de sair do local do cliente.'
      ],
      security_measures: [
        'Nunca deixe anotações com senhas coladas com fita adesiva no chassi do roteador.'
      ],
      practical_exercise: 'Elabore um plano de endereçamento e um checklist de testes para uma empresa fictícia de 25 computadores com link duplo.',
      completion_criteria: 'O técnico deve ser capaz de conduzir uma implantação corporativa de ponta a ponta com alto padrão de qualidade.'
    }
  },

  // Módulo 14 Aula 1
  {
    id: 'l_m14_1',
    module_id: 'm14',
    lesson_number: 1,
    title: 'Roteamento Dinâmico com OSPF e Alta Disponibilidade com VRRP',
    duration_minutes: 55,
    content: {
      objective: 'Apresentar os fundamentos de roteamento dinâmico com OSPF em redes de distribuição de provedores e configurar VRRP para redundância de gateway ativo/backup.',
      simple_theory: 'Em uma rede grande com vários roteadores interligados, configurar rotas na mão dá muito trabalho e causa quedas. O OSPF faz com que os roteadores conversem entre si e aprendam os caminhos sozinhos.',
      technical_concepts: 'O OSPF v2 (IPv4) e v3 (IPv6) utiliza o algoritmo SPF (Dijkstra) na área backbone (area 0). Cada roteador possui um Router ID exclusivo. O VRRP (Virtual Router Redundancy Protocol - RFC 5798) cria um endereço IP virtual flutuante entre dois roteadores no mesmo segmento de rede local. O roteador com maior prioridade atua como Master; se ele parar de emitir anúncios por 3 segundos, o Backup assume o IP virtual.',
      real_application: 'Em uma rede de provedor que atende uma cidade através de um anel óptico de 4 torres, o OSPF contorna o rompimento de um cabo de fibra óptica recalculando a rota pelo outro lado do anel em menos de 1 segundo.',
      topology: {
        type: 'ospf_ring',
        title: 'Topologia de Roteamento Dinâmico OSPF e Gateway VRRP',
        description: 'Anel OSPF de distribuição e dois roteadores locais com VRRP (VIP: 192.168.10.1).',
        devices: [
          { name: 'RTR-TORRE-01 (OSPF Area 0)', ip: 'Router ID: 10.0.0.1', port: 'Anel Fibra' },
          { name: 'RTR-TORRE-02 (OSPF Area 0)', ip: 'Router ID: 10.0.0.2', port: 'Anel Fibra' },
          { name: 'RTR-MASTER (VRRP Master)', ip: 'VIP: 192.168.10.1 | Prioridade: 150', port: 'LAN' },
          { name: 'RTR-BACKUP (VRRP Backup)', ip: 'VIP: 192.168.10.1 | Prioridade: 100', port: 'LAN' }
        ]
      },
      prerequisites: ['Domínio de rotas estáticas e máscaras /30'],
      step_by_step: [
        '1. No RouterOS v7: Acesse Routing -> OSPF -> Instances.',
        '2. Configure o Router ID: ex: 10.0.0.1.',
        '3. Em Routing -> OSPF -> Areas, confirme a existência da área "backbone" (ID 0.0.0.0).',
        '4. Em Routing -> OSPF -> Interface Templates, adicione as interfaces de transporte de interligação.',
        '5. Para o VRRP: Crie uma interface VRRP na porta da rede local e atribua o IP virtual 192.168.10.1/24.'
      ],
      winbox_steps: [
        'Routing -> OSPF -> Instances -> [+] -> Name: default, Router ID: 10.0.0.1 -> OK',
        'Routing -> OSPF -> Interface Templates -> [+] -> Interface: ether3, Area: backbone -> OK',
        'Interfaces -> [+] -> VRRP -> Name: vrrp1, Interface: bridge-lan, VRID: 10, Priority: 150 -> OK'
      ],
      cli_commands: [
        '/routing ospf instance add name=ospf-instance router-id=10.0.0.1 disabled=no\n',
        '/routing ospf area add name=backbone-v7 area-id=0.0.0.0 instance=ospf-instance\n',
        '/routing ospf interface-template add area=backbone-v7 networks=10.255.0.0/30 type=ptp\n',
        '/interface vrrp add name=vrrp-gateway interface=bridge-lan vrid=10 priority=150\n/ip address add address=192.168.10.1/24 interface=vrrp-gateway\n'
      ],
      command_explanations: [
        { cmd: 'router-id=10.0.0.1', exp: 'Identificador único de 32 bits do roteador no domínio OSPF.' },
        { cmd: 'priority=150', exp: 'Define a prioridade no VRRP. O equipamento com maior valor (150 > 100) torna-se o Gateway Master da rede.' }
      ],
      expected_output: 'Na tabela OSPF Neighbors, o status exibe "Full". Na tabela VRRP, o roteador principal exibe a flag "RM" (Running Master).',
      validation_tests: [
        'Teste 1: Verifique em `/routing ospf neighbor print` se a adjacência com o vizinho está em estado Full.',
        'Teste 2: Desligue o roteador Master e confirme se o Backup assume o IP virtual em menos de 3 segundos.'
      ],
      common_gotchas: [
        'Erro comum no OSPF: Router ID duplicado entre dois roteadores na mesma rede, impedindo a formação de adjacência.'
      ],
      diagnostic_procedure: [
        'Se o vizinho OSPF travar em "Init" ou "ExStart": Verifique se o MTU das interfaces de transporte é idêntico em ambas as pontas.'
      ],
      security_measures: [
        'Ative autenticação criptográfica MD5 ou SHA256 nas interfaces OSPF para impedir injeção de rotas falsas.'
      ],
      practical_exercise: 'Configure dois roteadores com VRRP compartilhando o IP virtual 192.168.88.1. Teste o failover desligando a porta do Master.',
      completion_criteria: 'O técnico deve compreender os conceitos de OSPF e alta disponibilidade com VRRP.'
    }
  },

  // Módulo 15 Aula 1
  {
    id: 'l_m15_1',
    module_id: 'm15',
    lesson_number: 1,
    title: 'Procedimentos Operacionais Padrão (POPs) e Recuperação com Netinstall',
    duration_minutes: 50,
    content: {
      objective: 'Capacitar a equipe a operar com base nos Procedimentos Operacionais Padrão (POPs) do provedor e dominar a recuperação de baixo nível de equipamentos via Netinstall.',
      simple_theory: 'Em uma equipe técnica profissional, não se trabalha no improviso. Cada atividade (trocar roteador, atualizar versão ou alterar firewall) possui um procedimento passo a passo padronizado que previne falhas humanas.',
      technical_concepts: 'Os POPs estabelecem governança técnica. O Netinstall é a ferramenta oficial MikroTik que executa no Windows com um servidor PXE/BOOTP e TFTP integrado. Quando a RouterBOARD entra em modo Etherboot (mantendo o botão Reset pressionado por 15 segundos até o LED parar de piscar), ela baixa o kernel do RouterOS diretamente via cabo de rede na porta ether1, formatando e recuperando o roteador mesmo após corrupção total do sistema.',
      real_application: 'Um técnico de campo recebe uma RouterBOARD que parou de responder após uma queda de energia durante atualização. Em vez de descartar o equipamento, ele utiliza o Netinstall na bancada e recupera a placa com sistema limpo em menos de 3 minutos.',
      topology: {
        type: 'netinstall_bench',
        title: 'Bancada de Recuperação de Equipamentos com Netinstall',
        description: 'Notebook de bancada com Netinstall conectado diretamente à porta ether1/boot da RouterBOARD.',
        devices: [
          { name: 'Notebook Técnico (Netinstall)', ip: 'IP Estático: 192.168.88.2/24 | Netinstall Server: 192.168.88.3', port: 'NIC Ethernet' },
          { name: 'RouterBOARD em Modo Etherboot', ip: 'Recebe IP 192.168.88.3 via BOOTP', port: 'ether1 (Boot)' }
        ]
      },
      prerequisites: ['Software Netinstall oficial baixado de mikrotik.com', 'Pacote .npk do RouterOS na mesma versão'],
      step_by_step: [
        '1. No notebook, configure a placa de rede com IP estático: 192.168.88.2 / 255.255.255.0.',
        '2. Desative temporariamente o Firewall do Windows e outros adaptadores virtuais (Wi-Fi, VMware).',
        '3. Abra o Netinstall como Administrador e marque "Net booting" com Client IP: 192.168.88.3.',
        '4. Conecte o cabo de rede entre o notebook e a porta ether1 do MikroTik.',
        '5. Mantenha o botão RESET pressionado enquanto conecta a fonte de alimentação.',
        '6. Mantenha pressionado por 15 a 20 segundos até a RouterBOARD aparecer listada na tela do Netinstall.',
        '7. Selecione o pacote `.npk` baixado e clique em "Install".'
      ],
      winbox_steps: [
        'Após a conclusão do Netinstall, a placa reiniciará limpa de fábrica',
        'Abra o WinBox, acesse por MAC e aplique o script padrão de homologação do provedor'
      ],
      cli_commands: [
        '# Script de verificacao pos-recuperacao Netinstall\n/system routerboard print\n',
        '/system resource print\n',
        '/system identity set name="RTR-RECUPERADO-BANCADA"\n'
      ],
      command_explanations: [
        { cmd: '/system routerboard print', exp: 'Confirma o modelo físico e verifica se o firmware da placa precisa ser atualizado após o Netinstall.' }
      ],
      expected_output: 'O Netinstall exibe "Status: OK" e a barra de progresso conclui. O roteador reinicia e volta a responder normalmente no WinBox.',
      validation_tests: [
        'Teste 1: Conecte pelo WinBox via MAC address.',
        'Teste 2: Valide se todas as portas Ethernet estão ativas e funcionais.'
      ],
      common_gotchas: [
        'Erro clássico no Netinstall: Não desativar o Firewall do Windows. O firewall bloqueia as mensagens broadcast de BOOTP/TFTP e o roteador nunca aparece na lista.'
      ],
      diagnostic_procedure: [
        'Se o roteador não for detectado: 1. Troque o cabo de rede; 2. Conecte um switch simples entre o notebook e o roteador para evitar que a placa de rede do Windows demore a subir o enlace.'
      ],
      security_measures: [
        'Sempre execute o Netinstall em ambiente de bancada seguro antes de levar o equipamento para o cliente.'
      ],
      practical_exercise: 'Realize o procedimento de Etherboot e Netinstall em uma RouterBOARD de treinamento até dominar o tempo exato de pressionar o botão Reset.',
      completion_criteria: 'O técnico deve dominar a recuperação por Netinstall e a execução dos POPs operacionais da empresa com rigor e disciplina.'
    }
  }
];

