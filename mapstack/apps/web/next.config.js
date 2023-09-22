

const isDevelopment = process.env?.NODE_ENV === 'development'

// Github Issues:
// - https://github.com/vercel/next.js/issues/40155
// - https://github.com/shadowwalker/next-pwa/issues/398#issuecomment-1236069816
const withPWA = require('next-pwa')({
  dest: 'public',
  swSrc: 'service-worker.js',
  disable: isDevelopment,
  buildExcludes: [/middleware-manifest.json$/]
})

const environment = {
  USER_POOL_ID: process.env.USER_POOL_ID,
  USER_POOL_WEB_CLIENT_ID: process.env.USER_POOL_WEB_CLIENT_ID,
  COGNITO_DOMAIN_PREFIX: process.env.COGNITO_DOMAIN_PREFIX,
  DOMAIN_NAME: process.env.DOMAIN_NAME,
  UUID: process.env.UUID,
  REGION: process.env.REGION,
  GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  ENABLE_REDUX_DEV_TOOLS: process.env.ENABLE_REDUX_DEV_TOOLS
}

/**
 * @type {import('next').NextConfig}
 **/
const defaultConfigs = {
  optimizeFonts: false,
  productionBrowserSourceMaps: !isDevelopment,
  webpack: (config, context) => {
    
    return config
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.dicebear.com/api']
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': ['node_modules/@swc/**', 'node_modules/@esbuild/**']
    }
  }
}

const productionConfigs = {
  async headers() {
    return [
      {
        // matching all API routes
        source: '/data/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ]
  }
}

let nextConfigs = {
  env: environment,
  ...defaultConfigs,
  ...(!isDevelopment ? productionConfigs : {})
}

nextConfigs = !isDevelopment ? withPWA(nextConfigs) : nextConfigs

module.exports = nextConfigs
