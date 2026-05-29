import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    watch: {
      ignored: ['**/inspiracoes/**', '**/*.mp4'] // Evita monitorar vídeos MP4 pesados no Windows (resolve erro EBUSY)
    }
  }
})
