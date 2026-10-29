# Academia Técnica MikroTik — Plataforma de Capacitação ISP

> Plataforma corporativa de LMS, laboratórios interativos de troubleshooting de redes e gestão de competências para técnicos de telecomunicações e provedores de internet (ISPs).

---

## 🎯 Visão Geral do Sistema

A **Academia Técnica MikroTik** foi desenvolvida para capacitação e qualificação contínua de equipes técnicas (NOC, Suporte N1/N2, Técnicos de Instalação e Engenheiros de Redes).

### 🧩 Pilares da Plataforma

1. **LMS Corporativo Especializado**:
   - 15 módulos progressivos (do modelo OSI até BGP, OSPF, VLANs, MPLS e Firewall avançado).
   - Aulas práticas com objetivos, topologia, comandos RouterOS v6 vs v7, saídas esperadas, testes de validação e critérios de conclusão.
   - Avaliações de desempenho (quizzes técnicos) com cálculo automático de notas e diagnóstico de pontos fracos.

2. **Laboratórios Práticos de Troubleshooting**:
   - 6 bancadas interativas de simulação CLI de RouterOS v7 e utilitário WinBox.
   - Diagnóstico estruturado: observação de sintomas, testes com ferramentas de rede (`ping`, `traceroute`, `export`, `dns`, `ip-scan`), formulação de hipótese e envio de comandos de correção validados pelo backend.

3. **Projeto Final Empresarial (7 Etapas)**:
   - Cenário prático de implantação em empresa cliente (50 estações, 2 links WAN redundantes, 4 VLANs, Wi-Fi corporativo, VPN WireGuard e QoS).
   - Rascunho salvo no banco de dados e envio formal para revisão e nota do instrutor/gestor.

4. **11 Procedimentos Operacionais Padrão (POPs ISP)**:
   - Checklists operacionais, tabela comparativa de sintaxe RouterOS v6 vs v7 e portas essenciais para telecomunicações.

5. **Gestão e NOC**:
   - Painel administrativo e de instrutor com controle de alunos, relatórios individuais e coletivos, auditoria de ações, revisão de projetos finais e editor de conteúdo.
   - Emissão de certificados internos com código de autenticidade único e verificação pública.

---

## 🛠️ Tecnologias e Arquitetura

- **Backend**: Node.js (v20+ / v22+) nativo com ESM (`import/export`), sem dependências externas frágeis.
- **Banco de Dados**: SQLite nativo via `node:sqlite` (`DatabaseSync`), integrado, rápido e com persistência em arquivo local (`data/mikrotik_academy.db`).
- **Frontend**: Vanilla ES Modules moderno, hash routing SPA (`#dashboard`, `#syllabus`, `#labs`, `#final-project`, `#materials`, `#profile`, `#admin`), responsivo para desktop, tablet e celular.
- **Estilo**: CSS moderno com tema corporativo escuro (*dark mode* sóbrio, paleta grafite/azul MikroTik, foco em acessibilidade e tipografia limpa).

---

## 🚀 Como Executar em Produção

### Pré-requisitos
- **Node.js**: Versão 22 ou superior instalada (para suporte nativo ao `node:sqlite`).

### Inicialização Rápida

```bash
# 1. Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>
cd "Treinamento Mikrotik"

# 2. Inicie o servidor
npm start
```

O servidor iniciará automaticamente na porta `3000` (ou na porta definida pela variável de ambiente `PORT`):

```
=======================================================
  ACADEMIA TÉCNICA MIKROTIK ROUTEROS INICIADA COM SUCESSO
  Servidor ativo em: http://localhost:3000
  Ambiente Corporativo de Capacitação Técnica ISP
=======================================================
```

Acesse em seu navegador: **`http://localhost:3000`**

---

## 🔐 Acesso e Credenciais Padrão

A plataforma isola os dados de cada colaborador. Novos colaboradores podem criar suas contas na aba **Novo Aluno** na tela de login.

Para gestão inicial da plataforma:

| Perfil | Usuário | Senha Padrão | Função |
|---|---|---|---|
| **Gestor / Admin** | `gestor.roberto` | `admin123` | Gerenciar usuários, aprovar certificados, avaliar projetos finais e auditar logs |
| **Instrutor** | `instrutor.andre` | `mikrotik123` | Acompanhar desempenho técnico, corrigir projetos e editar conteúdos |
| **Aluno Modelo** | `tecnico.carlos` | `mikrotik123` | Conta de exemplo para demonstração de progresso |

> ⚠️ **Recomendação de Produção**: Após o primeiro acesso administrativo, altere a senha do gestor em **Perfil e Configurações** (`#profile`).

---

## 📂 Estrutura de Diretórios

```
Treinamento Mikrotik/
├── data/
│   └── mikrotik_academy.db       # Banco de dados SQLite persistente
├── public/
│   ├── css/
│   │   └── main.css              # Design corporativo dark mode e responsividade
│   ├── images/
│   │   └── mikrotik_rack_setup.jpg # Banner visual de infraestrutura ISP
│   ├── js/
│   │   ├── api.js                # Cliente de integração com todas as rotas REST
│   │   ├── app.js                # Shell da aplicação, busca global e estado
│   │   ├── icons.js              # Biblioteca de ícones SVG otimizados
│   │   ├── router.js             # Roteador client-side em hash routing
│   │   ├── components/           # Simulador CLI, WinBox e diagramas
│   │   └── views/                # Telas (dashboard, syllabus, labs, login, etc.)
│   └── index.html                # Entrypoint SPA
├── curriculumData.js             # Matriz curricular completa dos 15 módulos
├── database.js                   # Schema DDL, migrations e inicialização SQLite
├── materialsData.js              # 11 POPs ISP, tabela v6 vs v7 e portas de rede
├── server.js                     # Servidor HTTP com endpoints RESTful e autenticação
├── package.json                  # Manifesto do projeto Node.js
└── README.md                     # Documentação oficial
```

---

## 🛡️ Segurança e Auditoria

- Sessões isoladas com tokens criptográficos seguros.
- Senhas armazenadas com hash SHA-256 e salt corporativo.
- Controle de acesso estrito nos endpoints da API (`admin` e `instructor` validados no servidor).
- Trilha de auditoria completa registrada em tabela SQLite (`audit_logs`) para conformidade operacional.

---

## 📄 Licença

Projeto desenvolvido para capacitação técnica corporativa sob licença MIT.
