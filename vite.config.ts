import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/auth': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/api/email': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/api/qwen': {
          target: 'https://dashscope-intl.aliyuncs.com',
          changeOrigin: true,
          rewrite: () => '/compatible-mode/v1/chat/completions',
          headers: apiKey
            ? {
                Authorization: `Bearer ${apiKey}`,
              }
            : {},
        },
      },
    },
  }
})
