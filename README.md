<div align="center">
  <h1>⚔️ GamingHub</h1>
  <p>Plataforma gaming completa com perfis, clans, torneios, streams ao vivo e loja</p>

  ![React](https://img.shields.io/badge/React-18-blue?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
  ![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
  ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-cyan?logo=tailwindcss)
  ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
</div>

---

## 📋 Funcionalidades

- 🎮 **Perfis** — Avatar, banner, background, bio, tags animadas com partículas
- 🏆 **Ranking** — Sistema de ranks por XP (Bronze → Grão-Mestre)
- 🏷️ **Tags** — Tags admin com efeitos RGB, neon e partículas flutuantes
- ⚔️ **Torneios** — Criação, inscrição e gestão de torneios
- 🛡️ **Clans** — Criação, gestão e entrada em clans
- 📡 **Streams** — Streams ao vivo com chat em tempo real
- 🛒 **Loja** — Itens com sistema de moedas, inventário e transações
- 🔐 **Admin** — Painel completo de gestão de tudo

---

## 🚀 Setup Local

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU_USER/gaminghub.git
cd gaminghub
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Arrancar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Configurar a Base de Dados (Supabase)

### Opção A — Schema completo (recomendado para nova instância)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá a **SQL Editor**
3. Cole o conteúdo de `supabase/schema.sql`
4. Clique em **Run**

✅ Todas as tabelas, políticas RLS, triggers e seed data serão criados automaticamente.

### Opção B — Ligar ao projeto Supabase existente

Se já tem o projeto Supabase configurado (ex: migrado do medo.dev), basta apontar as env vars para esse projeto. A base de dados já está na cloud e não precisa de ser recriada.

---

## 📦 Deploy no Vercel (recomendado)

### Deploy manual

1. Faça push do código para o GitHub
2. Aceda a [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório GitHub
4. Adicione as **Environment Variables**:

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon pública |

5. Clique **Deploy** ✅

### Deploy automático via GitHub Actions

O ficheiro `.github/workflows/deploy.yml` faz deploy automático em cada push para `main`.

Configure estes **Secrets** no repositório GitHub (`Settings → Secrets → Actions`):

| Secret | Onde obter |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `vercel env pull` ou dashboard Vercel |
| `VERCEL_PROJECT_ID` | `vercel env pull` ou dashboard Vercel |

---

## 🌐 Deploy no Netlify (alternativa)

1. Faça push para GitHub
2. Aceda a [app.netlify.com](https://app.netlify.com) → **New site from Git**
3. Selecione o repositório
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Adicione as env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
7. Deploy ✅

> O ficheiro `public/_redirects` já está configurado para React Router SPA.

---

## 🔑 Criar primeiro utilizador Admin

Após o deploy:

1. Registe-se normalmente no site
2. Aceda ao **Supabase Dashboard → Table Editor → profiles**
3. Encontre o seu utilizador e altere `role` de `user` para `admin`
4. Refresque a página — terá acesso ao painel Admin

---

## 📁 Estrutura do Projeto

```
gaminghub/
├── .github/workflows/     # CI/CD GitHub Actions
├── public/                # Assets estáticos + _redirects Netlify
├── src/
│   ├── components/
│   │   ├── layouts/       # AppLayout, AdminLayout, Navbar
│   │   └── ui/            # shadcn/ui + MemberTag, etc.
│   ├── contexts/          # AuthContext
│   ├── db/                # Cliente Supabase
│   ├── hooks/             # useImageUpload, etc.
│   ├── pages/
│   │   ├── admin/         # Painel de administração
│   │   └── ...            # Páginas públicas
│   ├── services/          # api.ts — todas as chamadas Supabase
│   ├── types/             # TypeScript interfaces
│   └── routes.tsx         # Definição de rotas
├── supabase/
│   └── schema.sql         # Schema completo da BD
├── .env.example           # Template de variáveis de ambiente
├── vercel.json            # Configuração Vercel SPA routing
└── vite.config.ts
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Deploy | Vercel / Netlify |
| CI/CD | GitHub Actions |

---

## ❓ Perguntas Frequentes

**Posso usar a base de dados do medo.dev no GitHub?**
A base de dados fica sempre no Supabase cloud. O que vai para o GitHub é apenas o código e o `schema.sql` para recriar a estrutura. Os dados dos utilizadores ficam protegidos no Supabase.

**Como exportar os dados reais?**
No Supabase Dashboard → **Database → Backups** pode fazer download de um backup completo com todos os dados.

**Posso ter o site e a BD de graça?**
Sim! Supabase free tier + Vercel free tier cobrem projetos pequenos/médios sem custo.
