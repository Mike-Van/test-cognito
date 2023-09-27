import { NextjsSite, NextjsSiteProps, StackContext } from 'sst/constructs';
import { Duration } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import {
	CachePolicy,
	CacheQueryStringBehavior,
	CacheHeaderBehavior,
	CacheCookieBehavior,
} from 'aws-cdk-lib/aws-cloudfront';

export function WebStack({ stack }: StackContext) {
	const props: NextjsSiteProps = {
		runtime: 'nodejs18.x',
		memorySize: '2048 MB',
		timeout: '30 seconds',
		environment: {},
	};

	if (process.env.SKIP_CUSTOM_DOMAIN !== 'true') {
		const hostedZone = HostedZone.fromLookup(stack, 'HostedZone', {
			domainName: 'mangomap.com',
		});

		const certificate = new Certificate(stack, 'Certificate', {
			domainName: 'mangomap.com',
			subjectAlternativeNames: ['*.mangomap.com'],
			validation: CertificateValidation.fromDns(hostedZone),
		});

		props.customDomain = {
			domainName: process.env.DOMAIN_NAME ? process.env.DOMAIN_NAME : 'mangomap.com',
			cdk: {
				hostedZone,
				certificate,
			},
		};

		const serverCachePolicy = new CachePolicy(stack, 'ServerCache', {
			queryStringBehavior: CacheQueryStringBehavior.all(),
			cookieBehavior: CacheCookieBehavior.none(),
			headerBehavior: CacheHeaderBehavior.allowList(
				'CloudFront-Is-Desktop-Viewer',
				'CloudFront-Is-Mobile-Viewer',
				'CloudFront-Is-Tablet-Viewer',
				'CloudFront-Viewer-Country',
				'CloudFront-Viewer-Latitude',
				'CloudFront-Viewer-Longitude',
				'CloudFront-Viewer-Time-Zone',
				'CloudFront-Viewer-City'
			),
			defaultTtl: Duration.days(0),
			minTtl: Duration.days(0),
			maxTtl: Duration.days(365),
			enableAcceptEncodingBrotli: true,
			enableAcceptEncodingGzip: true,
		});
		props.cdk = { serverCachePolicy };
	}

	const site = new NextjsSite(stack, 'Web', props);

	stack.addOutputs({
		SiteUrl: site.url,
	});
}
