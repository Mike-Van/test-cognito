import React, { Fragment } from 'react'
import Head from 'next/head'
import { Amplify } from 'aws-amplify'

const host =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : ''

const authConfig = {
  region: process.env.REGION,
  userPoolId: process.env.USER_POOL_ID,
  userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID,
  oauth: {
    domain: `${process.env.COGNITO_DOMAIN_PREFIX}.auth.${process.env.REGION}.amazoncognito.com`,
    scope: ['email', 'profile', 'openid'],
    responseType: 'code',
    redirectSignIn: `${host}?postSignIn=true`,
    redirectSignOut: `${host}?postSignOut=true`
  }
}

Amplify.configure({
  Auth: authConfig,
  ssr: true
})

const App = ({ Component, pageProps }) => {
  return (
    <Fragment>
      <Head key='_app'>
        <meta
          name='viewport'
          content='initial-scale=1, viewport-fit=cover, width=device-width, user-scalable=no'
        />
        <meta
          name='apple-mobile-web-app-capable'
          content='yes'
        />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
      </Head>
      <Component {...pageProps} />
    </Fragment>
  )
}

export default App
