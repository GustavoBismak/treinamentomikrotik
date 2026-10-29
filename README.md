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

## 🚀 Opções de Publicação e Produção

A plataforma possui **arquitetura híbrida**, suportando tanto hospedagem direta na web para os alunos quanto servidores corporativos centralizados:

### Opção 1: GitHub Pages (Modo Web Autônomo — Imediato para Alunos)
O repositório já está 100% pronto para o GitHub Pages:
1. No seu repositório no GitHub, acesse **Settings -> Pages**.
2. Em **Branch**, selecione `main` e a pasta `/ (root)`.
3. Clique em **Save**.
4. Em instantes, o link público estará ativo (ex: `https://gustavobismak.github.io/treinamentomikrotik/`).
5. Seus alunos podem acessar diretamente pelo computador ou celular, cadastrar suas contas com e-mail/senha, estudar as aulas dos 15 módulos, realizar os simuladores de terminal e WinBox, responder avaliações e emitir certificados. O progresso individual fica salvo com segurança no navegador do aluno.

---

### Opção 2: Nuvem Gratuita 24/7 (Render.com / Railway — Banco Centralizado)
Se desejar que o Gestor e o Instrutor acompanhem os relatórios de todos os alunos em tempo real num banco central:
1. Crie uma conta gratuita em [render.com](https://render.com).
2. Clique em **New + -> Web Service** e conecte seu repositório `treinamentomikrotik`.
3. O Render detectará automaticamente o arquivo `render.yaml` e executará `npm start` com Node 22.
4. Seu painel corporativo estará no ar com URL pública HTTPS permanente!

---

### Opção 3: Servidor Local ou VPS do Provedor (Linux / Windows)

```bash
# 1. Clone o repositório
git clone https://github.com/GustavoBismak/treinamentomikrotik.git
cd treinamentomikrotik

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
