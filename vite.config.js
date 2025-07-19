import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'img/logos/log.png', 'img/logos/log.png'],
      manifest: {
        name: 'Limcard',
        short_name: 'Limcard',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e90ff',
        icons: [
          {
            src: 'img/logos/log.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/logos/log.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
    ,
   resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    server: {
    historyApiFallback: true
  }
  },
})
