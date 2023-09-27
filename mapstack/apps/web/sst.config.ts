import { SSTConfig } from 'sst'
import { NextjsSite } from 'sst/constructs'
import { Duration } from 'aws-cdk-lib'

import {
  Certificate,
  CertificateValidation
} from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import {
  CachePolicy,
  CacheQueryStringBehavior,
  CacheHeaderBehavior,
  CacheCookieBehavior
} from 'aws-cdk-lib/aws-cloudfront'

const { REGION, NEXT_ENV, WARM_WEB, WARM_WEB_COUNT } = process.env

const getWarmCount = () => {
  return WARM_WEB !== 'true' ? 0 : Number(WARM_WEB_COUNT ?? 0)
}

const sst: SSTConfig = {
  config() {
    return {
      name: 'Web',
      region: REGION,
      stage: NEXT_ENV
    }
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const { DOMAIN_NAME = 'mapstack.io' } = process.env

      const hostedZone = HostedZone.fromLookup(stack, 'HostedZone', {
        domainName: 'mapstack.io'
      })

      const certificate = new Certificate(stack, 'Certificate', {
        domainName: 'mapstack.io',
        subjectAlternativeNames: ['*.mapstack.io'],
        validation: CertificateValidation.fromDns(hostedZone)
      })

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
        enableAcceptEncodingGzip: true
      })

      const site = new NextjsSite(stack, 'Web', {
        runtime: 'nodejs18.x',
        memorySize: '2048 MB',
        timeout: '30 seconds',
        warm: getWarmCount(),
        customDomain: {
          domainName: DOMAIN_NAME,
          cdk: {
            hostedZone,
            certificate
          }
        },
        cdk: {
          serverCachePolicy
        },
        environment: {}
      })

      stack.addOutputs({
        SiteUrl: site.url
      })
    })
  }
}

export default sst
