module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                "@img": require("path").resolve(__dirname, "public", "img"),
            }
        },
    }
};
