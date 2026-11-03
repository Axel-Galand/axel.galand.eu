# axel.galand.eu

Portfolio d'Axel Galand : Next.js 16 avec Payload 3 dans la même app, SQLite, hébergé sur un VPS
avec Coolify.

## Démarrer en local

Prérequis : Node 26 (`nvm use`), pnpm 12, et `gitleaks` + `lefthook` installés (Homebrew).

```bash
cp .env.example .env   # puis remplir PAYLOAD_SECRET (openssl rand -hex 32)
pnpm install
lefthook install
pnpm dev
```

Le site est sur http://localhost:3000, l'admin sur http://localhost:3000/admin.

## Commandes

| Commande                       | Rôle                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `pnpm dev`                     | Serveur de dev (schéma SQLite poussé automatiquement) |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript                                   |
| `pnpm test:int`                | Vitest, sur une base `test.db` séparée                |
| `pnpm test:e2e`                | Playwright (lance `pnpm dev`)                         |
| `pnpm migrate:create <nom>`    | Nouvelle migration après un changement de schéma      |
| `pnpm generate:types`          | Régénère `src/payload-types.ts`                       |

## Production

- Image construite par le `Dockerfile` (sortie `standalone`, Node 26, utilisateur non root).
- Les migrations sont appliquées au démarrage (`prodMigrations`). Pensez à créer une migration à
  chaque changement de schéma.
- Volume persistant monté sur `/data` (`portfolio.db`, `media/`).
- Healthcheck : `GET /healthz`.
- `/admin` et `/api` sont derrière une basic auth Traefik en plus de l'auth Payload.

### Variables d'environnement

| Variable         | Exemple                   | Notes                                                                                                                |
| ---------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `PAYLOAD_SECRET` | 64 caractères hex         | Obligatoire                                                                                                          |
| `SERVER_URL`     | `https://axel.galand.eu`  | Lu à l'exécution (CSRF, CORS, URLs de l'admin)                                                                       |
| `SITE_INDEXABLE` | `false`                   | Tout sauf `true` garde le site en noindex. À déclarer aussi en variable de build : la balise meta est figée au build |
| `DATABASE_URL`   | `file:/data/portfolio.db` | Valeur par défaut de l'image                                                                                         |
| `MEDIA_DIR`      | `/data/media`             | Valeur par défaut de l'image                                                                                         |

## Licence

Code sous licence MIT. Le contenu du site (textes, photos) n'est pas couvert par cette licence.
