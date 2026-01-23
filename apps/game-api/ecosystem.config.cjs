// ================================================================
// Production file used by pm2 from the Droplet (hosted server)
// ================================================================

module.exports = {
  apps: [
    {
      name: 'game-api',
      script: 'node ./dist/index.js',
      cwd: process.cwd(),
      env_file: '.env',
      instances: 1,
      max_memory_restart: '350M',
      out_file: '/home/deployer/logs/game-api-out.log',
      error_file: '/home/deployer/logs/game-api-err.log',
    },
  ],
};
