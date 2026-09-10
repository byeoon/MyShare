import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            include: ['src/**/*.{test,spec}.{js,ts}'],
            clearMocks: true,
            restoreMocks: true,
        },
    }),
);
