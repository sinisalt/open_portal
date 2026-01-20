# OpenPortal - API-Driven Business UI Platform

OpenPortal is an **API-configured Business UI Platform** where the frontend is a generic rendering engine and all UI structure, logic, and workflows come from backend APIs.

## 🎯 What Makes This Different

- **Zero frontend changes** for new features - everything is configured via API
- **Configuration-driven** - Pages defined as JSON consumed by React renderer
- **Reusable widget library** - 30+ widgets with stable contracts
- **Smart caching** - Static configs cached, dynamic data fetched on demand
- **Real-time ready** - Built-in WebSocket support for live updates

## 📚 Documentation

Complete project documentation is available in the [`/documentation`](./documentation) folder:

- **[Getting Started](./documentation/getting-started.md)** - Introduction and orientation
- **[Project Overview](./documentation/project-overview.md)** - Vision, goals, and status
- **[Architecture](./documentation/architecture.md)** - Technical architecture
- **[API Specification](./documentation/api-specification.md)** - Complete API docs
- **[Widget Taxonomy](./documentation/widget-taxonomy.md)** - Core widget taxonomy (MVP)
- **[Widget Catalog](./documentation/widget-catalog.md)** - All available widgets
- **[JSON Schemas](./documentation/json-schemas.md)** - Configuration schemas
- **[Roadmap](./documentation/roadmap.md)** - Implementation plan

**Start here:** [documentation/getting-started.md](./documentation/getting-started.md)

## 🚀 Current Status

**Phase:** Planning & Specification ✅

All foundational documentation completed. Ready to begin Phase 0 (Discovery & Foundation).

## 💡 Quick Example

A complete dashboard page defined in JSON:

```json
{
  "pageId": "dashboard",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "revenue-kpi",
      "type": "KPI",
      "datasourceId": "revenue",
      "props": { "label": "Revenue", "format": "currency" }
    }
  ],
  "datasources": [
    {
      "id": "revenue",
      "kind": "http",
      "http": { "method": "GET", "url": "/api/kpi/revenue" }
    }
  ]
}
```

The React frontend renders this config without any hardcoded UI logic!

---

## Development (Create React App)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- **Node.js**: Version 18.20.0 or higher (specified in `.nvmrc`)
- **npm**: Version 9.x or higher
- **Docker** (optional): For containerized development

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/sinisalt/open_portal.git
cd open_portal

# Install Node.js version (using nvm)
nvm install
nvm use

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Docker Setup (Alternative)

For full-stack development with PostgreSQL and Redis:

```bash
# Start all services
docker-compose up

# Access:
# - Frontend: http://localhost:3000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379

# Stop services
docker-compose down
```

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md) and [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run test:e2e`

Runs end-to-end tests using Playwright.\
Requires Playwright browsers to be installed: `npx playwright install`

### `npm run format`

Formats all source code using Prettier.\
Automatically run on commit via pre-commit hooks.

### `npm run format:check`

Checks if code is formatted correctly without making changes.\
Used in CI/CD pipeline to ensure code quality.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for:
- Development environment setup
- Coding standards and best practices
- Testing requirements
- Pull request process

Also check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if you encounter any issues.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
