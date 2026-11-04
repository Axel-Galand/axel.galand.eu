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

| Commande                         | Rôle                                                   |
| -------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                       | Serveur de dev (schéma SQLite poussé automatiquement)  |
| `pnpm lint` / `pnpm typecheck`   | ESLint / TypeScript                                    |
| `pnpm test:int`                  | Vitest, sur une base `test.db` séparée                 |
| `pnpm test:e2e`                  | Playwright (lance `pnpm dev`)                          |
| `bash tests/smoke/standalone.sh` | Après `pnpm build` : serveur de prod sur une base vide |
| `pnpm seed`                      | Contenu fictif dans la base locale                     |
| `pnpm migrate:create <nom>`      | Nouvelle migration après un changement de schéma       |
| `pnpm generate:types`            | Régénère `src/payload-types.ts`                        |

## Site public

- FR à la racine, EN sous `/en`, avec des chemins traduits (`/projets` ↔ `/en/projects`) : la table
  est dans `src/i18n/pathnames.ts`, partagée par next-intl, le sitemap et l'admin.
- Un document n'existe en anglais que si son titre anglais est rempli : sinon 404 sous `/en`, et il
  n'apparaît ni dans les listes, ni dans le hreflang, ni dans le sitemap anglais. Pas de repli sur le
  français, sauf pour le texte alternatif et la légende des images (une image décrite en français
  vaut mieux qu'une image sans description).
- **Publier publie toutes les langues** : Payload met en ligne la dernière version de chaque langue,
  brouillon compris. Relire le FR et l'EN dans l'aperçu avant de publier.
- La langue du navigateur ne compte que sur `/` : un anglophone y est redirigé vers `/en`, les autres
  URL ne redirigent jamais.
- Les pages sont rendues à la première visite, puis servies depuis le cache. Toute modification de
  contenu dans Payload vide le cache de tout le site public (`src/plugins/revalidateSite.ts`).
- Aperçu des brouillons : le bouton « Aperçu » de l'admin ouvre `/next/preview`, qui vérifie la
  session Payload avant d'activer le mode brouillon. Les pages vérifient à nouveau la session avant
  de lire un brouillon.

## Branches

Git flow à deux branches longues :

- `develop` : branche de travail et branche par défaut. Les branches courtes partent d'ici
  (`feature/`, `bugfix/`, `chore/`) et y reviennent.
- `prod` : ce qui est en ligne. Protégée : on y arrive par une pull request depuis `develop` (ou une
  `hotfix/`), avec la CI verte. Chaque push sur `prod` déclenche le déploiement Coolify.

La CI tourne sur `develop`, `prod` et toutes les pull requests. Seul `prod` déploie.

## Production

- Image construite par le `Dockerfile` (sortie `standalone`, Node 26, utilisateur non root).
- Les migrations sont appliquées au démarrage (`prodMigrations`). Pensez à créer une migration à
  chaque changement de schéma.
- Volume persistant monté sur `/data` (`portfolio.db`, `media/`). Dans Coolify, ce doit être un
  _volume_ (pas un dossier de l'hôte), sinon il appartient à root et SQLite ne s'ouvre pas.
- Healthcheck : `GET /healthz`. Il échoue aussi si `SERVER_URL` manque ou n'est pas en https, pour
  que le déploiement échoue au lieu de la connexion à l'admin.
- `/admin` et `/api` sont derrière une basic auth Traefik en plus de l'auth Payload (sauf
  `/api/media/file`, public tant que les médias sont servis par Payload).
- Création du compte admin : les routes du premier compte renvoient 404 en production, sauf avec
  `ALLOW_FIRST_USER=true`. Le mettre le temps de créer le compte, puis le retirer.

### Variables d'environnement

Aucune variable n'a besoin d'être « disponible au build » dans Coolify : les pages ne sont pas
rendues au build, et les variables de build se retrouvent dans l'historique de l'image.

| Variable           | Exemple                   | Notes                                                                                                              |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `PAYLOAD_SECRET`   | 64 caractères hex         | Obligatoire, exécution seulement                                                                                   |
| `SERVER_URL`       | `https://axel.galand.eu`  | Lu à l'exécution (CSRF, CORS, URLs de l'admin), réduit à son origine                                               |
| `SITE_INDEXABLE`   | `false`                   | Tout sauf `true` garde le site en noindex. Changer la valeur demande un redéploiement, qui vide le cache des pages |
| `ALLOW_FIRST_USER` | _(absent)_                | `true` uniquement pendant la création du compte admin                                                              |
| `DATABASE_URL`     | `file:/data/portfolio.db` | Valeur par défaut de l'image                                                                                       |
| `MEDIA_DIR`        | `/data/media`             | Valeur par défaut de l'image                                                                                       |

Variables du dépôt GitHub pour le déploiement : `COOLIFY_URL` et `COOLIFY_APP_UUID` (variables),
`COOLIFY_DEPLOY_TOKEN` (secret, token Coolify limité à `deploy`).

## Licence

Code sous licence MIT. Le contenu du site (textes, photos) n'est pas couvert par cette licence.
