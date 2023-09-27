/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-nocheck

const CFG = process.env || {};

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	productionBrowserSourceMaps: true,
	env: {
		REGION: CFG.REGION,
		AUTH_USER_POOL_ID: CFG.AUTH_USER_POOL_ID,
		AUTH_USER_POOL_CLIENT_ID: CFG.AUTH_USER_POOL_CLIENT_ID,
		COGNITO_DOMAIN_PREFIX: CFG.COGNITO_DOMAIN_PREFIX,
	},
};

module.exports = nextConfig;
