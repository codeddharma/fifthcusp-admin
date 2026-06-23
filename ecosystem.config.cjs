module.exports = {
  apps: [
    {
      name: 'fifthcusp-admin',
      cwd: __dirname,
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/',
      },
      time: true,
    },
  ],
}
