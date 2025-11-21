module.exports = {
    apps: [
        {
            name: "nuxt-irekeka",
            script: "node",
            args: ".output/server/index.mjs",
            watch: false,
            env: {
                PORT: 4100,
                NODE_ENV: "production"
            }
        }
    ]
};