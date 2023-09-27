import fs from 'fs';

import editDotENV from 'edit-dotenv';

const STACK_OUTPUT_PATH = '.sst/outputs.json';
const ENV_PATH = '../../config.env';

function readStackOutput() {
	const rawData = fs.readFileSync(STACK_OUTPUT_PATH).toString();
	const stack = JSON.parse(rawData || '{}');
	console.log('stack', stack);
	return stack;
}

async function handler() {
	const dotEnv = fs.readFileSync(ENV_PATH).toString();
	const data = readStackOutput();

	const changes = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const properties = data[key];

			if ('AuthUserPoolId' in properties) {
				changes['AUTH_USER_POOL_ID'] = properties.AuthUserPoolId;
			}

			if ('AuthUserPoolClientId' in properties) {
				changes['AUTH_USER_POOL_CLIENT_ID'] = properties.AuthUserPoolClientId;
			}
		}
	}

	const newEnv = editDotENV(dotEnv, changes);
	fs.writeFileSync(ENV_PATH, newEnv);
}

handler();
