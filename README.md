# WordCloud Frontend

React web application for uploading text files and visualizing word frequency as interactive word clouds.

Built with React 19, TypeScript, Vite 8, and Tailwind CSS.

## Prerequisites

- [Node.js 22](https://nodejs.org/)
- Running Core API backend (see below)

## Local Development

### 1. Start the backend

Either start the full stack via Docker:

```bash
cd ../deployment-config
docker compose up --build
```

Or start just the infrastructure and core-api individually:

```bash
cd ../deployment-config
docker compose -f docker-compose.infra.yml up

# In another terminal:
cd ../core-api
./gradlew bootRun
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if your API runs on a different URL
```

### 3. Install dependencies and start

```bash
npm install
npm run dev
```

Opens on http://localhost:5173.

## Environment Variables

| Variable            | Default                                       | Description      |
|---------------------|-----------------------------------------------|------------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/documents`         | Backend API URL  |

## Docker (Production Build)

The Dockerfile creates a production build served by nginx:

```bash
docker build -t wordcloud-frontend .
docker run -p 3000:80 wordcloud-frontend
```

To use a different API URL at build time:

```bash
docker build --build-arg VITE_API_BASE_URL=http://my-api:8080/api/documents -t wordcloud-frontend .
```

## Full Stack

To run the entire application with one command, see the [deployment-config README](../deployment-config/README.md or https://github.com/Raimpz/wordcloud-deployment-config/blob/main/README.md).
