const isProduction = process.env.NODE_ENV === 'production'

const developmentConfig = {
  apps: [
    {
      name: 'frontend',
      cwd: '/usr/src',
      script: 'npm',
      args: 'run dev:frontend',
      watch: false,
      error_file: '/apps/logs/frontend-error.log',
      out_file: '/apps/logs/frontend-out.log',
      log_file: '/apps/logs/frontend-combined.log',
    },
    {
      name: 'backend',
      script: 'npm',
      args: 'run dev:backend',
      cwd: '/usr/src',
      watch: ['apps/backend'],
      ignore_watch: ['**/node_modules/**', '**/dist/**', '**/logs/**'],
      error_file: '/apps/logs/backend-error.log',
      out_file: '/apps/logs/backend-out.log',
      log_file: '/apps/logs/backend-combined.log',
    },
  ],
}

const productionConfig = {
  apps: [
    {
      name: 'backend',
      script: './apps/backend/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/apps/logs/backend-error.log',
      out_file: '/apps/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
    {
      name: 'frontend',
      script: './apps/frontend/.output/server/index.mjs',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/apps/logs/frontend-error.log',
      out_file: '/apps/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
}

module.exports = isProduction ? productionConfig : developmentConfig
