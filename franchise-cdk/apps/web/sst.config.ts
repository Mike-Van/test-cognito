import { SSTConfig } from 'sst';

import { WebStack } from './stacks/WebStack';
import { StorageStack } from './stacks/StorageStack';

const sst: SSTConfig = {
	config() {
		return {
			name: 'franchise-web',
			region: process.env.REGION,
			stage: process.env.STAGE,
		};
	},
	stacks(app) {
		app.stack(WebStack);
		app.stack(StorageStack);
	},
};

export default sst;
