module.exports = {
  apps: [
    {
      name: 'frontend-prod',
      script: 'node',
      args: 'apps/frontend/.output/server/index.mjs',
      cwd: '/usr/src',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'backend-prod',
      script: 'node',
      args: 'apps/backend/dist/server.js',
      cwd: '/usr/src',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
}
