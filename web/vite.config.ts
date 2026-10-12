import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // base relativa: funciona no GitHub Pages (/<repo>/) sem precisar saber o nome do repo
  base: './',
  plugins: [react()],
})
