import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../', '');
    
    return {
        plugins: [react()],
        envDir: '../',
        define: {
            __APP_VERSION__: JSON.stringify(pkg.version || 'unknown')
        },
        server: {
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:3001',
                    changeOrigin: true,
                    secure: false,
                }
            }
        }
    };
})
