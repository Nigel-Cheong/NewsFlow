import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // You might need to add other remote patterns here if you have images from other domains
    ],
  },
  // Add the webpack configuration here
  webpack(config, { isServer }) {
    // Externalize OpenTelemetry SDK and related Genkit packages
    // This addresses the '@opentelemetry/exporter-jaeger' module not found error
    // and the 'Critical dependency' warning by preventing Webpack from bundling them.
    // We only apply this for the server-side build, as these are Node.js specific modules.
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@opentelemetry/sdk-node",
        // Include other @genkit-ai packages if you face similar issues with them,
        // particularly if they are Node.js-specific and not meant for client-side bundling.
        "@genkit-ai/firebase", // Recommended if you are using Genkit with Firebase [14]
      ];
    }


    // Alias 'handlebars' to its CommonJS runtime version
    // This resolves the 'require.extensions is not supported by webpack' warning.
    config.resolve.alias = {
      ...config.resolve.alias,
      "handlebars/runtime": "handlebars/dist/cjs/handlebars.runtime",
      "handlebars": "handlebars/dist/cjs/handlebars", // Use the CommonJS build
    };

    return config;
  },
  // If your project is in a subdirectory (e.g., a monorepo), you might need to
  // adjust the outputFileTracingRoot. For example, if 'NewsFlow' is directly
  // in your root and not a subfolder, you might not need this or adjust it to './'.
  // outputFileTracingRoot: '../../', // Example for a project two levels deep
};

export default nextConfig;