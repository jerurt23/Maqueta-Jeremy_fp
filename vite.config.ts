import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Vite blocks unknown Host headers (DNS-rebinding protection). Live tunnels like
      // `cloudflared tunnel --url` use ephemeral *.trycloudflare.com hostnames, so allow
      // them by default. Set ALLOWED_HOSTS=host1,host2 to re-lock it down to a fixed list.
      allowedHosts: (process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : true) as true | string[],
    },
  };
});
