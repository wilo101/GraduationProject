import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/GraduationProject/', // Explicit base path for GitHub Pages
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    motion: ['framer-motion'],
                    i18n: ['i18next', 'react-i18next'],
                    icons: ['lucide-react'],
                },
            },
        },
    },
})
