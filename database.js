import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import crypto from 'node:crypto';
import { allQuestions, allLessons } from './curriculumData.js';

const DB_DIR = join(process.cwd(), 'data');
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = join(DB_DIR, 'mikrotik_academy.db');
export const db = new DatabaseSync(DB_PATH);

// Habilita chaves estrangeiras e performance WAL
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'instructor', 'admin')) NOT NULL DEFAULT 'student',
      department TEXT NOT NULL DEFAULT 'Operações / Suporte Técnico',
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      module_number INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL, -- 'Iniciante', 'Intermediário', 'Avançado'
      duration_hours INTEGER NOT NULL,
      icon TEXT NOT NULL,
      competency_key TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      lesson_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      content_json TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS labs (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL, -- 'Básico', 'Intermediário', 'Avançado'
      scenario_type TEXT NOT NULL,
      description TEXT NOT NULL,
      topology_json TEXT NOT NULL,
      initial_config TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      hints_json TEXT NOT NULL,
      expected_solution TEXT NOT NULL,
      root_cause_explanation TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'multiple_choice'
    );

    CREATE TABLE IF NOT EXISTS student_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      status TEXT CHECK(status IN ('in_progress', 'completed')) NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS student_lab_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lab_id TEXT NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
      hypothesis TEXT NOT NULL,
      solution_submitted TEXT NOT NULL,
      passed INTEGER NOT NULL,
      score INTEGER NOT NULL,
      feedback TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage REAL NOT NULL,
      passed INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      attempt_number INTEGER NOT NULL DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      course_title TEXT NOT NULL,
      final_grade REAL NOT NULL,
      hours_completed INTEGER NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      verification_hash TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'valid'
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competencies (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS final_project_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      stage_data_json TEXT NOT NULL,
      status TEXT CHECK(status IN ('draft', 'submitted', 'under_review', 'approved', 'revisions_required')) NOT NULL DEFAULT 'draft',
      grade REAL,
      instructor_feedback TEXT,
      reviewed_by TEXT REFERENCES users(id),
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      UNIQUE(user_id)
    );
  `);

  seedInitialData();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_isp_salt_2026').digest('hex');
}

function seedInitialData() {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (usersCount > 0) return; // Já populado

  console.log('Populando banco de dados com dados técnicos estruturados...');

  // 1. Inserir Competências
  const insertComp = db.prepare('INSERT INTO competencies (key, name, category, description) VALUES (?, ?, ?, ?)');
  const competencies = [
    ['fundamentos_rede', 'Fundamentos de Redes e Protocolos', 'Base', 'Capacidade de calcular sub-redes CIDR, analisar portas TCP/UDP e interpretar modelos OSI/TCP-IP.'],
    ['hardware_routerboard', 'Hardware RouterBOARD & RouterOS', 'Equipamentos', 'Critérios de escolha de hardware, arquitetura MIPS/ARM, licenciamento e versões RouterOS v6/v7.'],
    ['acesso_seguro', 'Primeiro Acesso e Hardening Básico', 'Segurança', 'WinBox MAC/IP, atualização firmware, desativação de serviços inseguros e Safe Mode.'],
    ['bridge_enderecamento', 'Interfaces, Bridge e Endereçamento IP', 'Redes L2/L3', 'Criação de bridges, comutação L2 sem loop (RSTP), ARP e configuração de IPs.'],
    ['dhcp_dns_servicos', 'DHCP Server, Leases e DNS Cache', 'Serviços de Rede', 'Pools de endereços, leases estáticos por MAC, resolução DNS e diagnóstico de clientes sem IP.'],
    ['roteamento_nat', 'Internet WAN, Rotas e NAT Masquerade', 'Roteamento & WAN', 'PPPoE Client, rotas default, métrica de failover, srcnat masquerade e port forwarding.'],
    ['firewall_defesa', 'Firewall RouterOS e Proteção Ativa', 'Segurança', 'Cadeias input/forward, connection tracking, address-lists, defesa contra brute-force e isolamento.'],
    ['vlans_segmentacao', 'VLANs Corporativas e Bridge VLAN Filtering', 'Segmentação L2', 'Padronização 802.1Q no RouterOS v7, tagged/untagged, PVID e roteamento inter-VLAN.'],
    ['wifi_corporativo', 'Wi-Fi Corporativo e WifiWave2', 'Wireless', 'Canais 2.4/5GHz, potências, WPA2/WPA3, SSIDs corporativo e visitante isolado em VLAN.'],
    ['vpn_wireguard_ipsec', 'VPNs Corporativas e Acesso Remoto', 'Conectividade Segura', 'Túneis WireGuard modernos, chaves públicas/privadas, peers, IPsec e rotas matriz-filial.'],
    ['qos_controle_banda', 'QoS, Simple Queues e PCQ', 'Qualidade de Serviço', 'Limitação por IP, bandas dinâmicas PCQ, prevenção de bufferbloat e FastTrack.'],
    ['troubleshooting_isp', 'Monitoramento Avançado e Troubleshooting ISP', 'Operações', 'Torch em tempo real, Packet Sniffer, Tool Profile, Logs e Metodologia Hipótese-Validação.'],
    ['projetos_empresas', 'Instalação e Homologação Corporativa', 'Engenharia de Campo', 'Execução dos 5 estágios: levantamento, dimensionamento, rack físico, configuração e entrega.'],
    ['recursos_avancados', 'Roteamento Dinâmico (OSPF/BGP) e VRRP', 'Avançado', 'Roteamento interno OSPF, anúncios BGP introdutórios, VRRP alta disponibilidade e scripts.'],
    ['padroes_operacionais', 'POPs Técnicos e Procedimentos Operacionais', 'Governança', 'Execução de POPs de troca, contingência, upgrade de firmware e elaboração de relatório de causa raiz.']
  ];
  for (const c of competencies) insertComp.run(...c);

  // 2. Inserir Usuários Iniciais
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, name, email, role, department, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const users = [
    ['u1', 'tecnico.carlos', 'Carlos Eduardo Silveira', 'carlos.silveira@provedorisp.com.br', 'student', 'Técnico de Campo Júnior', hashPassword('mikrotik123')],
    ['u2', 'tecnica.mariana', 'Mariana Alencar Rocha', 'mariana.rocha@provedorisp.com.br', 'student', 'Técnica de Redes Pleno', hashPassword('mikrotik123')],
    ['u3', 'instrutor.andre', 'André Martins Pires', 'andre.pires@provedorisp.com.br', 'instructor', 'Engenheiro de Redes / Instrutor Oficial', hashPassword('mikrotik123')],
    ['u4', 'gestor.roberto', 'Roberto de Souza Melo', 'roberto.melo@provedorisp.com.br', 'admin', 'Gerência de Engenharia & NOC', hashPassword('admin123')],
    ['u5', 'aluno.demo', 'Técnico Visitante Demo', 'demo@provedorisp.com.br', 'student', 'Capacitação Técnica Operacional', hashPassword('demo123')]
  ];
  for (const u of users) insertUser.run(...u);

  // 3. Inserir Módulos (1 a 15)
  const insertModule = db.prepare(`
    INSERT INTO modules (id, module_number, title, description, level, duration_hours, icon, competency_key, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const modules = [
    ['m1', 1, 'Módulo 1 — Fundamentos de Redes', 'Modelos OSI e TCP/IP, endereçamento IPv4/IPv6, cálculo CIDR, máscaras, gateways, portas TCP/UDP, MTU/MSS e interpretação de topologias.', 'Iniciante', 8, 'network', 'fundamentos_rede', 1],
    ['m2', 2, 'Módulo 2 — Conhecendo os Equipamentos MikroTik', 'Hardware RouterBOARD vs RouterOS, arquitetura de processamento, modelos de mercado (hEX, RB4011, CCR), licenciamento e RouterOS v6 vs v7.', 'Iniciante', 6, 'cpu', 'hardware_routerboard', 1],
    ['m3', 3, 'Módulo 3 — Primeiro Acesso e Configuração Inicial', 'Conexão física, WinBox (MAC vs IP), default config, backup binário vs export script (.rsc), atualização de firmware RouterBOARD, Safe Mode e hardening de serviços.', 'Iniciante', 8, 'terminal', 'acesso_seguro', 1],
    ['m4', 4, 'Módulo 4 — Interfaces, Bridge e Endereçamento', 'Interfaces Ethernet, criação de bridges L2, comutação com RSTP anti-loop, endereçamento IP, ARP e tabela de vizinhos (MNDP/LLDP).', 'Intermediário', 8, 'layers', 'bridge_enderecamento', 1],
    ['m5', 5, 'Módulo 5 — DHCP, DNS e Serviços Básicos', 'Configuração de DHCP Server, Pools de IP, Leases estáticos por MAC, Gateway/DNS para clientes, DNS cache com remote requests e diagnóstico de conectividade.', 'Intermediário', 8, 'server', 'dhcp_dns_servicos', 1],
    ['m6', 6, 'Módulo 6 — Internet, Rotas e NAT', 'WAN DHCP Client, IP estático, PPPoE Client, rota default 0.0.0.0/0, distância administrativa, failover de links com check-gateway, NAT masquerade e port forwarding seguro.', 'Intermediário', 10, 'globe', 'roteamento_nat', 1],
    ['m7', 7, 'Módulo 7 — Firewall e Segurança', 'Cadeias input, forward e output, connection tracking (established, related, invalid, new), address-lists, proteção contra ataques de força bruta e regras de contenção.', 'Intermediário', 12, 'shield', 'firewall_defesa', 1],
    ['m8', 8, 'Módulo 8 — VLANs e Segmentação de Empresas', 'Padrão 802.1Q, Bridge VLAN Filtering moderno do RouterOS v7, portas tagged/untagged, PVID, interfaces VLAN L3, DHCP por VLAN e isolamento seguro entre setores.', 'Avançado', 12, 'git-commit', 'vlans_segmentacao', 1],
    ['m9', 9, 'Módulo 9 — Wi-Fi Corporativo', 'Frequências 2.4 GHz e 5 GHz, canais sem sobreposição, largura de canal, potências, WPA2/WPA3, SSIDs corporativo e visitante em VLAN, WifiWave2 no RouterOS v7.', 'Intermediário', 8, 'wifi', 'wifi_corporativo', 1],
    ['m10', 10, 'Módulo 10 — VPN e Acesso Remoto Seguro', 'WireGuard moderno no RouterOS v7, chaves públicas/privadas, peers, portas UDP 51820, túneis site-to-site matriz/filial, IPsec IKEv2 e políticas de firewall.', 'Avançado', 10, 'lock', 'vpn_wireguard_ipsec', 1],
    ['m11', 11, 'Módulo 11 — Controle de Banda e Qualidade de Serviço (QoS)', 'Simple Queues, Queue Tree com Mangle, PCQ para divisão justa de banda, controle de bufferbloat, latência e interação com FastTrack.', 'Avançado', 8, 'bar-chart', 'qos_controle_banda', 1],
    ['m12', 12, 'Módulo 12 — Monitoramento e Troubleshooting', 'Torch em tempo real, Packet Sniffer, Tool Profile (análise de CPU 100%), Logs do sistema, MTU/MSS clamping e Metodologia Padronizada ISP de Diagnóstico de Causa Raiz.', 'Avançado', 10, 'activity', 'troubleshooting_isp', 1],
    ['m13', 13, 'Módulo 13 — Instalação de MikroTik em Empresas', 'As 5 etapas completas: levantamento técnico, planejamento, instalação física/rack, configuração segura e testes de homologação. Estudo de 3 projetos práticos reais.', 'Avançado', 14, 'briefcase', 'projetos_empresas', 1],
    ['m14', 14, 'Módulo 14 — Recursos Avançados', 'OSPF v2/v3 para anéis de distribuição, BGP básico para trânsito ISP e ASN, VRRP para redundância de gateway ativo/backup, Scripts e Netwatch.', 'Avançado', 12, 'zap', 'recursos_avancados', 1],
    ['m15', 15, 'Módulo 15 — Padrões Operacionais da Equipe Técnica', '11 Procedimentos Operacionais Padrão (POPs): novo roteador, troca em campo, alteração de VLAN, firewall seguro, atualização RouterOS e relatório pós-incidente.', 'Avançado', 10, 'file-text', 'padroes_operacionais', 1]
  ];

  for (const m of modules) insertModule.run(...m);

  // 4. Inserir Aulas com Conteúdo Técnico Profissional (Estrutura Obrigatória de 18 Seções)
  seedLessons();

  // 5. Inserir Laboratórios Práticos Interativos de Troubleshooting
  seedLabs();

  // 6. Inserir Banco de Questões
  seedQuestions();

  // 7. Inserir Progresso Simulado Inicial
  seedProgress();

  console.log('Banco de dados inicializado com sucesso!');
}

function seedLessons() {
  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, module_id, lesson_number, title, duration_minutes, content_json, published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Aula Modelo Completa Módulo 3 Aula 1 (Primeiro Acesso e Hardening)
  const lessonM3L1 = {
    objective: 'Capacitar o técnico a realizar a conexão física segura, acessar o RouterOS via WinBox pelo endereço MAC, reconhecer a topologia inicial, efetuar o backup da configuração de fábrica e aplicar os primeiros passos de hardening com Safe Mode.',
    simple_theory: 'Quando um roteador MikroTik sai da caixa, ele vem com uma configuração padrão que nem sempre é segura ou adequada para a rede do provedor. Acessá-lo pelo endereço físico (MAC) no WinBox permite configurá-lo mesmo sem um endereço IP conhecido no seu computador.',
    technical_concepts: 'O protocolo MNDP (MikroTik Neighbor Discovery Protocol) e CDP transmitem pacotes broadcast em camada 2 permitindo que o utilitário WinBox localize qualquer RouterBOARD no mesmo domínio de broadcast L2. O acesso por MAC utiliza a porta UDP 20561 e o protocolo proprietário MNP. O Safe Mode (ativado via F4 ou botão gráfico) cria uma transação reversível no kernel: se a sessão de gerenciamento for interrompida por uma regra de firewall ou perda de rota, todas as alterações são desfeitas automaticamente após timeout de 10 segundos, prevenindo bloqueio de acesso (lockout).',
    real_application: 'Em atendimentos corporativos em campo, o técnico conecta seu notebook diretamente na porta ether2 (ou porta de serviço) para preparar o roteador antes de ligá-lo ao switch da empresa ou à fibra da operadora, garantindo que o equipamento não suba com senhas vazias ou serviços desprotegidos expostos para a internet.',
    topology: {
      type: 'l2_access',
      title: 'Topologia de Primeiro Acesso em Bancada',
      description: 'Notebook de campo conectado à porta ether2 do MikroTik hEX (RB750Gr3) via cabo de rede UTP Cat6 direto.',
      devices: [
        { name: 'Notebook Técnico', ip: '192.168.88.254/24 (DHCP) ou MAC Raw', port: 'NIC Ethernet RJ45' },
        { name: 'MikroTik RB750Gr3', ip: '192.168.88.1/24 (ether2-master)', identity: 'MikroTik' },
        { name: 'Link Operadora / WAN', ip: 'Desconectado durante primeiro acesso', port: 'ether1' }
      ]
    },
    prerequisites: [
      'Notebook com porta Ethernet gigabit ou adaptador USB-Gigabit homologado.',
      'Software WinBox v3.40 ou v4.0 oficial baixado diretamente de mikrotik.com.',
      'Cabo de rede UTP Cat5e ou Cat6 crimpado no padrão T568A ou T568B e testado.',
      'Fonte de alimentação original MikroTik compatível (12V a 24V DC).'
    ],
    step_by_step: [
      '1. Conecte a fonte de alimentação ao MikroTik e aguarde os bipes de inicialização do RouterOS (bipe curto inicial seguido de bipe duplo após carregamento do kernel).',
      '2. Conecte o cabo de rede do notebook à porta ether2 do equipamento (a porta ether1 por padrão possui regras restritivas de firewall WAN).',
      '3. Abra o WinBox, acesse a aba "Neighbors", aguarde a exibição do endereço MAC, IP padrão 192.168.88.1 e versão do RouterOS.',
      '4. Clique sobre o Endereço MAC na lista. O campo "Connect To" será preenchido com o MAC.',
      '5. Insira o usuário "admin" e deixe a senha em branco (ou verifique etiqueta física com Default Password em modelos recentes com RouterOS v7).',
      '6. Clique em "Connect". Caso surja a janela "RouterOS Default Configuration", selecione "Remove Configuration" para projeto limpo ou visualize o script padrão.',
      '7. Pressione imediatamente a tecla "F4" ou clique no botão [Safe Mode] no canto superior esquerdo para ativar a proteção contra perda de acesso.',
      '8. Defina a nova senha mestre corporativa de no mínimo 12 caracteres contendo letras maiúsculas, minúsculas, números e símbolos.'
    ],
    winbox_steps: [
      'Menu System -> Identity: Defina um nome padronizado (Ex: "RTR-MATRIZ-EMPRESA-A").',
      'Menu System -> Users: Adicione o usuário do técnico no grupo "full", teste o login em nova janela e desative ou altere a senha do usuário padrão "admin".',
      'Menu IP -> Services: Desabilite serviços inseguros: telnet (porta 23), ftp (porta 21), www (porta 80 sem SSL) e api (porta 8728). Mantenha apenas winbox (porta 8291) e ssh (porta 22) com restrições.',
      'Menu Files: Clique em "Backup", marque "Don\'t Encrypt" (ou insira chave criptográfica corporativa) e digite o nome: "backup-inicial-limpo".',
      'Menu New Terminal: Digite `/export file=export-inicial-limpo` para gerar o script legível em texto puro.'
    ],
    cli_commands: [
      '# 1. Definir identidade do roteador\n/system identity set name="RTR-CORP-GW01"\n',
      '# 2. Criar novo usuário administrativo com privilégios completos\n/user add name="tecnico.admin" group=full password="SenhaForte@ISP2026"\n',
      '# 3. Desativar serviços de gerenciamento inseguros e vulneráveis\n/ip service disable telnet,ftp,www,api,api-ssl\n',
      '# 4. Restringir acesso ao WinBox apenas para sub-rede de gerenciamento técnico\n/ip service set winbox address=192.168.88.0/24,10.100.0.0/16 port=8291\n',
      '# 5. Criar backup binário e exportação em formato texto editável\n/system backup save name="bkp-pos-hardening-inicial"\n/export file="export-pos-hardening-inicial"\n'
    ],
    command_explanations: [
      { cmd: '/system identity set name="RTR-CORP-GW01"', exp: 'Altera o hostname exibido no prompt do terminal, no WinBox e nos logs de auditoria do syslog.' },
      { cmd: '/user add name="tecnico.admin" group=full password="..."', exp: 'Cria uma conta individual para o técnico responsável, evitando o uso compartilhado do usuário default.' },
      { cmd: '/ip service disable telnet,ftp,www,api,api-ssl', exp: 'Fecha as portas de protocolos que transmitem credenciais em texto claro na rede local.' },
      { cmd: '/ip service set winbox address=...', exp: 'Cria uma lista de controle de acesso (ACL) nativa no serviço WinBox, recusando pacotes de qualquer IP fora do escopo permitido antes mesmo do firewall.' },
      { cmd: '/system backup save name="..."', exp: 'Gera um arquivo binário proprietário (.backup) com senhas criptografadas e configurações de hardware para restauração total.' },
      { cmd: '/export file="..."', exp: 'Gera um arquivo de script em texto legível (.rsc) com os comandos CLI que podem ser auditados ou aplicados em outro roteador semelhante.' }
    ],
    expected_output: 'O WinBox exibirá o novo nome "RTR-CORP-GW01" no topo da janela. O terminal exibirá `[tecnico.admin@RTR-CORP-GW01] >`. A lista de serviços em `IP -> Services` mostrará telnet, ftp e www com ícone vermelho (disabled). O menu Files listará os arquivos `bkp-pos-hardening-inicial.backup` e `export-pos-hardening-inicial.rsc`.',
    validation_tests: [
      'Teste 1: Abra uma nova sessão do WinBox e confirme se o login com usuário "tecnico.admin" conecta com sucesso.',
      'Teste 2: Tente efetuar conexão via Telnet na porta 23 (`telnet 192.168.88.1`) a partir do prompt do Windows e valide se a conexão é recusada imediatamente.',
      'Teste 3: Verifique no menu Files se o tamanho do arquivo .rsc gerado é maior que 1 KB e faça o download para seu notebook arrastando para a Área de Trabalho.'
    ],
    common_gotchas: [
      'Causa 1: Tentar conectar o notebook na porta ether1 com configuração padrão. O firewall de fábrica bloqueia conexões de gerenciamento na interface definida como WAN.',
      'Causa 2: Desabilitar o serviço WinBox acidentalmente sem ter o SSH configurado, resultando em perda total de acesso remoto se o Safe Mode não estiver ativo.',
      'Causa 3: Alterar o IP da bridge ou interface sem ativar o Safe Mode (F4). O WinBox desconectará e você precisará reconectar via MAC address.',
      'Causa 4: Esquecer de salvar o arquivo de export (.rsc) para o computador do técnico antes de realizar um reset de fábrica.'
    ],
    diagnostic_procedure: [
      '1. Se o WinBox não listar o roteador em "Neighbors": Verifique o LED da porta física no MikroTik. Se estiver apagado, teste outro cabo de rede.',
      '2. Desative adaptadores virtuais de rede no Windows (VirtualBox, VMware, VPNs de cliente) que costumam interceptar pacotes de broadcast MNDP em camada 2.',
      '3. Desative temporariamente o Firewall do Windows na interface de rede local se o tráfego UDP na porta 20561 estiver sendo bloqueado.',
      '4. Se o IP do roteador for desconhecido e o acesso por MAC falhar: Realize o procedimento de reset físico mantendo o botão "Reset" pressionado enquanto liga a fonte até que o LED "USR" comece a piscar (aprox. 5 segundos).'
    ],
    security_measures: [
      'Nunca deixe a senha do usuário admin em branco ou com combinações óbvias (ex: admin123, 123456).',
      'Nunca conecte um roteador à internet pública antes de alterar as credenciais padrão e desabilitar os serviços administrativos inseguros.',
      'Sempre ative o Safe Mode (F4) antes de alterar regras de firewall ou configurações de interfaces de gerência.',
      'Guarde os backups em local seguro e compartilhado do NOC do provedor, com data e nome padronizado.'
    ],
    practical_exercise: 'Em sua bancada de teste, conecte-se a uma RouterBOARD de laboratório via WinBox MAC. Ative o Safe Mode. Altere a identidade para "LAB-SEU_NOME". Desative Telnet e FTP. Crie um usuário pessoal. Gere o backup binário e a exportação .rsc. Valide que o arquivo está acessível no menu Files.',
    quiz: {
      question: 'Qual a principal diferença entre um backup gerado por `/system backup save` e um script gerado por `/export file` no MikroTik RouterOS?',
      options: [
        'O backup binário é em texto claro legível e o export é criptografado.',
        'O backup binário (.backup) contém senhas de usuários e configurações de hardware para o mesmo modelo; o export (.rsc) é um script em texto puro com comandos RouterOS portáveis entre modelos.',
        'Não há diferença técnica, ambos funcionam exatamente da mesma forma.',
        'O arquivo .backup só pode ser restaurado via cabo serial console.'
      ],
      correct: 1,
      explanation: 'O arquivo .backup é uma imagem binária que preserva licenças de hardware, senhas criptografadas e estrutura de drivers, devendo ser restaurado no mesmo modelo de equipamento. Já o `/export` gera um arquivo de texto (.rsc) legível com comandos CLI que podem ser abertos no Bloco de Notas e adaptados para outros modelos e versões.'
    },
    completion_criteria: 'O aluno deve ser capaz de descrever a diferença entre conexão MAC e IP, operar o Safe Mode sem hesitação, desabilitar serviços inseguros e exportar a configuração inicial para custódia técnica.'
  };

  insertLesson.run('l_m3_1', 'm3', 1, 'Primeiro Acesso, WinBox e Hardening Inicial de Serviços', 45, JSON.stringify(lessonM3L1), 1);

  // Aula Módulo 4 Aula 1 (Interfaces, Bridge e RSTP)
  const lessonM4L1 = {
    objective: 'Ensinar a criação e operação de bridges em camada 2 no RouterOS v7, adição de portas Ethernet com comutação de hardware (hw-offload) e prevenção de loops com Rapid Spanning Tree Protocol (RSTP).',
    simple_theory: 'Uma bridge funciona como se fosse um switch interno dentro do MikroTik. Ela junta várias portas físicas (como ether2, ether3 e ether4) para que todos os computadores ligados nelas conversem diretamente entre si na mesma rede local.',
    technical_concepts: 'No RouterOS v7, a bridge unificada substituiu os antigos grupos master-port. Ao associar portas a uma bridge com a flag `hw=yes`, o tráfego L2 é comutado diretamente pelo chip de switch integrado da RouterBOARD sem consumir ciclos de CPU (Hardware Offloading). O protocolo RSTP (IEEE 802.1w) monitora BPDUs a cada 2 segundos. Se um técnico acidentalmente fechar um loop conectando as duas pontas de um cabo em duas portas da mesma bridge, o RSTP bloqueia uma das portas em milissegundos, evitando a tempestade de broadcast (broadcast storm) e a queda total da rede.',
    real_application: 'Em redes de clientes corporativos, o técnico cria a bridge "bridge-lan" agrupando as portas ether2 a ether5 para atender computadores locais, mantendo a porta ether1 isolada para o link de fibra da operadora.',
    topology: {
      type: 'bridge_l2',
      title: 'Topologia de Bridge Local L2',
      description: 'Portas ether2, ether3 e ether4 associadas à interface virtual bridge-lan, compartilhando a sub-rede 192.168.10.0/24.',
      devices: [
        { name: 'MikroTik RB750Gr3', ip: '192.168.10.1/24 em bridge-lan', port: 'bridge-lan' },
        { name: 'PC Financeiro', ip: '192.168.10.10/24', port: 'Conectado em ether2' },
        { name: 'PC Vendas', ip: '192.168.10.20/24', port: 'Conectado em ether3' },
        { name: 'Impressora de Rede', ip: '192.168.10.50/24', port: 'Conectado em ether4' }
      ]
    },
    prerequisites: ['Roteador configurado com identidade padronizada', 'Compreensão de endereçamento IP e máscaras /24', 'Cabo conectado na porta ether2'],
    step_by_step: [
      '1. No WinBox, acesse o menu "Bridge".',
      '2. Na aba "Bridge", clique no botão [+] para criar uma nova interface.',
      '3. Defina o nome como "bridge-lan" e confirme que o protocolo de Spanning Tree está em "rstp".',
      '4. Acesse a aba "Ports" dentro do menu Bridge e clique em [+].',
      '5. Selecione a interface "ether2" e aponte para a Bridge "bridge-lan". Garanta que "Hardware Offload" esteja marcado.',
      '6. Repita a inclusão para as portas ether3, ether4 e ether5.',
      '7. Acesse o menu IP -> Addresses e adicione o IP 192.168.10.1/24 apontando para a interface "bridge-lan" (NUNCA para uma porta escrava como ether2 isoladamente).'
    ],
    winbox_steps: [
      'Bridge -> [+] -> Name: bridge-lan -> STP: rstp -> OK',
      'Bridge -> Ports -> [+] -> Interface: ether2, Bridge: bridge-lan, HW Offload: Checked -> Apply',
      'Bridge -> Ports -> [+] -> Interface: ether3, Bridge: bridge-lan, HW Offload: Checked -> Apply',
      'IP -> Addresses -> [+] -> Address: 192.168.10.1/24 -> Interface: bridge-lan -> OK'
    ],
    cli_commands: [
      '# 1. Criar a interface bridge com protocolo RSTP\n/interface bridge add name=bridge-lan protocol-mode=rstp\n',
      '# 2. Adicionar portas fisicas a bridge com aceleracao de hardware\n/interface bridge port add bridge=bridge-lan interface=ether2 hw=yes\n/interface bridge port add bridge=bridge-lan interface=ether3 hw=yes\n/interface bridge port add bridge=bridge-lan interface=ether4 hw=yes\n/interface bridge port add bridge=bridge-lan interface=ether5 hw=yes\n',
      '# 3. Configurar endereco IP na interface bridge virtual\n/ip address add address=192.168.10.1/24 interface=bridge-lan network=192.168.10.0 comment="Gateway LAN Corporativa"\n'
    ],
    command_explanations: [
      { cmd: '/interface bridge add name=bridge-lan protocol-mode=rstp', exp: 'Cria o switch lógico virtual ativando a proteção contra loops em tempo real via RSTP.' },
      { cmd: '/interface bridge port add bridge=bridge-lan interface=ether2 hw=yes', exp: 'Associa a porta física à bridge, transferindo a comutação de pacotes para o chip switch de hardware.' },
      { cmd: '/ip address add address=192.168.10.1/24 interface=bridge-lan ...', exp: 'Define o IP do gateway na interface L3 agregada. Se configurado na ether2, outras portas não teriam o gateway.' }
    ],
    expected_output: 'Na lista de interfaces, "bridge-lan" aparecerá ativa (flag R - Running). Na aba Bridge Ports, as portas exibirão a flag "H" (Hardware offload) indicando comutação por hardware sem uso de CPU.',
    validation_tests: [
      'Teste 1: Conecte dois computadores nas portas ether2 e ether3 com IPs 192.168.10.10 e 192.168.10.20. Realize ping entre eles e confirme resposta em < 1ms.',
      'Teste 2: Conecte as duas pontas de um mesmo cabo de rede entre ether4 e ether5. Observe no menu Bridge Ports que uma das portas entrará no estado "discarding / alternate" sem travar o roteador nem subir o consumo de CPU para 100%.'
    ],
    common_gotchas: [
      'Gotcha Crítico: Configurar o IP na interface "ether2" em vez da interface "bridge-lan". Dispositivos conectados na ether3 não conseguirão comunicar com o gateway.',
      'Gotcha 2: Desmarcar a opção RSTP ou alterar para "none". Qualquer cabo em loop acidental causará travamento imediato por tempestade de broadcast.'
    ],
    diagnostic_procedure: [
      'Verifique se as portas estão com status "H" em Bridge Ports.',
      'Abra IP -> Neighbors para validar se os equipamentos conectados são detectados pelo protocolo MNDP.',
      'Execute `/interface bridge host print` para visualizar a tabela de endereços MAC aprendidos por porta.'
    ],
    security_measures: [
      'Nunca adicione a interface WAN (ether1 conectada à operadora) dentro da bridge local.',
      'Mantenha sempre protocol-mode=rstp ativo na bridge corporativa.'
    ],
    practical_exercise: 'Crie uma bridge chamada "bridge-corp" no RouterOS. Adicione as interfaces ether2 e ether3. Configure o IP 10.50.0.1/24 na bridge. Valide pelo terminal se o IP está ativo com status bound.',
    quiz: {
      question: 'Por que o endereço IP da rede local deve ser configurado na interface "bridge" e não diretamente na porta física "ether2" quando ela faz parte de uma bridge?',
      options: [
        'Porque o RouterOS proíbe fisicamente colocar IP em portas Ethernet.',
        'Porque quando uma porta física se torna escrava de uma bridge, o controle de camada 3 (IP) passa a ser da interface virtual bridge; se o IP estiver na ether2, o tráfego das outras portas da bridge não alcançará o gateway.',
        'Para economizar memória RAM no processador da RouterBOARD.',
        'Apenas por padronização visual no WinBox, sem impacto funcional.'
      ],
      correct: 1,
      explanation: 'Ao adicionar uma interface Ethernet a uma bridge, ela opera puramente em camada 2 (L2 slave). Todos os serviços de camada 3 (endereço IP, DHCP Server, Firewall) devem ser vinculados à interface pai "bridge", garantindo que todas as portas participantes compartilhem o mesmo gateway e serviços.'
    },
    completion_criteria: 'O aluno deve dominar a criação de bridges, associação de portas com hw-offload e compreender a importância do RSTP na prevenção de falhas operacionais.'
  };

  insertLesson.run('l_m4_1', 'm4', 1, 'Criação de Bridges L2, Comutação de Hardware e Prevenção de Loops com RSTP', 50, JSON.stringify(lessonM4L1), 1);

  // Aula Módulo 6 Aula 1 (Internet WAN, Rotas Estáticas e NAT Masquerade)
  const lessonM6L1 = {
    objective: 'Ensinar o técnico a configurar a conexão com a internet via DHCP Client ou IP estático, criar a rota padrão 0.0.0.0/0 e aplicar a regra de NAT Masquerade de forma segura e restrita.',
    simple_theory: 'Para que os computadores de uma empresa acessem a internet através do roteador MikroTik, são necessários três elementos essenciais: um endereço IP na porta WAN, uma rota que aponte para onde enviar os dados de fora da empresa (gateway padrão) e a tradução de endereços (NAT Masquerade), que transforma os IPs privados da rede local no IP público da operadora.',
    technical_concepts: 'O roteamento no RouterOS baseia-se na tabela FIB (Forwarding Information Base). A rota default é definida pelo destino `0.0.0.0/0`. Quando múltiplos links existem, a seleção do melhor caminho utiliza a Distância Administrativa (Distance): rotas com menor distância têm prioridade (Distance 1 supera Distance 2). O NAT (Network Address Translation) no chain `srcnat` com a action `masquerade` reescreve o cabeçalho IP dos pacotes que saem pela interface WAN, substituindo o IP de origem privado (RFC 1918) pelo IP da interface de saída, mantendo a tabela de conexões no conntrack.',
    real_application: 'Em qualquer instalação de link dedicado ou banda larga de provedor em clientes corporativos, o técnico precisa receber o bloco de IP do ISP ou o modem em bridge, subir a WAN, criar a rota default e garantir que o masquerade atue APENAS nos pacotes que saem pela interface de internet, prevenindo vazamentos de rota.',
    topology: {
      type: 'wan_lan_routing',
      title: 'Topologia WAN e LAN com Tradução NAT',
      description: 'Porta ether1 conectada à operadora (WAN) e interface bridge-lan atendendo a rede corporativa interna.',
      devices: [
        { name: 'Operadora / ISP Gateway', ip: '203.0.113.1 (WAN ISP Gateway)', port: 'Fibra / GPON ONT' },
        { name: 'MikroTik ether1 (WAN)', ip: '203.0.113.10/24 (IP Público Estático)', port: 'ether1' },
        { name: 'MikroTik bridge-lan (LAN)', ip: '192.168.10.1/24', port: 'bridge-lan' },
        { name: 'Estação de Trabalho', ip: '192.168.10.50/24 (Gateway: 192.168.10.1)', port: 'Conectado na LAN' }
      ]
    },
    prerequisites: ['Bridge LAN criada e funcional', 'Dados de IP, máscara, gateway e DNS fornecidos pelo provedor ou link PPPoE'],
    step_by_step: [
      '1. Conecte o cabo de rede da operadora na porta ether1.',
      '2. Se a operadora entregar IP via DHCP: Menu IP -> DHCP Client -> [+] -> Interface: ether1 -> Add Default Route: yes -> OK.',
      '3. Se a operadora entregar IP estático: Menu IP -> Addresses -> [+] -> Address: 203.0.113.10/24 -> Interface: ether1.',
      '4. Adicione a rota padrão: Menu IP -> Routes -> [+] -> Dst. Address: 0.0.0.0/0 -> Gateway: 203.0.113.1 -> Distance: 1 -> OK.',
      '5. Configure os servidores DNS da operadora ou públicos (Ex: 1.1.1.1 e 8.8.8.8): Menu IP -> DNS -> Servers: 1.1.1.1, 8.8.8.8 -> Marque "Allow Remote Requests" para atender a LAN.',
      '6. Crie a regra de NAT Masquerade: Menu IP -> Firewall -> Aba NAT -> [+] -> Chain: srcnat -> Out. Interface: ether1 -> Aba Action -> Action: masquerade -> OK.'
    ],
    winbox_steps: [
      'IP -> Addresses -> [+] -> Address: 203.0.113.10/24 -> Interface: ether1 -> Apply',
      'IP -> Routes -> [+] -> Dst. Address: 0.0.0.0/0 -> Gateway: 203.0.113.1 -> Check Gateway: ping -> Apply',
      'IP -> DNS -> Servers: 1.1.1.1, 8.8.8.8 -> Allow Remote Requests: Checked -> Apply',
      'IP -> Firewall -> NAT -> [+] -> Chain: srcnat -> Out. Interface: ether1 -> Action: masquerade -> Apply'
    ],
    cli_commands: [
      '# 1. Configurar o IP estatico da interface WAN\n/ip address add address=203.0.113.10/24 interface=ether1 comment="Link Principal ISP Dedicado"\n',
      '# 2. Configurar a rota padrao com verificacao ativa de gateway (ping)\n/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1 distance=1 check-gateway=ping comment="Rota Default Internet"\n',
      '# 3. Configurar servidores DNS e habilitar cache local para os clientes\n/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes cache-size=4096KiB\n',
      '# 4. Configurar NAT Masquerade OBRIGATORIAMENTE amarrado a out-interface da WAN\n/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade comment="NAT Masquerade Saida Internet"\n'
    ],
    command_explanations: [
      { cmd: '/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1 check-gateway=ping', exp: 'Cria a rota de saída. O parâmetro check-gateway=ping envia pacotes ICMP a cada 10 segundos: se o gateway parar de responder por 2 ciclos, a rota é desativada automaticamente para permitir failover.' },
      { cmd: '/ip dns set ... allow-remote-requests=yes', exp: 'Permite que o MikroTik atue como servidor DNS recursivo para os computadores da rede interna, acelerando requisições com cache local.' },
      { cmd: '/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade', exp: 'Aplica a tradução de endereços. A inclusão de out-interface=ether1 é CRÍTICA para evitar que tráfego entre VLANs internas sofra masquerade indevido.' }
    ],
    expected_output: 'No menu IP -> Routes, a rota 0.0.0.0/0 exibirá as flags "DAc" (Dynamic Active Connect) ou "AS" (Active Static). O terminal responderá com sucesso ao comando `/ping 1.1.1.1 count=4`. Computadores na LAN navegarão normalmente na internet.',
    validation_tests: [
      'Teste 1 (Conectividade IP): No terminal do RouterOS, digite `/ping 1.1.1.1 count=4`. Todos os pacotes devem retornar com 0% packet loss.',
      'Teste 2 (Resolução DNS): Digite `/ping google.com count=4`. O RouterOS deve resolver o domínio para o IP correspondente e responder com sucesso.',
      'Teste 3 (Validação da LAN): Em um computador conectado na LAN, abra o navegador e acesse um site seguro (HTTPS), ou execute `ping 1.1.1.1` e `tracert 1.1.1.1` confirmando o primeiro salto em 192.168.10.1.'
    ],
    common_gotchas: [
      'Erro Crítico: Criar regra de NAT sem especificar `out-interface=ether1`. Todo tráfego interno (inclusive entre VLANs) terá seu IP de origem alterado para o IP da bridge, destruindo a auditoria de logs e bloqueando acessos a servidores internos.',
      'Erro 2: Errar o IP do Gateway na rota estática, deixando a rota com status "unreachable" (inacessível).',
      'Erro 3: Não marcar "Allow Remote Requests" no DNS quando o DHCP dos clientes entrega o IP do MikroTik como servidor DNS.'
    ],
    diagnostic_procedure: [
      '1. O ping para 1.1.1.1 responde, mas sites não abrem? O problema é DNS! Verifique IP -> DNS.',
      '2. O ping para 1.1.1.1 falha do PC, mas funciona no terminal do MikroTik? O problema é NAT Masquerade ou rota de retorno na LAN!',
      '3. O ping para o gateway da operadora falha no terminal do MikroTik? O problema é na camada física (cabo/fibra) ou IP/máscara incorretos na ether1.'
    ],
    security_measures: [
      'Ao marcar "Allow Remote Requests" no DNS, crie IMEDIATAMENTE uma regra de firewall no chain input bloqueando requisições DNS (porta UDP/TCP 53) vindas da interface WAN, para evitar que o roteador seja usado em ataques de amplificação DNS (DNS Amplification DDoS).',
      'Nunca use action=masquerade para conexões com IP público fixo se você precisar garantir portas de saída estáticas; prefira action=src-nat com to-addresses.'
    ],
    practical_exercise: 'Configure um MikroTik de laboratório com IP estático simulado na ether1. Adicione a rota default para o gateway de teste. Habilite o DNS com cache e crie a regra de NAT com out-interface explícita. Valide o acesso com ferramentas de ping e traceroute.',
    quiz: {
      question: 'O que ocorre se um técnico criar uma regra de NAT `/ip firewall nat add chain=srcnat action=masquerade` SEM definir a opção `out-interface`?',
      options: [
        'O roteador reinicia por erro de sintaxe do RouterOS.',
        'A regra continuará funcionando para a internet, porém TODO o tráfego que circular pelo roteador (inclusive entre computadores de VLANs e redes locais distintas) terá o IP de origem substituído indevidamente, impedindo a identificação real das estações e quebrando aplicações locais.',
        'O tráfego de internet é bloqueado automaticamente pelo firewall.',
        'Nenhum pacote sofrerá tradução até que uma out-interface seja selecionada.'
      ],
      correct: 1,
      explanation: 'Sem a restrição de `out-interface` (ou `out-interface-list`), qualquer pacote roteado pelo RouterOS que caia no chain srcnat terá seu IP original mascarado, mesmo pacotes trafegando entre redes locais ou VLANs internas. Isso destrói a visibilidade de rede e quebra controles de segurança.'
    },
    completion_criteria: 'O técnico deve saber diagnosticar com clareza se uma falha de navegação decorre de camada 1 (física), camada 3 (rota default) ou camada 7 (DNS), e aplicar regras de NAT seguras com interface amarrada.'
  };

  insertLesson.run('l_m6_1', 'm6', 1, 'Configuração de WAN, Rota Padrão e NAT Masquerade Seguro', 60, JSON.stringify(lessonM6L1), 1);

  // Aula Módulo 7 Aula 1 (Firewall e Segurança RouterOS)
  const lessonM7L1 = {
    objective: 'Capacitar o técnico a compreender a arquitetura de firewall do RouterOS, dominar as cadeias input, forward e output, o connection tracking e criar regras essenciais de proteção ativa contra acessos não autorizados e ataques de força bruta.',
    simple_theory: 'O firewall do MikroTik funciona como a portaria de um condomínio. Ele examina cada pacote de dados que chega e decide se o pacote tem permissão para entrar no próprio roteador (input), se tem permissão para atravessar o roteador rumo aos computadores da rede (forward), ou se deve ser descartado por segurança.',
    technical_concepts: 'O subsistema de firewall do RouterOS é baseado no Netfilter do Linux com a máquina de estados Connection Tracking (conntrack). As conexões são classificadas em: Established (pacote pertence a conexão já autorizada), Related (conexão auxiliar legítima, como FTP dados), Invalid (pacote malformado ou fora de sequência que deve ser sumariamente descartado) e New (início de nova tentativa de conexão). A cadeia INPUT protege os serviços do próprio roteador (WinBox, SSH, DNS, WebFig). A cadeia FORWARD controla o tráfego que passa pelos clientes da rede interna. Regras de brute-force utilizam a action `add-src-to-address-list` com timeout progressivo (1m, 15m, 24h) para banir temporariamente IPs maliciosos.',
    real_application: 'Em roteadores com IP público na WAN, scanners automáticos na internet tentam centenas de logins por minuto nas portas 8291 (Winbox) e 22 (SSH). A implementação de firewall robusto com listas dinâmicas de bloqueio impede a sobrecarga de CPU e invasões nos clientes corporativos.',
    topology: {
      type: 'firewall_chains',
      title: 'Fluxo das Cadeias do Firewall RouterOS',
      description: 'Pacotes da internet destinados ao roteador entram na cadeia INPUT; pacotes destinados aos clientes passam pela cadeia FORWARD.',
      devices: [
        { name: 'Internet / WAN Externa', ip: 'Atacantes / Tráfego Legítimo', port: 'ether1 (WAN)' },
        { name: 'Roteador MikroTik (Kernel/Serviços)', ip: 'Protegido pela cadeia INPUT', port: 'Winbox, SSH, DNS' },
        { name: 'Rede Local Interna (LAN)', ip: 'Protegida pela cadeia FORWARD', port: 'Computadores, Servidores, Câmeras' }
      ]
    },
    prerequisites: ['Conhecimento prévio de portas TCP/UDP', 'Compreensão de NAT e roteamento básico', 'Safe Mode ativado no WinBox'],
    step_by_step: [
      '1. No WinBox, acesse IP -> Firewall -> Filter Rules.',
      '2. Sempre pressione [F4] para ativar o Safe Mode antes de aplicar qualquer regra que envolva "action=drop".',
      '3. Crie a regra mestre para aceitar conexões já estabelecidas e relacionadas no topo da lista (Chain: input -> Connection State: established,related -> Action: accept).',
      '4. Crie a regra para descartar conexões inválidas (Chain: input -> Connection State: invalid -> Action: drop).',
      '5. Crie a regra autorizando acesso administrativo apenas a partir da lista de IPs confiáveis da gerência (Chain: input -> In. Interface List: !LAN ou Src. Address List: !ADMINS -> Action: drop).',
      '6. Na cadeia Forward: crie regra aceitando established, related e descartando invalid.',
      '7. Crie regra de forward descartando pacotes novos vindos da WAN que tentem acessar a LAN sem terem sido solicitados por ela (Chain: forward -> Connection Nat State: !dstnat -> Connection State: new -> In. Interface: ether1 -> Action: drop).',
      '8. Salve as regras e desative o Safe Mode se tudo continuar respondendo perfeitamente.'
    ],
    winbox_steps: [
      'IP -> Firewall -> Filter Rules -> [+] -> Chain: input -> Connection State: established,related,untracked -> Action: accept -> Apply',
      'IP -> Firewall -> Filter Rules -> [+] -> Chain: input -> Connection State: invalid -> Action: drop -> Apply',
      'IP -> Firewall -> Filter Rules -> [+] -> Chain: input -> In. Interface: ether1 -> Protocol: udp -> Dst. Port: 53 -> Action: drop -> Comment: "Bloqueia DNS externo da WAN" -> Apply',
      'IP -> Firewall -> Filter Rules -> [+] -> Chain: forward -> Connection State: established,related,untracked -> Action: accept -> Apply',
      'IP -> Firewall -> Filter Rules -> [+] -> Chain: forward -> Connection State: invalid -> Action: drop -> Apply',
      'IP -> Firewall -> Filter Rules -> [+] -> Chain: forward -> In. Interface: ether1 -> Connection State: new -> Action: drop -> Comment: "Drop novas conexões vindas da WAN" -> Apply'
    ],
    cli_commands: [
      '# 1. Regras essenciais da cadeia INPUT (Protecao do Roteador)\n/ip firewall filter add chain=input connection-state=established,related,untracked action=accept comment="Aceita conexoes estabelecidas e relacionadas"\n/ip firewall filter add chain=input connection-state=invalid action=drop comment="Descarta pacotes invalidos"\n/ip firewall filter add chain=input protocol=icmp action=accept limit=5,5:packet comment="Permite Ping ICMP com limitador de taxa"\n/ip firewall filter add chain=input in-interface=ether1 protocol=udp dst-port=53 action=drop comment="Bloqueia consultas DNS externas vindas da WAN"\n/ip firewall filter add chain=input in-interface=ether1 action=drop comment="Descarta qualquer outro acesso vindo da WAN ao roteador"\n',
      '# 2. Regras essenciais da cadeia FORWARD (Protecao dos Clientes da LAN)\n/ip firewall filter add chain=forward connection-state=established,related,untracked action=accept comment="Aceita conexoes estabelecidas e relacionadas dos clientes"\n/ip firewall filter add chain=forward connection-state=invalid action=drop comment="Descarta pacotes invalidos"\n/ip firewall filter add chain=forward in-interface=ether1 connection-state=new connection-nat-state=!dstnat action=drop comment="Bloqueia novos acessos externos nao autorizados a LAN"\n'
    ],
    command_explanations: [
      { cmd: 'chain=input connection-state=established,related action=accept', exp: 'Regra de ouro de desempenho e funcionamento. Deve ficar na posição 0 para que 90%+ dos pacotes de conexões legítimas em andamento passem no primeiro teste do processador.' },
      { cmd: 'chain=input in-interface=ether1 action=drop', exp: 'Fecha completamente o roteador para a internet pública, impedindo qualquer tentativa de login em Winbox, WebFig ou SSH vinda de fora da rede corporativa.' },
      { cmd: 'connection-nat-state=!dstnat action=drop', exp: 'Permite que apenas portas explicitamente publicadas via regras de DST-NAT (redirecionamento de portas) passem pela cadeia forward, bloqueando todo o restante vindo da internet.' }
    ],
    expected_output: 'As regras de firewall começam a contabilizar pacotes e bytes nos contadores visíveis na coluna "Packets" e "Bytes". O roteador deixa de responder a varreduras de portas vindas da interface WAN, permanecendo 100% responsivo para os usuários da rede interna.',
    validation_tests: [
      'Teste 1: A partir da rede interna, confirme se o Winbox continua conectando normalmente.',
      'Teste 2: A partir de um computador conectado externamente na porta WAN (ou simulando tráfego externo), tente acessar a porta 8291 do Winbox e valide que a conexão dá "Timeout" e os contadores da regra de drop aumentam.',
      'Teste 3: Verifique se os computadores da rede interna continuam navegando na internet e baixando arquivos normalmente.'
    ],
    common_gotchas: [
      'Gotcha Fatal: Colocar uma regra de "action=drop" na cadeia input SEM ter criado antes a regra de "accept established,related" e sem especificar interface ou IP de origem. Isso causará BLOQUEIO IMEDIATO do técnico (Lockout total), exigindo reset físico se o Safe Mode não estiver ativado!',
      'Gotcha 2: Ordem errada das regras. No RouterOS, o firewall avalia as regras de cima para baixo (top-down). Se uma regra de drop geral ficar antes de uma regra de exceção, a exceção nunca será lida.'
    ],
    diagnostic_procedure: [
      'Se o técnico perder o acesso: Aguarde 10 segundos para o Safe Mode reverter a mudança.',
      'Se não estava em Safe Mode: Conecte via console serial ou utilize o WinBox conectando via MAC address (em alguns casos o MAC winbox ainda responde se a interface bridge não foi bloqueada).',
      'Habilite a flag "Log" na regra suspeita temporariamente para visualizar no menu Log exatamente quais pacotes estão sendo descartados.'
    ],
    security_measures: [
      'NUNCA exponha a porta padrão do Winbox (8291) diretamente para a internet aberta sem restrição de IP de origem (src-address-list).',
      'Para acesso remoto seguro da equipe técnica, utilize SEMPRE uma VPN (como WireGuard) em vez de publicar portas de gerência na WAN.'
    ],
    practical_exercise: 'No roteador de bancada, ative o Safe Mode. Implemente o conjunto básico de regras para as cadeias Input e Forward. Teste o acesso local e valide que pacotes externos simulados são descartados nos contadores.',
    quiz: {
      question: 'Qual a diferença entre a cadeia "INPUT" e a cadeia "FORWARD" no firewall do MikroTik RouterOS?',
      options: [
        'A cadeia INPUT processa apenas pacotes que entram pela porta ether1 e a cadeia FORWARD processa pacotes que saem pela ether2.',
        'A cadeia INPUT trata exclusivamente dos pacotes cujo destino final é o próprio roteador (como acesso ao WinBox e consultas DNS locais); a cadeia FORWARD trata dos pacotes que passam através do roteador rumo a outros dispositivos da rede.',
        'A cadeia INPUT só funciona para tráfego IPv6 e a FORWARD para IPv4.',
        'Não há diferença de destino, tratam-se apenas de nomes didáticos opcionais.'
      ],
      correct: 1,
      explanation: 'Esta é a base conceitual de segurança no RouterOS: INPUT protege os serviços e processos do próprio MikroTik (kernel, winbox, dns, ssh), enquanto FORWARD filtra os dados dos clientes que trafegam de uma interface para outra através do equipamento.'
    },
    completion_criteria: 'O técnico deve demonstrar pleno domínio da ordem de avaliação top-down das regras, manuseio do Safe Mode e distinção entre cadeias input e forward sem hesitação.'
  };

  insertLesson.run('l_m7_1', 'm7', 1, 'Arquitetura de Firewall: Cadeias Input, Forward, Conntrack e Proteção do Roteador', 60, JSON.stringify(lessonM7L1), 1);

  // Aula Módulo 8 Aula 1 (VLANs Corporativas e Bridge VLAN Filtering)
  const lessonM8L1 = {
    objective: 'Ensinar o técnico a planejar e implementar segmentação de rede corporativa com VLANs 802.1Q utilizando a arquitetura moderna Bridge VLAN Filtering do RouterOS v7 com Hardware Offloading.',
    simple_theory: 'Imagine que uma empresa tem vários departamentos que não podem se misturar: financeiro, recepção de visitantes e câmeras de segurança. Em vez de comprar três switches separados e passar três cabos de rede em cada sala, usamos VLANs (redes virtuais). Elas colocam "etiquetas" invisíveis nos cabos de rede para que o mesmo switch e roteador mantenham o tráfego de cada setor totalmente isolado e seguro.',
    technical_concepts: 'O padrão IEEE 802.1Q insere uma tag de 4 bytes no cabeçalho Ethernet contendo o VLAN ID (1 a 4094). No RouterOS v7, a melhor prática oficial é utilizar uma ÚNICA bridge com `vlan-filtering=yes`. As portas de acesso (untagged) recebem a tag de entrada através do PVID (Port VLAN ID) e a etiqueta é removida na saída. As portas trunk (tagged) transportam múltiplos VLAN IDs entre roteadores e switches mantendo as tags. As interfaces virtuais `/interface vlan` são criadas sobre a interface bridge para atuar como gateway L3 de cada sub-rede.',
    real_application: 'Em uma empresa com 50 funcionários, o técnico cria a VLAN 10 (Administração), VLAN 20 (Operacional), VLAN 30 (Visitantes) e VLAN 40 (CFTV). Os visitantes têm acesso apenas à internet, sem conseguir enxergar computadores corporativos ou o gravador de câmeras NVR.',
    topology: {
      type: 'vlan_segmentation',
      title: 'Topologia Corporativa Segmentada por VLANs',
      description: 'Uma única bridge no MikroTik RB4011 distribuindo 4 VLANs distintas via trunk na ether5 para switch gerenciável.',
      devices: [
        { name: 'MikroTik RB4011 (Core Gateway)', ip: 'VLAN 10: 10.10.10.1/24 | VLAN 20: 10.20.20.1/24 | VLAN 30: 172.16.30.1/24', port: 'bridge-lan' },
        { name: 'Switch Gerenciável CRS / EdgeSwitch', ip: 'Gerência VLAN 10: 10.10.10.2/24', port: 'Trunk conectado na ether5' },
        { name: 'Rede Visitantes (Wi-Fi Guest)', ip: 'Sub-rede isolada 172.16.30.0/24 (VLAN 30)', port: 'SSID Visitantes nos APs' },
        { name: 'CFTV / Câmeras IP', ip: 'Sub-rede isolada 10.40.40.0/24 (VLAN 40)', port: 'Portas de acesso untagged PVID 40' }
      ]
    },
    prerequisites: ['Compreensão de switching L2 e bridges', 'Planejamento prévio do mapa de endereçamento e VLAN IDs', 'Safe Mode ativado'],
    step_by_step: [
      '1. Crie a interface bridge padrão: `bridge-lan` com `vlan-filtering=no` inicialmente (para não perder o acesso durante a configuração).',
      '2. Crie as interfaces virtuais de camada 3 (gateways) associadas à bridge: `vlan10-adm` (ID 10) e `vlan30-visitantes` (ID 30) em Interfaces -> VLAN.',
      '3. Atribua os endereços IP a cada interface VLAN: 10.10.10.1/24 na vlan10-adm e 172.16.30.1/24 na vlan30-visitantes.',
      '4. Crie os pools e servidores DHCP independentes para cada VLAN.',
      '5. Configure as portas na bridge: defina a porta de acesso do técnico (ether2) com PVID 10 e a porta de uplink do switch (ether5) como trunk.',
      '6. Na tabela Bridge -> VLANs, adicione as entradas: VLAN ID 10 com Tagged: bridge-lan, ether5 e Untagged: ether2. Adicione VLAN ID 30 com Tagged: bridge-lan, ether5.',
      '7. Pressione F4 para Safe Mode e altere na bridge: `vlan-filtering=yes`.',
      '8. Crie as regras de isolamento no Firewall Forward para impedir que a VLAN 30 acesse a VLAN 10.'
    ],
    winbox_steps: [
      'Interfaces -> [+] -> VLAN -> Name: vlan10-adm, VLAN ID: 10, Interface: bridge-lan -> Apply',
      'Interfaces -> [+] -> VLAN -> Name: vlan30-visitantes, VLAN ID: 30, Interface: bridge-lan -> Apply',
      'IP -> Addresses -> [+] -> Address: 10.10.10.1/24 -> Interface: vlan10-adm -> Apply',
      'IP -> Addresses -> [+] -> Address: 172.16.30.1/24 -> Interface: vlan30-visitantes -> Apply',
      'Bridge -> Ports -> ether2: PVID 10 -> Apply | ether5: PVID 1 (Trunk) -> Apply',
      'Bridge -> VLANs -> [+] -> Bridge: bridge-lan, VLAN IDs: 10, Tagged: bridge-lan, ether5, Untagged: ether2 -> Apply',
      'Bridge -> VLANs -> [+] -> Bridge: bridge-lan, VLAN IDs: 30, Tagged: bridge-lan, ether5 -> Apply',
      'Bridge -> bridge-lan -> VLAN Filtering: Checked -> OK'
    ],
    cli_commands: [
      '# 1. Criar interfaces VLAN L3 sobre a interface bridge\n/interface vlan add name=vlan10-adm vlan-id=10 interface=bridge-lan\n/interface vlan add name=vlan30-guest vlan-id=30 interface=bridge-lan\n',
      '# 2. Configurar IPs de Gateway em cada interface VLAN\n/ip address add address=10.10.10.1/24 interface=vlan10-adm comment="Gateway Adm"\n/ip address add address=172.16.30.1/24 interface=vlan30-guest comment="Gateway Visitantes"\n',
      '# 3. Configurar portas de acesso e trunks na Bridge\n/interface bridge port set [find interface=ether2] pvid=10\n/interface bridge port set [find interface=ether5] pvid=1\n',
      '# 4. Declarar a tabela de membros 802.1Q na Bridge\n/interface bridge vlan add bridge=bridge-lan vlan-ids=10 tagged=bridge-lan,ether5 untagged=ether2\n/interface bridge vlan add bridge=bridge-lan vlan-ids=30 tagged=bridge-lan,ether5\n',
      '# 5. Habilitar a filtragem de VLANs na Bridge\n/interface bridge set bridge-lan vlan-filtering=yes\n',
      '# 6. Regra de Firewall para isolar a rede de visitantes da rede administrativa\n/ip firewall filter add chain=forward src-address=172.16.30.0/24 dst-address=10.10.10.0/24 action=drop comment="Bloqueia Visitantes acessando Rede Corporativa"\n'
    ],
    command_explanations: [
      { cmd: 'tagged=bridge-lan,ether5', exp: 'Incluir a interface lógica bridge-lan como tagged é OBRIGATÓRIO para que o processador L3 do RouterOS consiga receber os pacotes daquela VLAN e atuar como gateway/DHCP.' },
      { cmd: 'bridge set bridge-lan vlan-filtering=yes', exp: 'Liga o motor de filtragem 802.1Q no chip de switch. Portas sem tag correspondente descartam pacotes automaticamente em camada 2.' },
      { cmd: '/ip firewall filter add chain=forward src-address=... action=drop', exp: 'O roteamento entre VLANs é ativado automaticamente pelo kernel do RouterOS. Para que haja isolamento efetivo, é indispensável a regra de bloqueio no firewall.' }
    ],
    expected_output: 'Na tabela Bridge VLANs, as flags exibirão "D" (Dynamic) para untagged automáticos e "A" (Active). Computadores conectados na porta ether2 receberão IP da faixa 10.10.10.0/24. Dispositivos na VLAN 30 receberão IP 172.16.30.0/24, navegarão na internet, mas não conseguirão pingar 10.10.10.1 nem qualquer estação corporativa.',
    validation_tests: [
      'Teste 1: Conecte o notebook na porta ether2. Verifique via `ipconfig` se o IP recebido é 10.10.10.x com gateway 10.10.10.1.',
      'Teste 2: A partir de um dispositivo na VLAN 30, execute `ping 10.10.10.10` (PC financeiro) e valide se o firewall descarta o pacote com mensagem "Destination host unreachable" ou timeout.',
      'Teste 3: Abra o terminal do MikroTik e digite `/interface bridge vlan print` para inspecionar os membros tagged e untagged ativos.'
    ],
    common_gotchas: [
      'Causa Número 1 de Perda de Acesso: Esquecer de adicionar a própria interface `bridge-lan` na lista de portas `tagged` daquela VLAN antes de marcar `vlan-filtering=yes`. Ao ativar a filtragem, a CPU é desconectada da VLAN e o técnico perde o Winbox imediatamente!',
      'Gotcha 2: Usar múltiplas bridges em um mesmo switch CRS antigo, desativando o hardware offloading e jogando o processador para 100% de uso.'
    ],
    diagnostic_procedure: [
      'Se o cliente da VLAN não recebe IP: Verifique se a porta física do switch está configurada como Trunk (tagged) e se a interface VLAN foi criada sobre a Bridge e não sobre a porta física etherX.',
      'Verifique `/interface bridge host print where vlan-id=10` para checar se os endereços MAC estão sendo aprendidos com o VLAN ID correto.'
    ],
    security_measures: [
      'Nunca deixe a VLAN 1 (default PVID) trafegando serviços sensíveis de gerência.',
      'Crie sempre regras restritivas no firewall forward impedindo redes de convidados e IoT de iniciarem conexões contra redes de dados e servidores.'
    ],
    practical_exercise: 'Crie uma topologia de laboratório com VLAN 10 (Gerência) e VLAN 20 (Dados). Configure gateways, pools DHCP e ative o bridge vlan filtering. Aplique regra de bloqueio mútuo e valide o isolamento com testes de ping.',
    quiz: {
      question: 'Ao implementar Bridge VLAN Filtering no RouterOS v7, por que é obrigatório incluir a própria interface "bridge" como porta TAGGED nas entradas de VLAN em `/interface bridge vlan`?',
      options: [
        'Apenas por exigência estética do WinBox, sem impacto técnico.',
        'Para permitir que a CPU do RouterOS (camada 3) receba os pacotes daquela VLAN específica e possa atuar como Gateway, servidor DHCP e aplicar regras de firewall.',
        'Para impedir que o switch esquente com o tráfego.',
        'Para dobrar a velocidade de transmissão da porta física.'
      ],
      correct: 1,
      explanation: 'No modelo unificado de bridge do RouterOS, a interface bridge representa o canal de comunicação entre o switch L2 e o processador L3 do roteador. Se a bridge não for membro tagged da VLAN, os pacotes nunca alcançarão a interface `/interface vlan`, deixando o roteador sem comunicação L3 com aquela rede.'
    },
    completion_criteria: 'O aluno deve conseguir desenhar e aplicar um projeto completo de segmentação corporativa com Bridge VLAN Filtering sem perder o acesso ao roteador.'
  };

  insertLesson.run('l_m8_1', 'm8', 1, 'Segmentação Corporativa com VLANs 802.1Q e Bridge VLAN Filtering no RouterOS v7', 60, JSON.stringify(lessonM8L1), 1);

  // Insere todas as demais aulas dos módulos
  for (const l of allLessons) {
    insertLesson.run(l.id, l.module_id, l.lesson_number, l.title, l.duration_minutes, JSON.stringify(l.content), 1);
  }
}

function seedLabs() {
  const insertLab = db.prepare(`
    INSERT INTO labs (id, module_id, title, difficulty, scenario_type, description, topology_json, initial_config, symptoms, evidence_json, hints_json, expected_solution, root_cause_explanation, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Lab 1: Roteador sem Acesso à Internet (Falta rota default)
  const lab1 = {
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
  };

  // Lab 2: Falha de Masquerade NAT (Pacotes descartados na WAN)
  const lab2 = {
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
/ip dns set servers=1.1.1.1 allow-remote-requests=yes
# Observe a tabela de NAT:
/ip firewall nat print
Flags: X - disabled, I - invalid, D - dynamic
0    chain=dstnat dst-port=8080 action=dst-nat to-addresses=10.0.0.200 to-ports=80 protocol=tcp`,
    symptoms: '1. O MikroTik consegue pingar `google.com` e `1.1.1.1` com sucesso no New Terminal.\n2. Os computadores da empresa pegam IP 10.0.0.x/24, pingam o gateway 10.0.0.1 com sucesso, mas o ping para 1.1.1.1 dá timeout.\n3. O comando Torch na ether1 revela pacotes saindo com IP de origem 10.0.0.x diretamente para a WAN da operadora.',
    evidence_json: JSON.stringify([
      { tool: 'MikroTik Terminal Ping', output: '/ping 1.1.1.1 count=3 -> 0% packet loss, RTT 4ms' },
      { tool: 'Cliente LAN Ping', output: 'C:\\> ping 1.1.1.1 -> Esgotado o tempo limite do pedido (Request timed out)' },
      { tool: 'Tool Torch em ether1', output: 'Src: 10.0.0.55 -> Dst: 1.1.1.1 (Protocol ICMP) - Nenhum pacote de retorno (Unreplied)' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: Por que a operadora de internet descarta pacotes que saem com IP privado RFC 1918 (10.0.0.x)?',
      'Dica 2: Falta a regra de tradução de endereços de origem (srcnat) com ação masquerade amarrada à interface WAN.'
    ]),
    expected_solution: '/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade',
    root_cause_explanation: 'Ausência da regra de NAT Masquerade no chain srcnat. Como os pacotes dos clientes saíam com o endereço privado 10.0.0.x pela porta WAN, os roteadores da internet descartavam o tráfego por serem endereços não roteáveis publicamente (RFC 1918). Sem a regra de masquerade, não havia reescrita do IP de origem para o IP público 200.180.50.2.'
  };

  // Lab 3: DNS Incorreto (Navegação IP funciona, nomes falham)
  const lab3 = {
    id: 'lab3',
    module_id: 'm5',
    title: 'Cenário 03: Internet Funciona via IP, mas Todos os Sites Apresentam Erro de Conexão',
    difficulty: 'Básico',
    scenario_type: 'dns_misconfiguration',
    description: 'Após uma tempestade que causou oscilação de energia no rack corporativo, os usuários relatam que "a internet caiu". Durante o atendimento remoto, o técnico percebe que o comando `ping 8.8.8.8` no computador do cliente responde perfeitamente, mas nenhum site (como `uol.com.br` ou `google.com`) abre no navegador.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'dns_pub', label: 'DNS Primário Público', ip: '1.1.1.1', status: 'online' },
        { id: 'rtr', label: 'MikroTik Gateway', ip: '192.168.88.1', status: 'warning' },
        { id: 'pc', label: 'PC do Cliente (DNS: 192.168.88.1)', ip: '192.168.88.20', status: 'degraded' }
      ],
      links: [
        { from: 'dns_pub', to: 'rtr', label: 'WAN' },
        { from: 'rtr', to: 'pc', label: 'LAN DHCP' }
      ]
    }),
    initial_config: `/ip dns set servers=192.0.2.254 allow-remote-requests=no
/ip dhcp-server network add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=192.168.88.1`,
    symptoms: '1. Ping para IP numérico (ping 8.8.8.8) responde em 12ms a partir do notebook do cliente.\n2. O comando `nslookup google.com` no computador cliente resulta em "DNS request timed out".\n3. O servidor DNS configurado no MikroTik aponta para um IP inativo e a opção de requisições remotas está desligada.',
    evidence_json: JSON.stringify([
      { tool: 'Cliente Teste Ping IP', output: 'C:\\> ping 1.1.1.1 -> Resposta de 1.1.1.1: bytes=32 tempo=11ms TTL=58' },
      { tool: 'Cliente Nslookup', output: 'C:\\> nslookup google.com 192.168.88.1 -> *** DNS request timed out. Servidor: UnKnown' },
      { tool: 'MikroTik DNS Export', output: 'servers: 192.0.2.254 (IP inválido/inativo) | allow-remote-requests: no' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: O DHCP dos clientes aponta o próprio MikroTik (192.168.88.1) como resolvedor DNS.',
      'Dica 2: Para o MikroTik resolver nomes para os clientes, ele precisa de servidores DNS válidos e a flag `allow-remote-requests` deve estar como `yes`.'
    ]),
    expected_solution: '/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes',
    root_cause_explanation: 'Servidor DNS inalcançável configurado no RouterOS e parâmetro `allow-remote-requests` desativado (`no`). Como as estações de trabalho estavam configuradas para utilizar o IP do MikroTik como resolvedor DNS, o roteador recusava as requisições na porta UDP 53 e também não conseguia resolver consultas externas.'
  };

  // Lab 4: Firewall bloqueando tráfego legítimo
  const lab4 = {
    id: 'lab4',
    module_id: 'm7',
    title: 'Cenário 04: Bloqueio Total de Tráfego por Ordem Incorreta de Regra no Firewall Forward',
    difficulty: 'Intermediário',
    scenario_type: 'firewall_drop_misordered',
    description: 'Um novo técnico adicionou uma regra no firewall para bloquear downloads indesejados. Imediatamente após a aplicação, toda a rede da empresa parou de navegar. O link de internet está 100% UP, a rota default existe e o NAT está configurado.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'wan', label: 'Internet WAN', ip: '200.20.10.1', status: 'online' },
        { id: 'fw', label: 'MikroTik Firewall Filter', ip: 'Forward Chain', status: 'error' },
        { id: 'lan', label: 'Usuários Corporativos', ip: '192.168.0.0/24', status: 'blocked' }
      ],
      links: [
        { from: 'wan', to: 'fw', label: 'WAN' },
        { from: 'fw', to: 'lan', label: 'LAN' }
      ]
    }),
    initial_config: `/ip firewall filter print
Flags: X - disabled, I - invalid, D - dynamic
0   chain=forward action=drop comment="Regra de Bloqueio Geral Adicionada"
1   chain=forward connection-state=established,related action=accept
2   chain=forward in-interface=bridge-lan out-interface=ether1 action=accept`,
    symptoms: '1. O contador de pacotes da regra número 0 (action=drop) está disparando centenas de pacotes por segundo.\n2. Nenhuma estação consegue abrir páginas web nem estabelecer conexões TCP.\n3. O roteador navega no terminal, mas a cadeia forward descarta todo o tráfego dos clientes.',
    evidence_json: JSON.stringify([
      { tool: 'Firewall Filter Counters', output: 'Regra 0 (chain=forward action=drop): 14.820 packets, 8.4 MB (Contador crescendo rapidamente)' },
      { tool: 'Regra 1 (accept established,related)', output: '0 packets, 0 bytes (Nunca é atingida pelo fluxo de pacotes)' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: O firewall do RouterOS lê as regras de cima para baixo (top-down) sequencialmente.',
      'Dica 2: A regra de drop sem filtros no topo descarta qualquer pacote antes que as regras de permissão sejam avaliadas. A regra precisa ser removida ou movida.'
    ]),
    expected_solution: '/ip firewall filter remove [find comment="Regra de Bloqueio Geral Adicionada"]',
    root_cause_explanation: 'Avaliação Top-Down do Firewall do RouterOS. Ao inserir uma regra genérica de `action=drop` no topo da cadeia forward (índice 0) sem nenhum critério de filtro de interface, porta ou estado, o kernel descarta 100% dos pacotes antes que cheguem às regras de autorização de tráfego.'
  };

  // Lab 5: VLAN sem comunicação por falta de Tagged na Bridge
  const lab5 = {
    id: 'lab5',
    module_id: 'm8',
    title: 'Cenário 05: Clientes da Nova VLAN de Visitantes Não Recebem IP nem Navegam',
    difficulty: 'Avançado',
    scenario_type: 'vlan_bridge_mismatch',
    description: 'A equipe implantou a VLAN 30 para a rede de visitantes em um switch CRS e access points corporativos. O servidor DHCP da VLAN 30 foi criado no MikroTik, mas nenhum cliente que conecta no Wi-Fi de visitantes consegue obter endereço IP.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'rtr_l3', label: 'MikroTik CPU L3 (vlan30-guest)', ip: '172.16.30.1/24', status: 'isolated' },
        { id: 'bridge', label: 'Bridge VLAN Filtering', ip: 'vlan-filtering=yes', status: 'active' },
        { id: 'sw', label: 'Switch L2 Trunk (ether5)', ip: 'VLAN 30 Tagged', status: 'online' }
      ],
      links: [
        { from: 'rtr_l3', to: 'bridge', label: 'Sem Tag na Bridge' },
        { from: 'bridge', to: 'sw', label: 'ether5 (Trunk)' }
      ]
    }),
    initial_config: `/interface bridge add name=bridge-lan vlan-filtering=yes
/interface vlan add name=vlan30-guest vlan-id=30 interface=bridge-lan
/ip address add address=172.16.30.1/24 interface=vlan30-guest
/ip pool add name=pool-guest ranges=172.16.30.50-172.16.30.200
/ip dhcp-server add name=dhcp-guest interface=vlan30-guest address-pool=pool-guest
# Observe a tabela /interface bridge vlan:
/interface bridge vlan print
Flags: X - disabled, D - dynamic
0   bridge=bridge-lan vlan-ids=30 tagged=ether5 untagged=""`,
    symptoms: '1. O DHCP Server `dhcp-guest` exibe status em vermelho e os clientes ficam com IP de autoconfiguração 169.254.x.x.\n2. O log do MikroTik exibe requisições DHCP Discover chegando na porta ether5 com tag 30, mas nenhuma resposta é enviada.\n3. A interface `bridge-lan` não está listada como membro tagged da VLAN 30 na tabela de Bridge VLANs.',
    evidence_json: JSON.stringify([
      { tool: 'Packet Sniffer em vlan30-guest', output: 'Nenhum pacote recebido na interface L3 vlan30-guest' },
      { tool: 'Bridge VLAN Export', output: 'vlan-ids=30 tagged=ether5 (Falta incluir a própria interface bridge-lan)' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: Para que o RouterOS (camada 3) atue como gateway e servidor DHCP de uma VLAN em Bridge VLAN Filtering, a própria interface `bridge-lan` precisa estar como membro TAGGED da VLAN.',
      'Dica 2: Adicione a interface `bridge-lan` na lista de portas tagged da VLAN 30.'
    ]),
    expected_solution: '/interface bridge vlan set [find vlan-ids=30] tagged=bridge-lan,ether5',
    root_cause_explanation: 'A interface bridge-lan não estava associada como membro tagged da VLAN 30 em `/interface bridge vlan`. Quando o Bridge VLAN Filtering está ativo, os pacotes marcados com VLAN ID 30 vindos do switch pela ether5 eram comutados pelo chip L2, mas eram impedidos de subir para o processador (CPU L3) do roteador, isolando a interface virtual `vlan30-guest` do DHCP e do gateway.'
  };

  // Lab 6: Falha de Túnel WireGuard (Handshake não estabelece por porta ou chaves)
  const lab6 = {
    id: 'lab6',
    module_id: 'm10',
    title: 'Cenário 06: Túnel VPN WireGuard Entre Matriz e Filial Não Estabelece Conexão',
    difficulty: 'Avançado',
    scenario_type: 'wireguard_handshake_failed',
    description: 'O técnico de campo configurou a interligação de duas filiais com RouterOS v7 via WireGuard. Os endereços IP da VPN foram atribuídos, mas o status do peer exibe "last handshake: never" e não há tráfego de dados entre as redes.',
    topology_json: JSON.stringify({
      nodes: [
        { id: 'matriz', label: 'RTR Matriz (IP: 200.50.1.1)', ip: 'WG: 10.255.0.1/30 (UDP 51820)', status: 'online' },
        { id: 'filial', label: 'RTR Filial (IP Dinâmico)', ip: 'WG: 10.255.0.2/30', status: 'handshake_failed' }
      ],
      links: [
        { from: 'matriz', to: 'filial', label: 'WireGuard Tunnel (UDP 51820)' }
      ]
    }),
    initial_config: `# Configuracao do RouterOS Matriz:
/interface wireguard add name=wg-matriz listen-port=51820
/ip address add address=10.255.0.1/30 interface=wg-matriz
/interface wireguard peers add interface=wg-matriz public-key="FILIAL_PUB_KEY_abc123" allowed-address=10.255.0.2/32,192.168.20.0/24
# Observe a regra de firewall de entrada na Matriz:
/ip firewall filter print where chain=input
0   chain=input in-interface=ether1 protocol=udp dst-port=51820 action=drop comment="Bloqueio incorreto de porta UDP"`,
    symptoms: '1. Na Filial, a janela de Peers do WireGuard mostra bytes enviados crescendo, mas 0 bytes recebidos e "last handshake" em branco.\n2. O ping de 10.255.0.2 para 10.255.0.1 dá 100% de perda de pacotes.\n3. O firewall da Matriz está descartando pacotes UDP na porta 51820 vindos da WAN.',
    evidence_json: JSON.stringify([
      { tool: 'WireGuard Peer Monitor', output: 'Interface: wg-matriz | Last Handshake: never | Tx: 1.4 KiB | Rx: 0 B' },
      { tool: 'Firewall Filter Counter', output: 'Regra Drop UDP 51820: 38 pacotes descartados' }
    ]),
    hints_json: JSON.stringify([
      'Dica 1: O WireGuard opera exclusivamente através do protocolo UDP na porta configurada (padrão 51820).',
      'Dica 2: Verifique a regra no chain input do firewall da Matriz que está descartando a porta do WireGuard.'
    ]),
    expected_solution: '/ip firewall filter set [find dst-port=51820] action=accept',
    root_cause_explanation: 'Bloqueio no Firewall de Entrada (Chain INPUT) da Matriz. O tráfego UDP na porta 51820, necessário para o aperto de mão (handshake) criptográfico do protocolo WireGuard, estava sendo sumariamente descartado antes de atingir o serviço da interface WireGuard.'
  };

  insertLab.run(...Object.values(lab1), 1);
  insertLab.run(...Object.values(lab2), 1);
  insertLab.run(...Object.values(lab3), 1);
  insertLab.run(...Object.values(lab4), 1);
  insertLab.run(...Object.values(lab5), 1);
  insertLab.run(...Object.values(lab6), 1);
}

function seedQuestions() {
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, module_id, question_text, options_json, correct_index, explanation, question_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Insere todas as questões dos 15 módulos
  for (const q of allQuestions) {
    insertQuestion.run(
      q.id,
      q.module_id,
      q.question_text,
      JSON.stringify(q.options),
      q.correct_index,
      q.explanation,
      q.question_type
    );
  }
}

function seedProgress() {
  const insertProgress = db.prepare(`
    INSERT INTO student_progress (id, user_id, lesson_id, status)
    VALUES (?, ?, ?, ?)
  `);

  const insertQuizAttempt = db.prepare(`
    INSERT INTO quiz_attempts (id, user_id, module_id, score, total_questions, percentage, passed, answers_json, attempt_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Progresso para o técnico Carlos (iniciando)
  insertProgress.run('p1', 'u1', 'l_m3_1', 'completed');
  insertQuizAttempt.run('qa1', 'u1', 'm1', 2, 2, 100.0, 1, JSON.stringify({ q_m1_1: 0, q_m1_2: 1 }), 1);

  // Progresso para a técnica Mariana (avançada)
  insertProgress.run('p2', 'u2', 'l_m3_1', 'completed');
  insertProgress.run('p3', 'u2', 'l_m4_1', 'completed');
  insertProgress.run('p4', 'u2', 'l_m6_1', 'completed');
  insertProgress.run('p5', 'u2', 'l_m7_1', 'completed');
  insertProgress.run('p6', 'u2', 'l_m8_1', 'completed');
  insertQuizAttempt.run('qa2', 'u2', 'm1', 2, 2, 100.0, 1, JSON.stringify({ q_m1_1: 0, q_m1_2: 1 }), 1);
  insertQuizAttempt.run('qa3', 'u2', 'm2', 1, 1, 100.0, 1, JSON.stringify({ q_m2_1: 1 }), 1);
  insertQuizAttempt.run('qa4', 'u2', 'm3', 1, 1, 100.0, 1, JSON.stringify({ q_m3_1: 1 }), 1);
  insertQuizAttempt.run('qa5', 'u2', 'm6', 1, 1, 100.0, 1, JSON.stringify({ q_m6_1: 1 }), 1);
  insertQuizAttempt.run('qa6', 'u2', 'm7', 1, 1, 100.0, 1, JSON.stringify({ q_m7_1: 1 }), 1);
  insertQuizAttempt.run('qa7', 'u2', 'm8', 1, 1, 100.0, 1, JSON.stringify({ q_m8_1: 1 }), 1);

  // Certificado emitido para Mariana
  const certId = 'cert_' + crypto.randomBytes(6).toString('hex');
  const certCode = 'ISP-MKT-2026-9842';
  const certHash = crypto.createHash('sha256').update(certCode + 'Mariana Alencar Rocha').digest('hex');

  db.prepare(`
    INSERT INTO certificates (id, certificate_code, user_id, user_name, course_title, final_grade, hours_completed, verification_hash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    certId,
    certCode,
    'u2',
    'Mariana Alencar Rocha',
    'Formação Especialista MikroTik RouterOS - Operações de Rede ISP',
    98.5,
    140,
    certHash,
    'valid'
  );

  // Logs de auditoria iniciais
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, username, action, target, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('log1', 'u4', 'gestor.roberto', 'SISTEMA_INICIALIZADO', 'Banco de Dados', 'Criação inicial da base técnica da Academia MikroTik com 15 módulos');
  insertAudit.run('log2', 'u3', 'instrutor.andre', 'PUBLICACAO_MODULO', 'Módulos 1 a 15', 'Homologação e publicação de conteúdo técnico oficial com 18 seções obrigatórias');
}
