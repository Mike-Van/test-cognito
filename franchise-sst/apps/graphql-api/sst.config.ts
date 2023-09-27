import { SSTConfig } from 'sst';


import { CognitoStack } from './stacks/CognitoStack';


export default {
	config() {
		return {
			name: 'test-franchise-graphql-api',
			region: process.env.REGION,
			stage: process.env.STAGE,
		};
	},
	stacks(app) {
		
		
		app.stack(CognitoStack);
		
	},
} satisfies SSTConfig;
