module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npm',
      args: 'run start:sandbox',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
