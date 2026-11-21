// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The dev toolbar adds its own Tab stops ahead of the page, which gets in the way of testing keyboard navigation.
  devToolbar: { enabled: false },
});
