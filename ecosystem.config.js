const { watch } = require("fs");

module.exports = {
   
    apps: [
        {
            name: 'main',
            script: 'dist/main.js',
            watch: true,
            env: {
                NODE_ENV: 'development',
                PORT:4000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 4000,
            },
            
        },
    ],

    
};