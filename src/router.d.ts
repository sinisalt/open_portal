import '@tanstack/react-router';
import { router } from './index';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
