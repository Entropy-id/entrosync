module.exports = {
  apps: [
    {
      name: "entrosync",
      script: ".output/server/index.mjs",
      env_file: ".env",
    },
  ],
};
