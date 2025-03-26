import { fileURLToPath } from 'node:url'
import request from '@gopowerteam/request-generate/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    request({
      alias: '@',
      dir: 'src/http',
      dts: 'src/types/generated/request.d.ts',
    }) as any,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
})
