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

### OAuth Google Configuration

Instructions: https://aws.amazon.com/premiumsupport/knowledge-center/cognito-google-social-identity-provider/

### Developer Sub Domain

For development you should run a full build on your personal AWS account.

As serverless is charged per request, and AWS free-tier includes 1,000,000 requests per month, you will not be charged.

To configure your personal sub-domain. E.g.

    franchise-chris.mangomap.com

You will need to create a new Hosted Zone in AWS:

    Run: Route 53 > Hosted Zones > Create Hosted Zones
    CREATE: mangomap.com DO NOT CREATE: franchise-chris.mangomap.com

Then you will need to copy the four NS records and send them to Chris.

Next you need to run the deployment:

    yarn deploy

This will use the AWS credentials created in the earlier step. The deployment will return an error:

    Error: Your newly validated AWS ACM Certificate is taking a while to register as valid.  Please try running this component again in a few minute

This is because it creates an SSL certificate and can't confirm that you are the owner of the domain mangomap.com.

To fix this error you need to confirm you are the owner of the domain by going to:

    AWS Certificate Manager > Certificates > mangomap.com

Then in the domains section, copy the "CNAME name" and "CNAME value" for mangomap.com and send it to Chris.

### DevOp Sub Domain Configuration

Steps to be performed by Chris

#### Add NS record to mangomap.com

The NS records for mangomap.com are in the AWS Mango Prod account, we need to redirect NS lookups for sub domains to the AWS account for the sub-domain.

To do that go to:

    Route53 > Hosted Zones > mangomap.com

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

In addition to values added by the you, the system will also populate this file with additional values during a deploy.

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
