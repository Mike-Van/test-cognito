import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class GraphqlApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const postConfirmationFunc = new lambda.NodejsFunction(this, 'PostConfirmation', {
    //   handler: './postConfirmationFunction',
    //   bundling: {
    //     preCompilation: true
    //   }
    // });
    // postConfirmationFunc.attachPermissions([
    //   'cognito-idp:AdminUpdateUserAttributes',
    //   'cognito-idp:AdminDeleteUser',
    // ]);
  
    const userPool = new cognito.CfnUserPool(this, 'UserPool', {
      autoVerifiedAttributes: ['email'],
      policies: {
        passwordPolicy: {
          minimumLength: 8,
          requireLowercase: false,
          requireNumbers: false,
          requireUppercase: false,
          requireSymbols: false,
        },
      },
      usernameAttributes: ['email'],
      schema: [
        {
          attributeDataType: 'String',
          name: 'name',
          required: false,
          mutable: true,
        },
        {
          attributeDataType: 'String',
          name: 'id',
          required: false,
          mutable: true,
        },
      ],
      // lambdaConfig: { postConfirmation: postConfirmationFunc.functionArn },
    });
    
    const usePoolDomain = new cognito.CfnUserPoolDomain(this, 'AuthDomain', {
      userPoolId: userPool.ref,
      domain: process.env.COGNITO_DOMAIN_PREFIX!,
    });
    // userPool.node.addDependency(usePoolDomain)
    
    const userPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'Google', {
      userPoolId: userPool.ref,
      providerName: 'Google',
      providerDetails: {
        client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,
        client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
        authorize_scopes: 'profile email openid'
      },
      providerType: 'Google',
      attributeMapping: {
        email: 'email',
        given_name: 'given_name',
        family_name: 'family_name',
        picture: 'picture',
      },
    });
    
    const userPoolClient = new cognito.CfnUserPoolClient(this, 'UserPoolClient', {
      userPoolId: userPool.ref,
      clientName: 'Web',
      explicitAuthFlows: ['ALLOW_USER_SRP_AUTH', 'ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
      preventUserExistenceErrors: 'ENABLED',
      allowedOAuthFlowsUserPoolClient: true,
      allowedOAuthFlows: ['code', 'implicit'],
      allowedOAuthScopes: ['email', 'openid', 'profile'],
      callbackUrLs: ['http://localhost:3000?postSignIn=true', 'http://localhost:3001?postSignIn=true'],
      logoutUrLs: ['http://localhost:3000?postSignOut=true', 'http://localhost:3001?postSignOut=true'],
      supportedIdentityProviders: ['Google'],
    });
    userPoolClient.node.addDependency(userPoolIdentityProvider);
 
    
    new cdk.CfnOutput(this, 'AuthUserPoolId', {
      value: userPool.ref,
      description: 'The name of the s3 bucket',
      exportName: 'AuthUserPoolId',
    });
    new cdk.CfnOutput(this, 'AuthUserPoolClientId', {
      value: userPoolClient.ref,
      description: 'The name of the s3 bucket',
      exportName: 'AuthUserPoolClientId',
    });
  }
}
