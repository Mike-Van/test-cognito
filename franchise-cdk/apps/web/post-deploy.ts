import fs from 'fs';

import editDotENV from 'edit-dotenv';

const STACK_OUTPUT_PATH = '.sst/outputs.json';
const ENV_PATH = '../../config.env';

function readStackOutput() {
	const rawData = fs.readFileSync(STACK_OUTPUT_PATH).toString();
	const stack = JSON.parse(rawData || '{}');

	const stacksOutput = Object.keys(stack).reduce(
		(acc, key) => ({ ...acc, ...stack[key] }),
		{} as Record<string, string>
	);

	return stacksOutput || {};
}

async function handler() {
	const dotEnv = fs.readFileSync(ENV_PATH).toString();
	const data = readStackOutput();
	const changes = {
		SITE_URL: data.SiteUrl || '',
	};
	const newEnv = editDotENV(dotEnv, changes);
	fs.writeFileSync(ENV_PATH, newEnv);
}

handler();
