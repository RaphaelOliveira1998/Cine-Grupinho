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

## Setup

1. Instale dependências:

```bash
npm install
```

2. Crie `.env.local` com base em `.env.example`:

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

Se preferir, copie o conteúdo de `drizzle/0000_initial.sql` e execute no painel do Supabase.

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
```

## Observações

- O app usa Supabase Auth para sessão.
- As rotas privadas são protegidas por `middleware.ts`.
- Escritas usam Server Actions.
- Busca de filmes usa TMDb com `TMDB_API_KEY`.
- O banco precisa aceitar conexões via `DATABASE_URL` para o Drizzle.
