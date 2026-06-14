# Environment Variables

When running this project locally, you will need certain environment variables. We have provided a template in `.env.example`.

Copy `.env.example` to `.env.local` and fill in the appropriate values:

```bash
cp .env.example .env.local
```

### Variables

- `VITE_PUTER_WORKER_URL`: The URL for the Puter worker. Set this to your non-sensitive placeholder or real worker URL during development.
