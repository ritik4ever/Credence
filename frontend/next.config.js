/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
            crypto: false,
            stream: false,
            url: false,
            zlib: false,
            http: false,
            https: false,
            assert: false,
            os: false,
            path: false,
            "pino-pretty": false,
            "@react-native-async-storage/async-storage": false,
        }

        // Ignore warnings for optional dependencies
        config.ignoreWarnings = [
            { module: /node_modules\/pino/ },
            { module: /node_modules\/@metamask/ },
            { module: /node_modules\/@walletconnect/ },
            { module: /node_modules\/@reown/ },
        ]

        return config
    },
    experimental: {
        esmExternals: 'loose',
    },
}

module.exports = nextConfig