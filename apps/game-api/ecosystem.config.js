// ================================================
// This file is to be used by pm2 from the Droplet
// ================================================

module.exports = {
  apps: [
    {
      name: 'game-api',
      script: './apps/game-api/dist/index.js',
      cwd: process.cwd(),
      env_file: '.env',
      instances: 1,
      max_memory_restart: '350M',
      out_file: '/home/deployer/logs/game-api-out.log',
      error_file: '/home/deployer/logs/game-api-err.log',
    },
  ],
};
