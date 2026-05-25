import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// You will also have your framework plugin here:
import react from '@vitejs/plugin-react' // OR import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(), // OR vue()
  ],
})