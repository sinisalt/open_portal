# Styles Directory

This directory contains **global styles and CSS modules** for the application.

## Purpose

The styles directory provides:

- **Global Styles**: Base styles, resets, and global CSS
- **Theme Definitions**: CSS variables and theme tokens
- **Utility Classes**: Reusable CSS utility classes
- **Mixins**: SCSS/CSS mixins for common patterns
- **Responsive Breakpoints**: Media query definitions

## Style Files

### `global.css`

Global base styles and CSS resets:

```css
/* global.css */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body,
#root {
  height: 100%;
}
```

### `variables.css`

CSS custom properties (variables):

```css
/* variables.css */
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-toast: 1100;
  --z-tooltip: 1200;
}

/* Dark mode */
[data-theme='dark'] {
  --color-background: #1a1a1a;
  --color-text: #f0f0f0;
  /* ... other dark mode variables */
}
```

### `utilities.css`

Utility classes for common styles:

```css
/* utilities.css */

/* Spacing utilities */
.m-0 {
  margin: 0;
}
.m-1 {
  margin: var(--spacing-xs);
}
.m-2 {
  margin: var(--spacing-sm);
}
.m-3 {
  margin: var(--spacing-md);
}
.m-4 {
  margin: var(--spacing-lg);
}
.m-5 {
  margin: var(--spacing-xl);
}

.mt-0 {
  margin-top: 0;
}
.mt-1 {
  margin-top: var(--spacing-xs);
}
/* ... other spacing utilities */

.p-0 {
  padding: 0;
}
.p-1 {
  padding: var(--spacing-xs);
}
/* ... other padding utilities */

/* Display utilities */
.d-none {
  display: none;
}
.d-block {
  display: block;
}
.d-flex {
  display: flex;
}
.d-grid {
  display: grid;
}

/* Flexbox utilities */
.flex-row {
  flex-direction: row;
}
.flex-column {
  flex-direction: column;
}
.justify-start {
  justify-content: flex-start;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.align-start {
  align-items: flex-start;
}
.align-center {
  align-items: center;
}

/* Text utilities */
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.text-primary {
  color: var(--color-primary);
}
.text-danger {
  color: var(--color-danger);
}

/* Responsive utilities */
@media (max-width: 768px) {
  .d-mobile-none {
    display: none;
  }
  .d-mobile-block {
    display: block;
  }
}
```

### `breakpoints.css`

Responsive breakpoint definitions:

```css
/* breakpoints.css */

/* Mobile first approach */
:root {
  --breakpoint-mobile: 576px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 992px;
  --breakpoint-wide: 1200px;
}

/* Media query mixins (for SCSS) */
/*
@mixin mobile {
  @media (max-width: 576px) { @content; }
}

@mixin tablet {
  @media (min-width: 577px) and (max-width: 768px) { @content; }
}

@mixin desktop {
  @media (min-width: 769px) { @content; }
}
*/
```

## Style Guidelines

1. **CSS Modules**: Use CSS modules for component-specific styles
2. **Global Styles**: Use global styles sparingly, only for base styles
3. **CSS Variables**: Leverage CSS custom properties for theming
4. **Naming Convention**: Use BEM or consistent naming convention
5. **Responsive Design**: Mobile-first approach with media queries
6. **Utility Classes**: Use utility classes for common patterns

## CSS Modules

Component-specific styles should use CSS modules:

```css
/* Button.module.css */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.button--primary {
  background-color: var(--color-primary);
  color: white;
}

.button--secondary {
  background-color: var(--color-secondary);
  color: white;
}

.button:hover {
  opacity: 0.9;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Usage in component:

```javascript
import styles from './Button.module.css';

function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={`${styles.button} ${styles[`button--${variant}`]}`} {...props}>
      {children}
    </button>
  );
}
```

## File Structure

```
styles/
├── global.css            # Global base styles
├── variables.css         # CSS custom properties
├── utilities.css         # Utility classes
├── breakpoints.css       # Responsive breakpoints
├── animations.css        # Animation definitions
├── typography.css        # Typography styles
├── layout.css           # Layout helpers
├── themes/              # Theme variations
│   ├── light.css
│   └── dark.css
└── README.md
```

## Import Order

Import styles in this order in `src/index.js`:

```javascript
// Global styles
import './styles/variables.css';
import './styles/global.css';
import './styles/utilities.css';
import './styles/breakpoints.css';
import './styles/animations.css';
```

## Dark Mode Support

Implement dark mode using CSS custom properties:

```css
/* Theme switching */
[data-theme='light'] {
  --bg-color: #ffffff;
  --text-color: #333333;
}

[data-theme='dark'] {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

Toggle theme in JavaScript:

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

## Best Practices

1. **Use CSS Variables**: For theming and consistency
2. **Mobile First**: Start with mobile styles, add desktop overrides
3. **Minimize Global Styles**: Use CSS modules for components
4. **Semantic Naming**: Use descriptive class names
5. **Avoid !important**: Structure CSS to avoid specificity wars
6. **Accessibility**: Ensure sufficient color contrast, focus states
7. **Performance**: Minimize CSS size, use efficient selectors

## Accessibility

Ensure accessible styles:

```css
/* Focus states */
*:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
}

.skip-to-content:focus {
  top: 0;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Dependencies

- No external dependencies required
- Can use SCSS/SASS for advanced features (optional)
- PostCSS for CSS processing (included with CRA)
