/**
 * Environment configuration helper
 * Abstracts import.meta.env for easier testing
 */

const getEnv = () => {
  // In tests, use process.env or globals
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3001/v1',
      MODE: 'test',
    };
  }

  // In Vite/browser, use import.meta.env when available
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env;
  }

  // Fallback for any other context
  return {
    VITE_API_URL: 'http://localhost:3001/v1',
    MODE: 'development',
  };
};

export const env = getEnv();
