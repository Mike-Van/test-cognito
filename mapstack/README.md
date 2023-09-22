# Monorepo

We are using yarn workspaces, which builds a sigle environment for all packages. To install a dependency:

    cd packages/{my-package}
    yarn add {my-dependency}

For dev dependencies:

    cd packages/{my-package}
    yarn add -D {my-dependency}

# Getting Started

## AWS Config

### Account and Credentials

Create a new AWS account and create new credentials:

    https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html#id_root-user_manage_add-key

Save the credentials to your machine:

    https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

### oAuth

#### oAuth Credentials

Instructions: https://aws.amazon.com/premiumsupport/knowledge-center/cognito-google-social-identity-provider/

Special care during setup:

    Your yourDomainPrefix is "mapstack-{developer-sub}", e.g. "mapstack-chris"
    The region is the region set in your ~/.aws/config, e.g. us-east-1

Once complete add to config.env:

    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=

#### oAuth Custom Subdomain

There are the steps to allow use of our own domain with Cognito. The auth domain will use the following structure "auth.mapstack.io", "auth-staging.mapstack.io", "auth-chris.mapstack.io"

Checklist:

    - Chris: adds NS for auth sub-domain to production account (e.g. auth-chris.mapstack.io)
    - Dev: run deployment (wait 15 minutes)
    - Dev: URL from UserPool -> credentials to A record (e.g. auth-chris.mapstack.io)
    - Dev: Google API Console -> Credentials updated URLS to use sub-domain (e.g. auth-chris.mapstack.io)
    - Dev: add CERTIFICATE_ARN to config.env (get from AWS Certificates Manager)

The steps are in this video: https://www.loom.com/share/dfdb412dea2149a5b48a04054e034be7

### Developer Sub Domain

For development you should run a full build on your personal AWS account.

As serverless is charged per request, and AWS free-tier includes 1,000,000 requests per month, you will not be charged.

To configure your personal sub-domain. E.g.

    chris.mapstack.io

You will need to create a new Hosted Zone in AWS:

    Run: Route 53 > Hosted Zones > Create Hosted Zones
    CREATE: mapstack.io DO NOT CREATE: chris.mapstack.io

Then you will need to copy the four NS records and send them to Chris.

Next you need to run the deployment:

    yarn deploy

This will use the AWS credentials created in the earlier step. The deployment will return an error:

    Error: Your newly validated AWS ACM Certificate is taking a while to register as valid.  Please try running this component again in a few minute

This is because it creates an SSL certificate and can't confirm that you are the owner of the domain mapstack.io.

To fix this error you need to confirm you are the owner of the domain by going to:

    AWS Certificate Manager > Certificates > mapstack.io

Then in the domains section, copy the "CNAME name" and "CNAME value" for mapstack.io and send it to Chris.

### DevOp Sub Domain Configuration

Steps to be performed by Chris

#### Add NS record to mapstack.io

The NS records for mapstack.io are in the AWS Mapstack Prod account, we need to redirect NS lookups for sub domains to the AWS account for the sub-domain.

To do that go to:

    Route53 > Hosted Zones > mapstack.io

Then we need add the new NS details (replace "chris" with sub-domain value, and nameservers with those provided by dev):

    $TTL    3600
    chris     IN     NS     ns-545.awsdns-04.net.
    chris     IN     NS     ns-1103.awsdns-09.org.
    chris     IN     NS     ns-1765.awsdns-28.co.uk.
    chris     IN     NS     ns-164.awsdns-20.com.

## Global Environment (.env)

1. Copy config-template.env to config.env (cp config-template.env config.env).
2. Then complete the required fields

The config.env file contains configuration settings used locally in development. For production and staging these variables will be set in Bitbucket Pipelines environment variables.

In addition to values added by the you, the system will also populate this file with additional values during a deploy. For example the URL for the GraphQL endpoint.

### Using Global Environment (.env)

There are three places that we will need to access these variables:

- Example React apps (must start with REACT*APP*\*)
- The Next JS apps (must start with NEXT*PUBLIC*\*)
- Jest tests

For React and NextJS we inject the variables in at start and build time using the 'env-cmd' CLI tool in the script section of our package.json files, e.g:

    env-cmd --silent -f $( find-up config.env ) react-scripts start
    env-cmd --silent -f $( find-up config.env ) react-scripts build

As these are injected at build time rather than run time, if any environment variable changes, you will need to run the build or deployment again in order to update the value.

For tests with Jest we inject the environment variables by defining a setup file in jest.config.js and then having that file (setup-tests.js) load the global config.env file using the 'dot-env' package.

NextJS when deployed to Serverless doesn't work with 'env-cmd' in the package.json deploy script and instead requires the environment variables to be contained in a file called '.env.local'. So for NextJS when the deploy script is run, we copy the global .env file to the NextJS .env.local:

    "deploy": "cp $( find-up config.env ) .env.local && next build && sls"

## Deployment

Here are the steps required to deploy and test your setup.

1. Run 'sudo yarn setup' // this step is to configure the local environment
2. Run 'yarn install'
3. Ran 'yarn build'
4. Run 'yarn test' // this will install it in your AWS account (providing .aws/credentials are set)
5. Run 'yarn deploy' // this will install test fixtures and ensure everything is running

### Debugging Serverless Deployments

On Long's machine we had the following error during deployment:

    serverless nextjs NoSuchDistribution: The specified distribution does not exist.

On Mike's machine we had this problem:

    ERR! OMG CMake executable is not found. Please use your system's package manager to install it, or you can get installers from there: http://cmake.org.

This was resolved by deleting the $HOME/.serverless directory. This then produced a new error installing the the nextjs plugin. This was resolved by manually installing the nextjs plugin:

    brew install cmake # if you get Cmake error as above, run this first, otherwise skip this step
    npm install @sls-next/serverless-component@3.7.0 --prefix $HOME/.serverless/components/registry/npm/@sls-next/serverless-component@3.7.0

This is also caused by manually delete S3 from aws. To resolve this delete .serverless and .serverless_nextjs in apps/web.

See: https://github.com/serverless-nextjs/serverless-next.js/issues/2100

### Resetting Serverless Deployment

At times your local project and your serverless deployment to your AWS account may find itself in an inconsistant state. If this happens the best strategy is to delete your serverless deployment and deploy again.

Here is a video that goes through this process step by step:

https://www.loom.com/share/6c15909786c549689101bd374b3a5562

### Clear OpenSearch Indices

OpenSearch records can't be cleared from the console. If there is a need to clear the records then it must be done via the api.

First create a master user for OpenSearch (use the internal user database instructions):

https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-enabling

Use the API to clear the data:

    POST https://search-mapstack-search-mg5jplrmc6hcly5xtnxvyukpkq.us-east-1.es.amazonaws.com/maps/_delete_by_query

Set the HTTP Basic user and password with the details for the master user. For the body use this:

    {
        "query" : {
            "match_all" : {}
        }
    }

## Mango Monorepo Architecture

See: https://mangowiki.atlassian.net/wiki/spaces/HOME/pages/1121320961/Monorepo+Architecture

## JavaScript

All packages use ES6 except those that are Serverless v2 deployments, in which case they use CommonJS. It is planned to migrate the serverless CommonJS packages over to ES6.

## Monorepo Package and App asset storage

Each package and app in the monorepo should store its own static assets.

This means static assets for specific packages should not be stored in /apps/web/public/.

This was resolved by transforming reference of assets in each package to be in term of URL which is recognized by browser.
It uses rollup and rollup plugin [@web/rollup-plugin-import-meta-assets](https://modern-web.dev/docs/building/rollup-plugin-import-meta-assets/) for bundling js files, copying assets/{files} and transforming assets reference to {my-package}/dist folder.

To do that:

    cd packages/{my-package}
    yarn add -D @web/rollup-plugin-import-meta-assets

Create a rollup.config.js configuration file and import the plugin:

    import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets'

    export default {
    	input: 'src/index.js',
    	output: {
    		dir: 'output',
    		format: 'es',
    		},
    	plugins: [importMetaAssets()],
    }

#### Example of usage:

Source directory ({my-package}/src):

    .
    ├── assets
    	│   └── image
    	│       └── the-image.png
    ├── App
    	│   └── index.js

With index.js containing this:

    const imageUrl = new URL('../assets/image/the-image.svg', import.meta.url).pathname

Output directory ({my-package}/dist):

_NOTE: files in /assets will be copied to node dev server (Ex. http://localhost:3000/\_next/static/media/the-image-{random-id}.png) or S3 buckets in deployment._

    .
    ├── assets
    │   └── the-image-{random-id}.png
    └── bundle.js

With bundle.js containing this:

    const imageUrl = new URL(new URL('assets/the-image-{random-id}.png', import.meta.url).href, import.meta.url).pathname

## AWS Coupling

With a monorepo architecture various packages/apps are loosly coupled and therefore require information about other packages/apps in order to run.

### Clientside

On the clientside we handle this with config.env. Each package exposes shared variables by writing them to the config.env at deploy time.

### Serverside

Here we have three ways to share information between parts of the system, either Cloudformation references, AWS SSM Parameter Store or SecretsManager.

Cloudformation references are best when the values are required at build time. The common CloudFormation reference types are:

    - !Ref : this points to other definitions in the same CloudFormation docs
    - !GetAttr : this can get an attribute of other definitions in the same CloudFormation docs
    - !Import : this can access variables from other previously created stacks providing the required value has been exported

SSM Parameter Store is best when the values are required at runtime or the values might change:

    - URLs
    - None secure API keys
    - ARNs

SecretsManager is best used for secure values such as:

    - Passwords
    - Secure API keys
    - Certificates

### Amazon SES

#### Introduction

After it is deployed, you will have already setup SES, but AWS puts us in the "Sandbox Environment" to prevent us from doing harm to the service.
We could remove this restriction by applying for production access. The process can take up to 48 hours.

Setting up the domain is crucial because we are able to use [placeholder]@mapstack.io to send the email to anyone. If we don't have domain verification, we have to verify the email that we are trying to use as the sender.

If you are in the sandbox environment, you have to verify every email you want to test with. For example, I want to send the email from
I have to verify both emails in order for SES to work.

[More](https://docs.aws.amazon.com/console/ses/production-access)

#### Domain Verification

For Developer, after deployed you need to copy all the CName records generated by the ses-setup package to Chris.

To do that go to:

    Amazon SES > Configuration: Verified identities > Create identity

Then do as follows:

- For Identity type form, choose 'Domain'
- For Domain form, type 'mapstack.io'
- Then click on 'Create Identity'

After it created, go to:

    Amazon SES > Configuration: Verified identities > mapstack.io

In the 'DomainKeys Identified Mail (DKIM)', copy all the CName record and send them to Chris.

| Type  | Name                       | Value                 |
| ----- | -------------------------- | --------------------- |
| CName | \*.\_domainkey.mapstack.io | \*.dkim.amazonses.com |
| CName | \*.\_domainkey.mapstack.io | \*.dkim.amazonses.com |
| CName | \*.\_domainkey.mapstack.io | \*.dkim.amazonses.com |

Steps to be performed by Chris

To do that go to:

    Route53 > Hosted Zones > mapstack.io

Then add the CName records sent by the developer to the 'mapstack.io'

### GA-4 custom event

Instructions: https://drive.google.com/drive/u/1/folders/1BHv2uleZtL3JPVhuKCAUgE1oDumMiG_n

### Git LFS

#### Installation

We can go to official website [GIT LFS](https://git-lfs.com/) for download and install or using Homebrew (MacOS)

    brew install git-lfs

#### Initialization

Inside mapstack root directory run:

    git lfs install

#### Usage

Git lfs will link to git commands (status, commit, pull, push, fetch, ...), so just use the existing git commands

    Add tracking file
    git lfs track "*.geojson"

    Remove tracking file
    git lfs untrack "*.ogg"

[More](https://www.atlassian.com/git/tutorials/git-lfs)
