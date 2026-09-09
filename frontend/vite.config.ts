import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        watch: {
            usePolling: true,
            ignored: ['**/.svelte-kit/**', '**/.pnpm-store/**'],
        },
        proxy: {
            '/api': {
                target: 'http://backend:8000',
                changeOrigin: true,
            },
        },
    },
});
