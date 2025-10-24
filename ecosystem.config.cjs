module.exports = {
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
      env: process.env,
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
      env: process.env,
    },
  ],
}
