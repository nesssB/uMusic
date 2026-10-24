import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

const coreAlias = { '@core': resolve('src/core') }

export default defineConfig({
  main: {
    resolve: {
      alias: coreAlias
    }
  },
  preload: {
    resolve: {
      alias: coreAlias
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        ...coreAlias
      }
    },
    plugins: [react()]
  }
})
