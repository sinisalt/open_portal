# OpenPortal - API-Driven Business UI Platform

OpenPortal is an **API-configured Business UI Platform** where the frontend is a generic rendering engine and all UI structure, logic, and workflows come from backend APIs.

## 🎯 What Makes This Different

- **Zero frontend changes** for new features - everything is configured via API
- **Configuration-driven** - Pages defined as JSON consumed by React renderer
- **Enterprise UI** - Built on Ant Design (MIT License) with 30+ professional widgets
- **Smart caching** - Multi-layer caching (Redis + Browser) for optimal performance
- **Real-time ready** - Built-in WebSocket support for live updates
- **AI-first development** - Designed for rapid development with AI coding agents

## 📚 Documentation

Complete project documentation is available in the [`/documentation`](./documentation) folder:

### Getting Started
- **[Getting Started](./documentation/getting-started.md)** - Introduction and orientation
- **[Project Overview](./documentation/project-overview.md)** - Vision, goals, and status

### Detailed Scenarios
- **[Authentication Scenarios](./documentation/authentication-scenarios.md)** - Complete auth flows with API examples
  - Username/password login
  - OAuth/SSO integration
  - Token refresh and management
- **[User Profile Scenarios](./documentation/user-profile-scenarios.md)** - Profile workflows and navigation
  - Profile viewing and editing
  - Sub-section navigation (API Keys, Audit History, etc.)
  - Browser history integration
  - Caching strategies

### Technical Documentation
- **[Architecture](./documentation/architecture.md)** - Technical architecture with Redis caching
- **[API Specification](./documentation/api-specification.md)** - Complete API docs
- **[Widget Catalog](./documentation/widget-catalog.md)** - All available widgets
- **[JSON Schemas](./documentation/json-schemas.md)** - Configuration schemas

### Implementation
- **[AI-First Implementation Plan](./documentation/ai-first-implementation-plan.md)** - Task-based development plan
  - Atomic task decomposition for AI agents
  - TDD with mock APIs
  - 125 specific tasks across 6 phases
  - 3-4x faster than traditional development
- **[TDD & Mock API Guide](./documentation/tdd-mock-api-guide.md)** - Test-Driven Development guide
  - TDD principles (Red-Green-Refactor)
  - Mock API setup (JSON Server and MSW)
  - Complete testing examples
  - Integration testing strategies
- **[Roadmap](./documentation/roadmap.md)** - Traditional phased implementation plan

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

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

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
