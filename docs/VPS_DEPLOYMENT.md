# VPS deployment

The production image runs Next.js in standalone mode as an unprivileged user and exposes the application only on VPS loopback port `3014` by default. Put the existing VPS reverse proxy in front of that port.

## Required server values

Create `/opt/stor24-crm/.env` on the VPS. Do not commit it.

```dotenv
APP_PORT=3014
APP_URL=https://your-approved-hostname.example
DATABASE_URL=postgresql://stor24:REPLACE@postgres:5432/stor24_crm
AUTH_SECRET=REPLACE_WITH_A_LONG_RANDOM_VALUE
POSTGRES_DB=stor24_crm
POSTGRES_USER=stor24
POSTGRES_PASSWORD=REPLACE_WITH_A_LONG_RANDOM_VALUE
```

## First deployment

```bash
sudo install -d -o "$USER" -g "$USER" /opt/stor24-crm
git clone https://github.com/blendproperty/stor24-CRM.git /opt/stor24-crm
cd /opt/stor24-crm
docker compose --env-file .env -f compose.prod.yml --profile database build
docker compose --env-file .env -f compose.prod.yml --profile database up -d
curl --fail http://127.0.0.1:3014/api/health
```

## Safe update

```bash
cd /opt/stor24-crm
git fetch origin main
git pull --ff-only origin main
IMAGE_TAG="$(git rev-parse --short HEAD)" docker compose --env-file .env -f compose.prod.yml build app
IMAGE_TAG="$(git rev-parse --short HEAD)" docker compose --env-file .env -f compose.prod.yml up -d app
curl --fail http://127.0.0.1:3014/api/health
```

Back up PostgreSQL before applying future database migrations. Do not publish port 5432. Add the approved DNS hostname and TLS route only after confirming the exact domain, reverse-proxy network and certificate setup.

## GitHub Actions deployment

The manual `Deploy to VPS` workflow requires these repository or production-environment secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_KNOWN_HOSTS`

The workflow is manual by design. It will not deploy on push and will fail closed if any required value is absent.
