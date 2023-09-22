import { SSTConfig } from 'sst';


import { CognitoStack } from './stacks/CognitoStack';


export default {
	config() {
		return {
			name: 'test-franchise-graphql-api',
			region: process.env.REGION || 'us-east-1',
			stage: process.env.STAGE || 'dev',
		};
	},
	stacks(app) {
		
		
		app.stack(CognitoStack);
		
	},
} satisfies SSTConfig;
