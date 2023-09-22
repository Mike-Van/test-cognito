/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	CfnUserPool,
	CfnUserPoolClient,
	CfnUserPoolDomain,
	CfnUserPoolIdentityProvider,
	OAuthScope,
	ProviderAttribute,
	UserPool,
	UserPoolClient,
	UserPoolClientIdentityProvider,
	UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { Function, StackContext, Cognito } from 'sst/constructs';

export function CognitoStack({ stack }: StackContext) {
	const postConfirmationFunc = new Function(stack, 'PostConfirmation', {
		handler: 'src/functions/postConfirmation/main.handler',
	});

	postConfirmationFunc.attachPermissions([
		'cognito-idp:AdminUpdateUserAttributes',
		'cognito-idp:AdminDeleteUser',
	]);

	// CFN
	// const userPool = new CfnUserPool(stack, 'UserPool', {
	// 	autoVerifiedAttributes: ['email'],
	// 	policies: {
	// 		passwordPolicy: {
	// 			minimumLength: 8,
	// 			requireLowercase: false,
	// 			requireNumbers: false,
	// 			requireUppercase: false,
	// 			requireSymbols: false,
	// 		},
	// 	},
	// 	usernameAttributes: ['email'],
	// 	schema: [
	// 		{
	// 			attributeDataType: 'String',
	// 			name: 'name',
	// 			required: false,
	// 			mutable: true,
	// 		},
	// 		{
	// 			attributeDataType: 'String',
	// 			name: 'id',
	// 			required: false,
	// 			mutable: true,
	// 		},
	// 	],
	// 	lambdaConfig: { postConfirmation: postConfirmationFunc.functionArn },
	// });
	// const usePoolDomain = new CfnUserPoolDomain(stack, 'AuthDomain', {
	// 	userPoolId: userPool.ref,
	// 	domain: process.env.COGNITO_DOMAIN_PREFIX!,
	// });
	// const userPoolIdentityProvider = new CfnUserPoolIdentityProvider(stack, 'Google', {
	// 	userPoolId: userPool.ref,
	// 	providerName: 'Google',
	// 	providerDetails: {
	// 		client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,
	// 		client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
	// 		authorize_scopes: 'profile email openid'
	// 	},
	// 	providerType: 'Google',
	// 	attributeMapping: {
	// 		email: 'email',
	// 		given_name: 'given_name',
	// 		family_name: 'family_name',
	// 		picture: 'picture',
	// 	},
	// });

	// const userPoolClient = new CfnUserPoolClient(stack, 'UserPoolClient', {
	// 	userPoolId: userPool.ref,
	// 	clientName: 'Web',
	// 	explicitAuthFlows: ['ALLOW_USER_SRP_AUTH', 'ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
	// 	preventUserExistenceErrors: 'ENABLED',
	// 	allowedOAuthFlowsUserPoolClient: true,
	// 	allowedOAuthFlows: ['code', 'implicit'],
	// 	allowedOAuthScopes: ['email', 'openid', 'profile'],
	// 	callbackUrLs: ['http://localhost:3000?postSignIn=true', 'http://localhost:3001?postSignIn=true'],
	// 	logoutUrLs: ['http://localhost:3000?postSignOut=true', 'http://localhost:3001?postSignOut=true'],
	// 	supportedIdentityProviders: ['Google'],
	// });

	// stack.addOutputs({
	// 	AuthUserPoolId: userPool.ref,
	// 	AuthUserPoolClientId: userPoolClient.ref,
	// 	PostConfirmationFunction: postConfirmationFunc.functionArn,
	// });

	// return { userPool, userPoolClient };

	// CDK
	// const userPool = new UserPool(stack, 'UserPool', {
	// 	autoVerify: { email: true },
	// 	passwordPolicy: {
	// 		minLength: 8,
	// 		requireLowercase: false,
	// 		requireDigits: false,
	// 		requireUppercase: false,
	// 		requireSymbols: false,
	// 	},
	// 	customAttributes: {
	// 		id: {
	// 			bind: () => ({
	// 				mutable: true,
	// 				dataType: 'String',
	// 				stringConstraints: { minLen: 0, maxLen: 2048 },
	// 			}),
	// 		},
	// 	},
	// 	lambdaTriggers: {
	// 		postConfirmation: postConfirmationFunc,
	// 	},
	// });
	// userPool.addDomain('AuthDomain', {
	// 	cognitoDomain: {
	// 		domainPrefix: process.env.COGNITO_DOMAIN_PREFIX!,
	// 	},
	// });
	// const userPoolClient = new UserPoolClient(stack, 'UserPoolClient', {
	// 	preventUserExistenceErrors: true,
	// 	supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
	// 	userPool,
	// 	userPoolClientName: 'Web',
	// 	authFlows: {
	// 		userSrp: true,
	// 		userPassword: true,
	// 		// adminUserPassword: true,
	// 		// custom: true,
	// 	},
	// 	oAuth: {
	// 		flows: {
	// 			authorizationCodeGrant: true,
	// 			implicitCodeGrant: true,
	// 		},
	// 		scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
	// 		callbackUrls: ['http://localhost:3000?postSignIn=true', 'http://localhost:3001?postSignIn=true'],
	// 		logoutUrls: ['http://localhost:3000?postSignOut=true', 'http://localhost:3001?postSignOut=true'],
	// 	},
	// });

	// const userPoolIdentityProviderGoogle = new UserPoolIdentityProviderGoogle(stack, 'Google', {
	// 	clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
	// 	clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
	// 	userPool: userPool,
	// 	scopes: ['profile', 'email', 'openid'],
	// 	attributeMapping: {
	// 		email: ProviderAttribute.GOOGLE_EMAIL,
	// 		givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
	// 		familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
	// 		profilePicture: ProviderAttribute.GOOGLE_PICTURE,

	// 		// birthdate: ProviderAttribute.GOOGLE_BIRTHDAYS,
	// 		// gender: ProviderAttribute.GOOGLE_GENDER,
	// 		// fullname: ProviderAttribute.GOOGLE_NAME,
	// 		// nickname: ProviderAttribute.GOOGLE_NAMES,
	// 		// phoneNumber: ProviderAttribute.GOOGLE_PHONE_NUMBERS,
	// 	},
	// });
	// userPoolClient.node.addDependency(userPoolIdentityProviderGoogle);

	// SST
	const auth = new Cognito(stack, 'Auth', {
		triggers: {
			postConfirmation: postConfirmationFunc,
		},
		cdk: {
			userPool: {
				autoVerify: {
					email: true,
				},
				customAttributes: {
					id: {
						bind: () => ({
							mutable: true,
							dataType: 'String',
							stringConstraints: { minLen: 0, maxLen: 2048 },
						}),
					},
				},
				passwordPolicy: {
					minLength: 8,
					requireLowercase: true,
					requireDigits: true,
					requireUppercase: true,
					requireSymbols: true,
				},
			},
			userPoolClient: {
				userPoolClientName: 'web',
				preventUserExistenceErrors: true,
				authFlows: {
					userSrp: true,
					userPassword: true,
					// adminUserPassword: true,
					// custom: true,
				},
				supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
				oAuth: {
					flows: {
						authorizationCodeGrant: true,
						implicitCodeGrant: true,
					},
					scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
					callbackUrls: ['http://localhost:3000?postSignIn=true', 'http://localhost:3001?postSignIn=true'],
					logoutUrls: ['http://localhost:3000?postSignOut=true', 'http://localhost:3001?postSignOut=true'],
				},
			},
		},
	});

	if (!process.env.COGNITO_DOMAIN_PREFIX) throw new Error('Please set COGNITO_DOMAIN_PREFIX');
	auth.cdk.userPool.addDomain('AuthDomain', {
		cognitoDomain: { domainPrefix: process.env.COGNITO_DOMAIN_PREFIX },
	});

	if (!process.env.GOOGLE_AUTH_CLIENT_ID || !process.env.GOOGLE_AUTH_CLIENT_SECRET)
		throw new Error('Please set GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET');

	const provider = new UserPoolIdentityProviderGoogle(stack, 'Google', {
		clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
		clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
		userPool: auth.cdk.userPool,
		scopes: ['profile', 'email', 'openid'],
		attributeMapping: {
			email: ProviderAttribute.GOOGLE_EMAIL,
			givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
			familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
			profilePicture: ProviderAttribute.GOOGLE_PICTURE,

			// birthdate: ProviderAttribute.GOOGLE_BIRTHDAYS,
			// gender: ProviderAttribute.GOOGLE_GENDER,
			// fullname: ProviderAttribute.GOOGLE_NAME,
			// nickname: ProviderAttribute.GOOGLE_NAMES,
			// phoneNumber: ProviderAttribute.GOOGLE_PHONE_NUMBERS,
		},
	});
	auth.cdk.userPoolClient.node.addDependency(provider);

	stack.addOutputs({
		AuthUserPoolId: auth.userPoolId,
		AuthUserPoolClientId: auth.userPoolClientId,
	});

	return { auth };
}
