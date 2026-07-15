# TopClip Impresso

Sistema de **Levantamento Diário de Páginas** de revistas e jornais para a TopClip.
Automatiza a coleta, processamento via OCR, armazenamento e visualização de clippings impressos.

---

## Visão Geral

O **TopClip Impresso** é uma aplicação full-stack composta por:

| Camada                    | Tecnologia                         | Descrição                                       |
| ------------------------- | ---------------------------------- | ------------------------------------------------- |
| **Frontend**        | React + TypeScript + Vite          | Interface de gestão de clippings e levantamentos |
| **Backend**         | FastAPI + Python                   | API REST, workers Celery, scrapers e OCR          |
| **Banco de Dados**  | SQL Server (via pyodbc/SQLAlchemy) | Clusters de produção e leitura                  |
| **Fila de Tarefas** | Celery + Redis                     | Processamento assíncrono de páginas             |
| **OCR**             | Tesseract + PyMuPDF                | Extração de texto de PDFs e imagens             |

---

## Funcionalidades

- 📰 **Levantamento diário** — Painel centralizado para controle de edições por veículo
- ✂️ **Clippings** — Registro e busca de clips por cliente, veículo e data
- 🔍 **Varredura por palavra-chave** — Busca OCR em PDFs de revistas e jornais
- 🖼️ **Editor de imagem** — Recorte e ajuste de clippings diretamente no browser
- 📊 **Relatórios** — Dashboard com métricas de produção e cobertura
- 🗄️ **Arquivo** — Histórico de edições processadas
- ⚙️ **Configurações** — Cadastro de fontes, clientes e parâmetros do sistema
- 🤖 **Workers** — Scrapers automáticos para portais (GoRead, GloboMais, FTP)

---

## Estrutura do Projeto

```
topclip-impresso/
├── backend/                  # API FastAPI + workers
│   ├── app/
│   │   ├── api/endpoints/    # Rotas REST
│   │   ├── core/             # Configurações e settings
│   │   ├── db/               # Sessão e conexões SQL Server
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── repositories/     # Acesso a dados
│   │   ├── services/         # Lógica de negócio (OCR, scrapers, PDF)
│   │   └── workers/          # Tasks Celery
│   ├── alembic/              # Migrações de banco
│   ├── tests/                # Testes automatizados
│   ├── requirements.txt
│   ├── .env.example          # Template de variáveis de ambiente
│   └── worker.py             # Entrypoint do worker Celery
│
├── src/                      # Frontend React
│   ├── components/           # Componentes reutilizáveis (UI + features)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilitários e cliente API
│   └── pages/                # Páginas da aplicação
│
├── public/                   # Assets estáticos
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Pré-requisitos

### Frontend

- [Node.js](https://nodejs.org/) 18+
- npm 9+

### Backend

- Python 3.11+
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) instalado e no PATH
- Redis (para Celery)
- Driver ODBC para SQL Server (`ODBC Driver 17 for SQL Server`)

---

## Instalação e Execução

### 1. Frontend

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
# → Acesse em http://localhost:5173
```

### 2. Backend

```bash
cd backend

# Crie e ative o ambiente virtual
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/macOS

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
copy .env.example .env
# Edite o .env com suas credenciais

# Execute a API
python -m app.main
# → API disponível em http://localhost:8000
# → Documentação em http://localhost:8000/docs
```

### 3. Worker Celery (processamento assíncrono)

```bash
cd backend
celery -A worker.celery_app worker --loglevel=info
```

---

## Variáveis de Ambiente

Copie `backend/.env.example` para `backend/.env` e preencha:

| Variável                     | Descrição                                    |
| ----------------------------- | ---------------------------------------------- |
| `DB_LEITOR_HOST`            | Host do cluster SQL Server de leitura          |
| `DB_PRODUCAO_HOST`          | Host do cluster SQL Server de produção       |
| `DB_USER` / `DB_PASSWORD` | Credenciais do banco                           |
| `REDIS_URL`                 | URL do Redis (ex:`redis://localhost:6379/0`) |
| `TESSERACT_PATH`            | Caminho do executável do Tesseract            |
| `DOWNLOAD_PATH`             | Diretório para PDFs baixados                  |
| `API_PORT`                  | Porta da API (padrão:`8000`)                |

---

## Scripts Disponíveis

### Frontend

| Comando           | Descrição                 |
| ----------------- | --------------------------- |
| `npm run dev`   | Servidor de desenvolvimento |
| `npm run build` | Build de produção         |
| `npm run lint`  | Verificação de lint       |
| `npm test`      | Executa testes unitários   |

---

## Stack Tecnológica

**Frontend**

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query) — gerenciamento de estado assíncrono
- [React Router](https://reactrouter.com/) — roteamento
- [Framer Motion](https://www.framer.com/motion/) — animações
- [Recharts](https://recharts.org/) — gráficos

**Backend**

- [FastAPI](https://fastapi.tiangolo.com/) — framework REST
- [SQLAlchemy 2](https://www.sqlalchemy.org/) — ORM
- [Alembic](https://alembic.sqlalchemy.org/) — migrações
- [Celery](https://docs.celeryq.dev/) — fila de tarefas
- [Playwright](https://playwright.dev/python/) — automação de browser
- [PyMuPDF](https://pymupdf.readthedocs.io/) + [pytesseract](https://github.com/madmaze/pytesseract) — OCR

---

## Contribuindo

1. Crie uma branch a partir de `main`: `git checkout -b feat/minha-feature`
2. Faça suas alterações e adicione testes quando aplicável
3. Abra um Pull Request com uma descrição clara da mudança

---

*TopClip Impresso — Desenvolvido internamente para operações da TopClip.*
