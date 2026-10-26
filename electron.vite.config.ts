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
    },
    build: {
      rolldownOptions: {
        input: {
          index: resolve('src/preload/index.ts'),
          ytmusic: resolve('src/preload/ytmusic.ts')
        }
      }
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
