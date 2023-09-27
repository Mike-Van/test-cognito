import { LicenseInfo } from '@mui/x-license-pro';

import { Amplify } from 'aws-amplify';
import { AppProps } from 'next/app';

LicenseInfo.setLicenseKey(
	'54b15a57982fcfd357f997b69b2e34f7T1JERVI6Mzk0NzQsRVhQSVJZPTE2Nzg2MTEzNDAwMDAsS0VZVkVSU0lPTj0x'
);

const host = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

Amplify.configure({
	Auth: {
		region: process.env.REGION,
		userPoolId: process.env.AUTH_USER_POOL_ID,
		userPoolWebClientId: process.env.AUTH_USER_POOL_CLIENT_ID,
		mandatorySignIn: false,
		oauth: {
			domain: `${process.env.COGNITO_DOMAIN_PREFIX}.auth.${process.env.REGION}.amazoncognito.com`,
			scope: ['email', 'profile', 'openid'],
			responseType: 'code',
			redirectSignIn: `${host}?postSignIn=true`,
			redirectSignOut: `${host}?postSignOut=true`,
		},
	},
	ssr: true,
});

const App = ({ Component, pageProps }: AppProps) => {
	return <Component {...pageProps} />;
};

export default App;
