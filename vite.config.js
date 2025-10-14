import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
    server: {
        proxy: {
            '/api': {
                target: 'https://ya-praktikum.tech',
                changeOrigin: true,
                secure: true,
            },
        },
    },
});
