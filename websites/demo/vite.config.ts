import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        reactRefresh(),
    ],
    resolve: {
        alias: [
            {find: 'src', replacement: path.resolve(__dirname, './src')},
            {find: '@pages', replacement: path.resolve(__dirname, './src/pages')},
            {find: '@components', replacement: path.resolve(__dirname, './src/components')},
            {find: '@utils', replacement: path.resolve(__dirname, './src/utils')},
            {find: '@services', replacement: path.resolve(__dirname, './src/services')},
        ]
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    },
    server: {
        port: 3001
    }
})