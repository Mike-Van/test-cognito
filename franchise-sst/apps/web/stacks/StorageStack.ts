import { Bucket, StackContext } from 'sst/constructs';

export function StorageStack({ stack }: StackContext) {
	const bucket = new Bucket(stack, 'assets');

	stack.addOutputs({
		AssetBucketName: bucket.bucketName,
	});

	return {
		bucket,
	};
}
