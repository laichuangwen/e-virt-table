import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    root: resolve(__dirname, 'src/v2'),
    server: {
        port: 8889,
        open: '/index.html',
    },
})
