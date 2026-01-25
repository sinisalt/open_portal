/**
 * Environment configuration helper
 * Abstracts import.meta.env for easier testing
 */

const getEnv = () => {
  // In tests, use process.env or globals
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:4000',
      MODE: 'test',
    };
  }

  // In Vite/browser, use import.meta.env (wrapped in try-catch for Jest compatibility)
  try {
    // This will work in Vite but not in Jest
    // biome-ignore lint/security/noGlobalEval: Required for Jest compatibility with import.meta.env
    return eval('import.meta.env');
  } catch (_e) {
    // Fallback for any other context
    return {
      VITE_API_URL: 'http://localhost:4000',
      MODE: 'development',
    };
  }
};

export const env = getEnv();
