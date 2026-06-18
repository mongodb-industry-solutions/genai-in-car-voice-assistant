/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config, isServer) => {
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true, // Enable WebAssembly in Webpack
            topLevelAwait: true,
        };

        // bson.mjs (via @powersync/web) relies on top-level await. Declare that the
        // output target supports async functions so webpack emits a valid async
        // wrapper instead of warning that the generated async/await may not run.
        config.output = {
            ...config.output,
            environment: {
                ...config.output?.environment,
                asyncFunction: true,
            },
        };

        // For Web Workers, ensure proper file handling
        if (!isServer) {
            config.module.rules.push({
                test: /\.wasm$/,
                type: "asset/resource", // Adds WebAssembly files to the static assets
            });
        }

        return config;
    }
};

export default nextConfig;
