import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const patchedAnchorNavigationProvider = path.resolve(
  __dirname,
  'src/patches/AnchorNavigationProvider.js',
)

/**
 * core-react AnchorNavigationProvider only listened to window scroll; SettingsPage
 * scrolls inside a nested overflow column. Redirect to our patched module.
 */
function procoreAnchorNavigationPatch(): Plugin {
  return {
    name: 'procore-anchor-navigation-patch',
    enforce: 'pre',
    resolveId(id) {
      const normalized = id.replace(/\\/g, '/')
      if (normalized.endsWith('.d.ts') || normalized.endsWith('.map')) {
        return null
      }
      if (
        normalized.includes(
          '@procore/core-react/dist/AnchorNavigation/AnchorNavigationProvider',
        )
      ) {
        return patchedAnchorNavigationProvider
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [procoreAnchorNavigationPatch(), react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      mode === 'production' ? 'production' : 'development',
    ),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
}))
