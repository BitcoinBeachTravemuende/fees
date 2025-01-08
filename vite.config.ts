/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fees/',
  plugins: [svelte()],
  test: {
    // https://vitest.dev/config/#environment
    environment: 'jsdom',
    // https://vitest.dev/config/#include
    include: ['src/**/*.{test,spec}.ts'],
  },
})
