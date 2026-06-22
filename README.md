# Cine Grupinho

App privado para grupos de amigos recomendarem, avaliarem e comentarem filmes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Drizzle ORM
- TMDb API

## Funcionalidades

- Login e cadastro com Supabase Auth
- Perfil com nome, username, foto e top 5 filmes favoritos
- Perfis públicos acessíveis por membros do app
- Criação e listagem de grupos
- Grupos públicos ou privados com PIN de acesso
- Edição de nome, descrição, visibilidade, PIN e código de convite
- Entrada em grupos por código e PIN quando necessário
- Busca TMDb com expansão de franquias e sequências
- Recomendação de filmes por grupo
- Avaliações, comentários, média e ranking

## Setup

1. Instale dependências:

```bash
npm install
```

2. Crie `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
TMDB_API_KEY=
```

3. Rode o SQL inicial no Supabase SQL Editor:

```bash
psql "$DATABASE_URL" -f drizzle/0000_initial.sql
```

Se o banco já estava usando a versão anterior, rode também:

```bash
psql "$DATABASE_URL" -f drizzle/0001_profiles_and_group_settings.sql
```

Também é possível copiar o conteúdo dos arquivos SQL e executar direto no painel do Supabase.

4. Inicie o app:

```bash
npm run dev
```

5. Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm test
npm run lint
```

## Observações

- O app usa Supabase Auth para sessão.
- As rotas privadas são protegidas por `proxy.ts`.
- Escritas usam Server Actions.
- Busca de filmes usa TMDb com `TMDB_API_KEY` e fallback local para desenvolvimento.
- O banco precisa aceitar conexões via `DATABASE_URL` para aplicar SQL via terminal.
