module.exports = {
  apps: [
    {
      name: 'sugarmimo-api',
      script: 'dist/src/main.js',
      cwd: '/var/www/sugarmimo-backend',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '768M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
