const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.js'],
        clearMocks: true,
        restoreMocks: true,
    },
});
