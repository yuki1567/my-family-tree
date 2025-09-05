module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/usr/src",
      script: "npm",
      args: "run dev:frontend",
      watch: false,
      error_file: "/apps/logs/frontend-error.log",
      out_file: "/apps/logs/frontend-out.log",
      log_file: "/apps/logs/frontend-combined.log",
    },
    // {
    //   name: "backend",
    //   script: "npm",
    //   args: "run dev:backend",
    //   cwd: "/usr/src",
    //   watch: false,
    //   error_file: "/apps/logs/backend-error.log",
    //   out_file: "/apps/logs/backend-out.log",
    //   log_file: "/apps/logs/backend-combined.log",
    // },
  ],
};
