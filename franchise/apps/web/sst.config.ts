import { SSTConfig } from 'sst';

import { WebStack } from './stacks/WebStack';
import { StorageStack } from './stacks/StorageStack';

const sst: SSTConfig = {
	config() {
		return {
			name: 'franchise-web',
			region: process.env.REGION || 'us-east-1',
			stage: process.env.STAGE || 'dev',
		};
	},
	stacks(app) {
		app.stack(WebStack);
		app.stack(StorageStack);
	},
};

export default sst;
