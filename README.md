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

## Development (Vite + TypeScript)

This project uses [Vite](https://vitejs.dev/) for fast development and [TypeScript](https://www.typescriptlang.org/) for type safety.

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
npm run dev
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

### `npm run dev`

Runs the app in the development mode using Vite.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will hot-reload when you make changes (typically in ~50ms).\
You'll see build errors and lint warnings in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run preview`

Preview the production build locally before deploying.

### `npm run test:e2e`

Runs end-to-end tests using Playwright.\
Requires Playwright browsers to be installed: `npx playwright install`

### `npm run lint`

Runs BiomeJS linter to check code quality.\
BiomeJS provides fast, modern linting and formatting.

### `npm run lint:fix`

Automatically fixes linting issues where possible.

### `npm run format`

Formats all source code using BiomeJS.\
Automatically run on commit via pre-commit hooks.

### `npm run format:check`

Checks if code is formatted correctly without making changes.\
Used in CI/CD pipeline to ensure code quality.

## UI Framework & Styling

OpenPortal uses a modern, component-based UI framework:

### Tailwind CSS v4.1

Utility-first CSS framework for rapid UI development:
- Design tokens mapped to OpenPortal branding
- Dark mode support configured
- Custom color palette for primary/secondary colors
- Responsive design utilities

### shadcn/ui

High-quality React components built on Radix UI:
- Accessibility-first (WCAG 2.1 Level AA)
- Customizable and composable
- TypeScript support out of the box

**Installing Components:**

```bash
# Install individual components as needed
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card

# Components are installed to src/components/ui/
```

**Note:** We install components incrementally as widgets are implemented. See `documentation/WIDGET-COMPONENT-MAPPING.md` for the installation plan.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for:
- Development environment setup
- Coding standards and best practices
- Testing requirements
- Pull request process

Also check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if you encounter any issues.

## Learn More

### OpenPortal Documentation
- [Architecture Guide](./documentation/architecture.md)
- [Widget Development](./documentation/WIDGET-ARCHITECTURE.md)
- [Component Mapping](./documentation/WIDGET-COMPONENT-MAPPING.md)
- [Complete Roadmap](./documentation/roadmap.md)

### Technology Stack
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React 19](https://react.dev/) - Modern React with latest features
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety and IDE support
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [BiomeJS](https://biomejs.dev/) - Fast linter and formatter

## License

MIT License - see LICENSE file for details.
