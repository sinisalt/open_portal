# Components Directory

This directory contains reusable React components that are **not** widgets. These are generic UI building blocks used throughout the application.

## Purpose

Components here are:

- **Generic**: Not configuration-driven, not part of the widget catalog
- **Reusable**: Used across multiple pages or features
- **Composable**: Can be combined to build more complex UIs
- **Stateless or lightly stateful**: Focus on presentation

## Examples

- **Button**: Generic button component with different variants
- **Input**: Form input wrapper with validation display
- **Layout**: Layout containers and wrappers
- **Navigation**: Navigation bars, breadcrumbs, menus
- **Loading**: Loading spinners, skeletons

## Component Guidelines

1. **Props Interface**: Define clear TypeScript interfaces for all props
2. **Accessibility**: Support WCAG 2.1 Level AA standards
3. **Styling**: Use CSS modules or styled components
4. **Documentation**: Include JSDoc comments for props and usage
5. **Testing**: Include unit tests for all components

## Component vs Widget

**Components** are generic UI elements used internally by the app (navigation, layouts, etc.)

**Widgets** (in `src/widgets/`) are configuration-driven, part of the catalog, and rendered dynamically based on backend configurations.

## Naming Conventions

- PascalCase for component names: `Button`, `TextInput`, `Card`
- One component per file
- Co-locate tests: `Button.js` and `Button.test.js`
- CSS modules: `Button.module.css`

## File Structure

```
components/
├── Button/
│   ├── Button.js
│   ├── Button.test.js
│   ├── Button.module.css
│   └── index.js
└── README.md
```
