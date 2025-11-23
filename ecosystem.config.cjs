module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npm',
      args: 'run dev:sandbox',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=512'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '700M'
    }
  ]
}
