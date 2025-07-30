/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Resolve Node.js modules for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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
        util: false,
        buffer: false,
        process: false,
        events: false,
        querystring: false,
        punycode: false,
        string_decoder: false,
        constants: false,
        domain: false,
        dns: false,
        dgram: false,
        child_process: false,
        cluster: false,
        module: false,
        vm: false,
        worker_threads: false,
        undici: false,
      };

      // Ignore problematic modules completely
      config.module.rules.push({
        test: /node_modules\/.*undici.*/,
        use: 'null-loader',
      });

      // Alias undici to false
      config.resolve.alias = {
        ...config.resolve.alias,
        undici: false,
      };
    }

    return config;
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

module.exports = nextConfig; 