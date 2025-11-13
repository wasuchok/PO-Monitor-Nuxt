# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## API Client

The project exposes a reusable Axios helper via `useApi()`, which returns `apiPublic` and `apiPrivate` clients that share the same base URL and error handling. Configure the base URL with `NUXT_PUBLIC_API_BASE` (defaults to `http://localhost:3000/api`).

```ts
const { apiPublic, apiPrivate } = useApi()

// Public call
const poList = await apiPublic.get('/purchase-orders')

// Private call (injects the `auth_token` cookie as Bearer automatically)
await apiPrivate.post('/purchase-orders', payload)
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
